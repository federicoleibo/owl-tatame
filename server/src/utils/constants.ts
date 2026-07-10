export type Weekday = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB" | "DOM";
export type Role = "SOCIO" | "ADMIN";
export type BookingType = "DIARIA" | "SEMANAL";
export type BookingStatus = "CONFIRMADA" | "CANCELADA";

export const WEEKDAY_ORDER: Weekday[] = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  LUN: "Lunes",
  MAR: "Martes",
  MIE: "Miercoles",
  JUE: "Jueves",
  VIE: "Viernes",
  SAB: "Sabado",
  DOM: "Domingo",
};
