export type Role = "SOCIO" | "ADMIN";
export type Weekday = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB" | "DOM";
export type BookingType = "DIARIA" | "SEMANAL";

export interface AuthUser {
  id: number;
  dni: string;
  fullName: string;
  role: Role;
}

export interface Activity {
  id: number;
  name: string;
}

export interface ScheduleSlot {
  id: number;
  groupId: string;
  activityId: number;
  activityName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  spotsTaken: number;
  spotsLeft: number;
  bookable: boolean;
  alreadyBooked: boolean;
}

export interface ScheduleDay {
  date: string;
  weekday: Weekday;
  slots: ScheduleSlot[];
}

export interface MyBooking {
  id: number;
  date: string;
  type: BookingType;
  weekGroupId: string | null;
  activityName: string;
  startTime: string;
  endTime: string;
}

export interface AdminScheduleGroup {
  groupId: string;
  activityId: number;
  activityName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  weekdays: Weekday[];
}

export interface AdminMember {
  id: number;
  dni: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
}

export interface AdminBookingRow {
  id: number;
  dni: string;
  fullName: string;
  activityName: string;
  startTime: string;
  endTime: string;
  type: BookingType;
}

export interface Announcement {
  id: number;
  message: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface AttendanceReport {
  date: string;
  totalBookings: number;
  totalAttended: number;
  rows: { dni: string; fullName: string; activityName: string; startTime: string; attended: boolean }[];
  walkIns: { dni: string; fullName: string; timestamp: string }[];
}
