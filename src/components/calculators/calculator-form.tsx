"use client";

import { useState } from "react";
import {
  configureHouse,
  estimateCooling,
  estimateHeating,
  estimateSeptic,
  type ClimateBand,
  type FinishLevel,
  type Glazing,
  type InsulationLevel,
  type SoilKind,
  type WallMaterial,
} from "@/domain/calculators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CalculatorForm({ slug, disclaimer }: { slug: string; disclaimer: string }) {
  const [error, setError] = useState("");
  const [result, setResult] = useState<string[]>([]);

  function run(form: FormData) {
    setError("");
    try {
      const number = (name: string) => Number(form.get(name));
      if (slug === "otoplenie") {
        const estimate = estimateHeating({
          area: number("area"),
          insulation: String(form.get("insulation")) as InsulationLevel,
          climate: String(form.get("climate")) as ClimateBand,
          indoorC: number("indoor"),
          outdoorC: number("outdoor"),
        });
        setResult([
          `Ориентир: ${estimate.kilowatts} кВт`,
          `Удельная величина q: ${estimate.specificLoadW} Вт/м²`,
          estimate.formula,
          ...estimate.assumptions,
        ]);
      } else if (slug === "septik") {
        const estimate = estimateSeptic({
          people: number("people"),
          litersPerPerson: number("liters"),
          seasonal: form.get("seasonal") === "1",
          highGroundwater: form.get("water") === "1",
          soil: String(form.get("soil")) as SoilKind,
        });
        setResult([
          `Суточный сток: ${estimate.dailyLiters} л`,
          `Трёхсуточный объём: ${estimate.holdingM3} м³`,
          estimate.direction,
          ...estimate.caveats,
        ]);
      } else if (slug === "konditsioner") {
        const estimate = estimateCooling({
          area: number("area"),
          height: number("height"),
          glazing: String(form.get("glazing")) as Glazing,
          topFloor: form.get("top") === "1",
          kitchen: form.get("kitchen") === "1",
        });
        setResult([`Ориентир: ${estimate.kilowatts} кВт`, estimate.formula, ...estimate.assumptions]);
      } else {
        const systems = ["отопление", "вода", "канализация", "электрика", "вентиляция"].filter((item) => form.get(item) === "1");
        const estimate = configureHouse({
          area: number("area"),
          floors: number("floors"),
          wall: String(form.get("wall")) as WallMaterial,
          foundation: String(form.get("foundation")) as "slab" | "strip" | "piles",
          finish: String(form.get("finish")) as FinishLevel,
          systems,
        });
        setResult([
          ...estimate.lines.map((line) => `${line.label}: ${line.value}`),
          "Денежной оценки нет.",
          "Для будущего запроса понадобится:",
          ...estimate.requestItems,
        ]);
      }
    } catch (caught) {
      setResult([]);
      setError(caught instanceof Error ? caught.message : "Проверьте числа.");
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        run(new FormData(event.currentTarget));
      }}
    >
      <p className="text-sm leading-6 text-muted-foreground">{disclaimer} Результат считается в браузере и никуда не отправляется.</p>
      {slug === "otoplenie" ? <HeatingFields /> : null}
      {slug === "septik" ? <SepticFields /> : null}
      {slug === "konditsioner" ? <CoolingFields /> : null}
      {slug === "dom" ? <HouseFields /> : null}
      <Button type="submit" className="h-11 px-5">Посчитать ориентир</Button>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {result.length > 0 ? (
        <div role="status" className="rounded-xl bg-secondary p-4">
          <h2 className="font-semibold">Предварительный набросок</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">{result.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      ) : null}
    </form>
  );
}

function HeatingFields() {
  return (
    <>
      <NumberField name="area" label="Отапливаемая площадь, м²" defaultValue="120" />
      <Choice name="insulation" label="Утепление" options={[["weak", "Слабое"], ["medium", "Среднее"], ["good", "Хорошее"]]} />
      <Choice name="climate" label="Климат" options={[["south", "Юг"], ["center", "Средняя полоса"], ["north", "Север"]]} />
      <NumberField name="indoor" label="Температура в доме, °C" defaultValue="21" />
      <NumberField name="outdoor" label="Расчётная наружная, °C" defaultValue="-25" />
    </>
  );
}

function SepticFields() {
  return (
    <>
      <NumberField name="people" label="Жителей" defaultValue="4" />
      <NumberField name="liters" label="Литров на человека в сутки" defaultValue="150" />
      <Choice name="soil" label="Грунт" options={[["sand", "Песок"], ["loam", "Суглинок"], ["clay", "Глина"], ["unknown", "Неизвестно"]]} />
      <Check name="seasonal" label="Сезонное проживание" />
      <Check name="water" label="Высокие грунтовые воды" />
    </>
  );
}

function CoolingFields() {
  return (
    <>
      <NumberField name="area" label="Площадь зоны, м²" defaultValue="25" />
      <NumberField name="height" label="Высота, м" defaultValue="2.7" />
      <Choice name="glazing" label="Окна" options={[["north", "Север"], ["mixed", "Смешанные"], ["south", "Юг"], ["panoramic", "Панорама"]]} />
      <Check name="top" label="Верхний этаж или кровля рядом" />
      <Check name="kitchen" label="В зоне есть кухня" />
    </>
  );
}

function HouseFields() {
  return (
    <>
      <NumberField name="area" label="Площадь дома, м²" defaultValue="140" />
      <NumberField name="floors" label="Этажи" defaultValue="2" />
      <Choice name="wall" label="Стены" options={[["frame", "Каркас"], ["aerated", "Газобетон"], ["brick", "Кирпич"], ["monolith", "Монолит"]]} />
      <Choice name="foundation" label="Фундамент" options={[["slab", "Плита"], ["strip", "Лента"], ["piles", "Сваи"]]} />
      <Choice name="finish" label="Отделка" options={[["shell", "Тёплый контур"], ["rough", "Черновая"], ["finish", "Чистовая"]]} />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Системы в запросе</legend>
        {["отопление", "вода", "канализация", "электрика", "вентиляция"].map((item) => <Check key={item} name={item} label={item} />)}
      </fieldset>
    </>
  );
}

function NumberField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} inputMode="decimal" defaultValue={defaultValue} className="h-11" />
    </div>
  );
}

function Choice({ name, label, options }: { name: string; label: string; options: [string, string][] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm">
        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </div>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value="1" className="size-4 accent-primary" />
      {label}
    </label>
  );
}
