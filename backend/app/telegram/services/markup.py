"""Перевод HTML из редактора в разметку Telegram и обрезка текста под лимит сообщения."""

from dataclasses import dataclass
from html import escape
from html.parser import HTMLParser

INLINE_TAGS = {"strong": "b", "em": "i", "u": "u"}
HEADINGS = {"h2", "h3"}
LISTS = {"ul", "ol"}
MORE_LABEL = "Читать полностью на Купце"


@dataclass
class Block:
    """Абзац, заголовок, цитата или пункт списка: разметка Telegram и видимый текст."""

    html: str
    text: str
    list_item: bool = False


class TelegramMarkup(HTMLParser):
    """Собирает блоки из HTML редактора. Заголовки становятся жирными строками, списки — строками с «•» и номерами."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[Block] = []
        self.html = ""
        self.text = ""
        self.marker = ""
        self.heading = False
        self.lists: list[list] = []
        self.containers = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "strong" and self.heading:
            return

        if tag in INLINE_TAGS:
            self.html += f"<{INLINE_TAGS[tag]}>"
        elif tag == "a":
            href = dict(attrs).get("href") or ""
            self.html += f'<a href="{escape(href)}">'
        elif tag == "br":
            self.add_text("\n")
        elif tag in HEADINGS:
            self.flush()
            self.heading = True
            self.html += "<b>"
        elif tag == "p" and self.containers and self.text:
            self.add_text("\n")
        elif tag == "p" and not self.containers:
            self.flush()
        elif tag == "blockquote":
            self.flush()
            self.containers += 1
            self.html += "<blockquote>"
        elif tag in LISTS:
            self.lists.append([tag == "ol", 0])
        elif tag == "li":
            self.start_item()

    def handle_endtag(self, tag: str) -> None:
        if tag == "strong" and self.heading:
            return

        if tag in INLINE_TAGS:
            self.html += f"</{INLINE_TAGS[tag]}>"
        elif tag == "a":
            self.html += "</a>"
        elif tag in HEADINGS:
            self.html += "</b>"
            self.flush()
        elif tag == "p" and not self.containers:
            self.flush()
        elif tag == "blockquote":
            self.html += "</blockquote>"
            self.containers -= 1
            self.flush()
        elif tag in LISTS and self.lists:
            self.lists.pop()
        elif tag == "li":
            self.flush()
            self.containers -= 1

    def handle_data(self, data: str) -> None:
        if not self.text and not data.strip():
            return

        self.add_text(data)

    def start_item(self) -> None:
        """Начать пункт списка: отступ по вложенности, номер или «•»."""

        self.flush()
        self.containers += 1

        marker = "•"
        if self.lists:
            current = self.lists[-1]
            current[1] += 1
            if current[0]:
                marker = f"{current[1]}."

        indent = "  " * max(len(self.lists) - 1, 0)
        self.marker = f"{indent}{marker} "

    def add_text(self, data: str) -> None:
        """Добавить текст в текущий блок, экранировав его для Telegram."""

        self.html += escape(data, quote=False)
        self.text += data

    def flush(self) -> None:
        """Закрыть текущий блок. Пустой не сохраняется. У пункта списка спереди отступ и маркер."""

        text = self.text.strip()
        if text:
            html = escape(self.marker, quote=False) + self.html.strip()
            self.blocks.append(Block(html, self.marker + text, self.marker != ""))

        self.html = ""
        self.text = ""
        self.marker = ""
        self.heading = False


def html_blocks(html: str) -> list[Block]:
    """Блоки Telegram из HTML поста."""

    parser = TelegramMarkup()
    parser.feed(html)
    parser.close()
    parser.flush()

    return parser.blocks


def text_size(text: str) -> int:
    """Длина так, как её считает Telegram: эмодзи и редкие символы занимают две позиции."""

    return len(text.encode("utf-16-le")) // 2


def join_blocks(blocks: list[Block]) -> Block:
    """Склеить блоки: пункты одного списка — через перенос строки, остальное — через пустую строку."""

    html = ""
    text = ""
    previous: Block | None = None
    for block in blocks:
        if previous is not None:
            separator = "\n" if previous.list_item and block.list_item else "\n\n"
            html += separator
            text += separator
        html += block.html
        text += block.text
        previous = block

    return Block(html, text)


def fits(blocks: list[Block], limit: int) -> bool:
    """Помещается ли текст в лимит Telegram."""

    return text_size(join_blocks(blocks).text) <= limit


def fit_text(blocks: list[Block], limit: int, more_url: str) -> str:
    """Разметка под лимит. Не помещается — целые блоки с начала и ссылка «Читать полностью»."""

    if fits(blocks, limit):
        return join_blocks(blocks).html

    more = Block(f'<a href="{escape(more_url)}">{MORE_LABEL}</a>', MORE_LABEL)
    budget = limit - text_size(more.text) - 2
    chosen: list[Block] = []
    for block in blocks:
        if not fits([*chosen, block], budget):
            break
        chosen.append(block)

    if not chosen:
        chosen = [cut_block(blocks[0], budget)]

    return join_blocks([*chosen, more]).html


def cut_block(block: Block, budget: int) -> Block:
    """Обрезать один длинный блок до budget без разметки, с многоточием."""

    text = block.text[:budget]
    while text_size(text) > budget - 1:
        text = text[:-1]

    return Block(escape(text, quote=False) + "…", text + "…")
