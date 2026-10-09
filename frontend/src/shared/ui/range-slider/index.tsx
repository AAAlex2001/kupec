"use client";

import { useId, type CSSProperties } from "react";
import { formatNumber } from "@/shared/lib/format";
import RangeInput from "@/shared/ui/range-input";
import styles from "./style.module.scss";

type RangeSliderProps = {
  max: number;
  from: string;
  to: string;
  unit?: string | null;
  onChange: (from: string, to: string) => void;
};

const STEPS = 100;

/** Подсказка в поле: «до 1 000 кг». */
const placeholder = (prefix: string, value: number, unit?: string | null) =>
  [prefix, formatNumber(value), unit].filter(Boolean).join(" ");

/** «От — до» полями и двумя ползунками на шкале от 0 до max. Крайние положения — без ограничения. */
const RangeSlider = ({ max, from, to, unit, onChange }: RangeSliderProps) => {
  const id = useId();
  const step = Math.max(1, Math.round(max / STEPS));
  const low = from === "" ? 0 : Math.min(Number(from), max);
  const high = to === "" ? max : Math.min(Number(to), max);
  const fill = { "--from": `${(low / max) * 100}%`, "--to": `${(high / max) * 100}%` };

  const changeLow = (value: number) => {
    const next = Math.min(value, high);
    onChange(next <= 0 ? "" : String(next), to);
  };

  const changeHigh = (value: number) => {
    const next = Math.max(value, low);
    onChange(from, next >= max ? "" : String(next));
  };

  return (
    <div className={styles.slider}>
      <RangeInput
        id={id}
        from={from}
        to={to}
        fromPlaceholder={placeholder("от", 0, unit)}
        toPlaceholder={placeholder("до", max, unit)}
        onChange={onChange}
      />

      <div className={styles.track} style={fill as CSSProperties}>
        <input
          className={styles.thumb}
          type="range"
          min={0}
          max={max}
          step={step}
          value={low}
          aria-label="от"
          onChange={(event) => changeLow(Number(event.target.value))}
        />
        <input
          className={styles.thumb}
          type="range"
          min={0}
          max={max}
          step={step}
          value={high}
          aria-label="до"
          onChange={(event) => changeHigh(Number(event.target.value))}
        />
      </div>
    </div>
  );
};

export default RangeSlider;
