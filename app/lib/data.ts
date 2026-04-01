export interface BulanData {
  bulan: string;
  pendapatan: number;
  beban: number;
  laba: number;
  gpm: number;
  anomali: boolean;
}

export const KAS = 1290;

const RAW = [
  { b: "Jul'24", p: 285, e: 198 }, { b: "Agu'24", p: 312, e: 215 },
  { b: "Sep'24", p: 298, e: 225 }, { b: "Okt'24", p: 340, e: 210 },
  { b: "Nov'24", p: 378, e: 235 }, { b: "Des'24", p: 425, e: 280 },
  { b: "Jan'25", p: 310, e: 295 }, { b: "Feb'25", p: 295, e: 305 },
  { b: "Mar'25", p: 335, e: 285 },
];

export const DATA: BulanData[] = RAW.map(d => ({
  bulan: d.b, pendapatan: d.p, beban: d.e,
  laba: d.p - d.e,
  gpm: parseFloat(((d.p - d.e) / d.p * 100).toFixed(1)),
  anomali: d.e > d.p * 0.9,
}));

export const LATEST = DATA[DATA.length - 1];
export const PREV   = DATA[DATA.length - 2];
export const RUNWAY = Math.floor(KAS / LATEST.beban);
export const ANOMALIES = DATA.filter(d => d.anomali);

const last3p = DATA.slice(-3).map(d => d.pendapatan);
const last3e = DATA.slice(-3).map(d => d.beban);
const trendP = (last3p[2] - last3p[0]) / 2;
const trendE = (last3e[2] - last3e[0]) / 2;

export const FCAST = ["Apr'25", "Mei'25", "Jun'25"].map((bulan, i) => {
  const p = Math.round(LATEST.pendapatan + trendP * (i + 1));
  const e = Math.round(LATEST.beban + trendE * (i + 1));
  return { bulan, pendapatan: p, beban: e, laba: p - e, forecast: true };
});

export const pct = (a: number, b: number) => (((a - b) / b) * 100).toFixed(1);
