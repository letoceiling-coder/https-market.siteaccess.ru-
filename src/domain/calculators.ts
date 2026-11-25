export type InsulationLevel = "weak" | "medium" | "good";
export type ClimateBand = "south" | "center" | "north";
export type SoilKind = "sand" | "loam" | "clay" | "unknown";
export type Glazing = "north" | "mixed" | "south" | "panoramic";
export type WallMaterial = "frame" | "aerated" | "brick" | "monolith";
export type FinishLevel = "shell" | "rough" | "finish";

export interface HeatingInput {
  area: number;
  insulation: InsulationLevel;
  climate: ClimateBand;
  indoorC: number;
  outdoorC: number;
}

export interface HeatingEstimate {
  kilowatts: number;
  specificLoadW: number;
  formula: string;
  assumptions: string[];
}

const SPECIFIC_LOAD: Record<InsulationLevel, number> = {
  weak: 100,
  medium: 70,
  good: 45,
};

const CLIMATE_FACTOR: Record<ClimateBand, number> = {
  south: 0.85,
  center: 1,
  north: 1.25,
};

/** Preliminary heat-load sketch. Not a calculation under СП 60.13330. */
export function estimateHeating(input: HeatingInput): HeatingEstimate {
  assertRange(input.area, 20, 800, "Площадь");
  assertRange(input.indoorC, 16, 26, "Температура в помещении");
  assertRange(input.outdoorC, -50, 10, "Расчётная наружная температура");
  const specific = SPECIFIC_LOAD[input.insulation];
  const delta = input.indoorC - input.outdoorC;
  const deltaFactor = Math.max(delta / 45, 0.4);
  const watts = input.area * specific * CLIMATE_FACTOR[input.climate] * deltaFactor;
  return {
    kilowatts: round1(watts / 1000),
    specificLoadW: specific,
    formula: "Q ≈ S × q × kклимат × (tвн − tнар) / 45",
    assumptions: [
      "q — справочная удельная нагрузка для предварительной прикидки: 100, 70 или 45 Вт/м².",
      "Делитель 45 °C — условная разница, к которой относят эти удельные величины, а не нормативный коэффициент.",
      "Результат не заменяет теплотехнический расчёт и проект котельной.",
    ],
  };
}

export interface SepticInput {
  people: number;
  litersPerPerson: number;
  seasonal: boolean;
  highGroundwater: boolean;
  soil: SoilKind;
}

export interface SepticEstimate {
  dailyLiters: number;
  holdingM3: number;
  direction: string;
  caveats: string[];
}

export function estimateSeptic(input: SepticInput): SepticEstimate {
  assertRange(input.people, 1, 20, "Число жителей");
  assertRange(input.litersPerPerson, 50, 400, "Суточный расход");
  const daily = input.people * input.litersPerPerson * (input.seasonal ? 0.7 : 1);
  const difficult = input.highGroundwater || input.soil === "clay";
  return {
    dailyLiters: Math.round(daily),
    holdingM3: round1((daily * 3) / 1000),
    direction: difficult
      ? "При высоких грунтовых водах или глине предварительный ориентир — герметичная ёмкость или станция очистки с отводом, который подтвердит геология и проект."
      : "Трёхсуточный объём пригоден только как стартовая оценка септика. Тип сооружения выбирают после грунта, УГВ и требований к сбросу.",
    caveats: [
      "200 л на человека в сутки — распространённое расчётное допущение для жилья, его можно заменить фактическим расходом.",
      "Сезонность здесь условно снижает расход на 30% и не описывает реальный режим конкретного дома.",
      "Поле фильтрации, сброс в канаву и отступ от источников воды этим расчётом не проверяются.",
    ],
  };
}

export interface CoolingInput {
  area: number;
  height: number;
  glazing: Glazing;
  topFloor: boolean;
  kitchen: boolean;
}

export interface CoolingEstimate {
  kilowatts: number;
  formula: string;
  assumptions: string[];
}

const GLAZING_FACTOR: Record<Glazing, number> = {
  north: 1,
  mixed: 1.1,
  south: 1.2,
  panoramic: 1.35,
};

export function estimateCooling(input: CoolingInput): CoolingEstimate {
  assertRange(input.area, 8, 400, "Площадь");
  assertRange(input.height, 2.4, 6, "Высота");
  const kilowatts =
    input.area *
    (input.height / 2.7) *
    0.1 *
    GLAZING_FACTOR[input.glazing] *
    (input.topFloor ? 1.1 : 1) *
    (input.kitchen ? 1.15 : 1);
  return {
    kilowatts: round1(kilowatts),
    formula: "Q ≈ S × (h / 2,7) × 0,1 кВт × kостекление × kэтаж × kкухня",
    assumptions: [
      "0,1 кВт/м² — бытовой ориентир для помещения высотой около 2,7 м.",
      "Коэффициенты остекления, верхнего этажа и кухни — поправки прикидки, не расчёт теплопоступлений.",
      "По результату нельзя выбирать марку внутреннего блока: нужны трасса, питание и проект.",
    ],
  };
}

export interface HouseConfigInput {
  area: number;
  floors: number;
  wall: WallMaterial;
  foundation: "slab" | "strip" | "piles";
  finish: FinishLevel;
  systems: string[];
}

export interface HouseConfigResult {
  lines: { label: string; value: string }[];
  requestItems: string[];
}

const WALL_LABEL: Record<WallMaterial, string> = {
  frame: "Каркас",
  aerated: "Газобетон",
  brick: "Кирпич",
  monolith: "Монолит",
};

const FOUNDATION_LABEL = {
  slab: "Плита",
  strip: "Лента",
  piles: "Сваи",
} as const;

const FINISH_LABEL: Record<FinishLevel, string> = {
  shell: "Тёплый контур без чистовой отделки",
  rough: "Черновая отделка",
  finish: "Чистовая отделка",
};

export function configureHouse(input: HouseConfigInput): HouseConfigResult {
  assertRange(input.area, 40, 600, "Площадь дома");
  assertRange(input.floors, 1, 3, "Этажность");
  const systems = input.systems.length > 0 ? input.systems : ["перечень систем не выбран"];
  return {
    lines: [
      { label: "Площадь", value: `${input.area} м²` },
      { label: "Этажи", value: String(input.floors) },
      { label: "Стены", value: WALL_LABEL[input.wall] },
      { label: "Фундамент", value: FOUNDATION_LABEL[input.foundation] },
      { label: "Отделка", value: FINISH_LABEL[input.finish] },
      { label: "Инженерные системы", value: systems.join(", ") },
    ],
    requestItems: [
      "Геология и рельеф участка",
      "Архитектурные планы или техническое задание",
      "Доступные сети: электричество, газ, вода, канализация",
      "Состав комплектации без денежной оценки — прайс не утверждён",
    ],
  };
}

function assertRange(value: number, min: number, max: number, label: string) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label}: ожидается число от ${min} до ${max}.`);
  }
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
