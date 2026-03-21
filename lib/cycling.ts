// ============================================================
// Atlas Engine - Cycling Math Engine
// ============================================================

export function calcDosesPerVial(vialMg: number, doseMcg: number): number {
  return Math.floor((vialMg * 1000) / doseMcg);
}

export function calcConcentration(vialMg: number, bacMl: number): number {
  return vialMg / bacMl;
}

export function calcUnitsToDrawU100(vialMg: number, bacMl: number, doseMcg: number): number {
  const concMcgMl = (vialMg / bacMl) * 1000;
  return (doseMcg / concMcgMl) * 100;
}

export function calcVolumeMl(vialMg: number, bacMl: number, doseMcg: number): number {
  const concMcgMl = (vialMg / bacMl) * 1000;
  return doseMcg / concMcgMl;
}

export function calcWeightBasedDose(weightLbs: number, dosePerKgMcg: number): number {
  return Math.round((weightLbs / 2.20462) * dosePerKgMcg);
}

export function calcVialsNeeded(
  doseMcg: number,
  vialMg: number,
  doseFrequency: 'daily' | 'weekly' | 'twice_weekly' | 'three_times_weekly',
  totalDays: number
): number {
  const dosesPerDay = {
    daily: 1,
    weekly: 1 / 7,
    twice_weekly: 2 / 7,
    three_times_weekly: 3 / 7,
  }[doseFrequency];
  return Math.ceil((dosesPerDay * totalDays) / calcDosesPerVial(vialMg, doseMcg));
}

export function getCurrentCycleMonth(startDate: Date): number {
  return Math.min(
    Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1,
    12
  );
}

export interface CycleTimelineMonth {
  monthNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

export function generateCyclingTimeline(startDate: Date, totalMonths: number): CycleTimelineMonth[] {
  return Array.from({ length: totalMonths }, (_, i) => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + i);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return {
      monthNumber: i + 1,
      startDate: start,
      endDate: end,
      label: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });
}

// ============================================================
// Additional helpers
// ============================================================

export function formatConcentration(vialMg: number, bacMl: number): string {
  const mgPerMl = calcConcentration(vialMg, bacMl);
  return `${mgPerMl.toFixed(2)} mg/mL (${(mgPerMl * 1000).toFixed(0)} mcg/mL)`;
}

export function formatUnitsU100(units: number): string {
  return `${units.toFixed(1)} units on U-100 syringe`;
}

export function formatVolumeMl(volume: number): string {
  return `${volume.toFixed(3)} mL`;
}

export function calcDaysOnProtocol(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function calcDaysSinceCheckin(checkinDate: string): number {
  const d = new Date(checkinDate);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}
