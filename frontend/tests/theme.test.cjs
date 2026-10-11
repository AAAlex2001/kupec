const assert = require("node:assert/strict");
const { readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const sass = require("sass");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "src");

function loadModule(file, globals = {}, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected import: ${name}`);
      return dependencies[name];
    },
    ...globals,
  });
  return exports;
}

const config = loadModule(path.join(source, "shared/lib/theme/config.ts"));
const { THEME_INIT_SCRIPT } = loadModule(
  path.join(source, "shared/lib/theme/init-script.ts"),
  {},
  { "./config": config },
);

function environment(stored, blocked = false) {
  const events = new Map();
  const element = { dataset: {} };
  const meta = {};
  const storage = {
    getItem: () => {
      if (blocked) throw new Error("Storage unavailable");
      return stored;
    },
    setItem: (_, value) => {
      if (blocked) throw new Error("Storage unavailable");
      stored = value;
    },
  };
  const globals = {
    localStorage: storage,
    getComputedStyle: () => ({
      getPropertyValue: () => element.dataset.theme === "dark" ? "#15191f" : "#ffffff",
    }),
    Event,
    document: {
      documentElement: element,
      querySelector: () => meta,
    },
    window: {
      addEventListener: (name, listener) => events.set(name, listener),
      removeEventListener: (name) => events.delete(name),
      dispatchEvent: (event) => events.get(event.type)?.(event),
    },
  };
  const store = loadModule(path.join(source, "shared/lib/theme/store.ts"), globals, {
    "./config": config,
    "@/shared/lib/report-error": { reportError: () => {} },
    react: { useSyncExternalStore: (_, snapshot) => snapshot() },
  });
  return { globals, store, element, meta, events, storage };
}

for (const [stored, expected] of [
  ["dark", "dark"],
  ["light", "light"],
  ["system", "light"],
  [null, "light"],
  ["invalid", "light"],
]) {
  test(`Before hydration: stored=${stored}`, () => {
    const env = environment(stored);
    vm.runInNewContext(THEME_INIT_SCRIPT, env.globals);
    assert.equal(env.element.dataset.theme, expected);
    assert.equal(env.meta.content, expected === "dark" ? "#15191f" : "#ffffff");
    env.store.watchTheme()();
    assert.equal(env.element.dataset.theme, expected);
  });
}

test("Blocked localStorage still permits switching themes", () => {
  const env = environment(null, true);
  vm.runInNewContext(THEME_INIT_SCRIPT, env.globals);
  assert.equal(env.element.dataset.theme, "light");
  env.store.watchTheme();
  env.store.setThemePreference("dark");
  assert.equal(env.element.dataset.theme, "dark");
});

test("Explicit choices persist and listeners are cleaned up", () => {
  const env = environment("light");
  const cleanup = env.store.watchTheme();
  env.store.setThemePreference("dark");
  assert.equal(env.storage.getItem(), "dark");
  assert.equal(env.store.useThemePreference(), "dark");
  cleanup();
  assert.equal(env.events.size, 0);
});

test("Theme preference synchronizes across tabs and resets on cleared storage", () => {
  const env = environment("light");
  env.store.watchTheme();
  env.storage.setItem(config.THEME_STORAGE_KEY, "dark");
  env.events.get("storage")({ key: config.THEME_STORAGE_KEY });
  assert.equal(env.store.useThemePreference(), "dark");
  env.storage.setItem(config.THEME_STORAGE_KEY, null);
  env.events.get("storage")({ key: null });
  assert.equal(env.store.useThemePreference(), "light");
  assert.equal(env.element.dataset.theme, "light");
});

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

test("All styles compile and every color variable belongs to the palette", () => {
  const theme = sass.compile(path.join(source, "shared/styles/theme.scss")).css;
  const tokens = new Set([...theme.matchAll(/--color-([\w-]+):/g)].map((match) => match[1]));
  for (const file of files(source).filter((file) => file.endsWith(".scss"))) {
    const css = sass.compile(file, { loadPaths: [source] }).css;
    for (const match of css.matchAll(/var\(--color-([\w-]+)\)/g)) {
      assert.ok(tokens.has(match[1]), `${file}: undefined ${match[1]}`);
    }
    if (file.endsWith("theme.scss")) continue;
    assert.doesNotMatch(readFileSync(file, "utf8"), /#[\da-f]{3,8}\b|rgba?\(/i, file);
  }
});

function luminance(hex) {
  const rgb = hex.match(/[\da-f]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const [r, g, b] = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("Dark palette has readable body text and white primary labels", () => {
  const text = readFileSync(path.join(source, "shared/styles/theme.scss"), "utf8");
  const dark = text.split("$dark: (")[1].split(");")[0];
  const colors = Object.fromEntries([...dark.matchAll(/([\w-]+): (#[\da-f]{6})/gi)].map((m) => [m[1], m[2]]));
  for (const foreground of ["text", "text-secondary", "text-muted", "accent-text", "danger"]) {
    for (const background of ["page", "surface", "surface-soft", "footer"]) {
      assert.ok(contrast(colors[foreground], colors[background]) >= 4.5, `${foreground} on ${background}`);
    }
  }
  assert.equal(colors["on-primary"], "#ffffff");
  assert.ok(contrast(colors["text-secondary"], colors["success-soft"]) >= 4.5);
});
