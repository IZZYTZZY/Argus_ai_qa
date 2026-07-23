import { clsx, type ClassValue } from "clsx";
export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const pct = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `${n.toFixed(1)}%`;

export const riskColor = (p: number) =>
  p >= 70 ? "text-fail" : p >= 40 ? "text-warn" : "text-pass";
