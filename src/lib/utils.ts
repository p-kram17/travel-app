import { format } from "date-fns";
import type { RoomGuestDraft, SearchParams } from "@/types";

type RawParams = Record<string, string | string[] | undefined>;

function param(raw: RawParams, key: string): string | undefined {
  const value = raw[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  if (date.getFullYear() !== +match[1] || date.getMonth() !== +match[2] - 1) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function defaultDates() {
  const checkIn = new Date();
  checkIn.setHours(0, 0, 0, 0);
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);
  return { checkIn: toISODate(checkIn), checkOut: toISODate(checkOut) };
}

function normalizeRoomGuests(
  rooms: number,
  adultsRaw: string | undefined,
  childrenRaw: string | undefined,
): { roomAdults: number[]; roomChildren: number[][] } {
  const roomAdults: number[] = [];
  const roomChildren: number[][] = [];

  if (adultsRaw?.includes(",")) {
    for (const part of adultsRaw.split(",")) {
      roomAdults.push(Math.max(1, Number.parseInt(part.trim(), 10) || 1));
    }
  } else {
    const total = Math.max(1, Number.parseInt(adultsRaw ?? "2", 10) || 2);
    const base = Math.floor(total / rooms);
    let remainder = total % rooms;
    for (let i = 0; i < rooms; i++) {
      roomAdults.push(base + (remainder > 0 ? 1 : 0));
      if (remainder > 0) remainder--;
    }
  }

  if (childrenRaw?.includes("|")) {
    for (const part of childrenRaw.split("|")) {
      roomChildren.push(
        part
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => Number.parseInt(s, 10)),
      );
    }
  } else {
    const ages = (childrenRaw ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number.parseInt(s, 10));
    roomChildren.push(ages);
  }

  while (roomAdults.length < rooms) roomAdults.push(1);
  while (roomChildren.length < rooms) roomChildren.push([]);

  return {
    roomAdults: roomAdults.slice(0, rooms),
    roomChildren: roomChildren.slice(0, rooms),
  };
}

export function searchToGuestDrafts(search: SearchParams): RoomGuestDraft[] {
  return Array.from({ length: search.rooms }, (_, i) => ({
    adults: search.roomAdults[i] ?? 1,
    childrenAges: search.roomChildren[i] ?? [],
  }));
}

export function guestDraftsToSearch(
  search: SearchParams,
  drafts: RoomGuestDraft[],
): SearchParams {
  const roomAdults = drafts.map((d) => Math.max(1, d.adults));
  const roomChildren = drafts.map((d) => d.childrenAges);
  return {
    ...search,
    rooms: drafts.length,
    roomAdults,
    roomChildren,
    adults: roomAdults.reduce((sum, n) => sum + n, 0),
    childrenAges: roomChildren.flat(),
  };
}

export function formatDate(iso: string, long = false): string {
  const date = parseDate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", long
    ? { weekday: "short", month: "short", day: "numeric" }
    : { month: "short", day: "numeric" });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function readSearch(raw: RawParams): SearchParams & { errors: string[]; isValid: boolean } {
  const defaults = defaultDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkIn = param(raw, "checkIn") ?? defaults.checkIn;
  const checkOut = param(raw, "checkOut") ?? defaults.checkOut;
  const rooms = Math.max(1, Number.parseInt(param(raw, "rooms") ?? "1", 10) || 1);
  const { roomAdults, roomChildren } = normalizeRoomGuests(
    rooms,
    param(raw, "adults"),
    param(raw, "childrenAges"),
  );
  const adults = roomAdults.reduce((sum, n) => sum + n, 0);
  const childrenAges = roomChildren.flat();
  const bedsRaw = param(raw, "beds");
  const beds: SearchParams["beds"] = bedsRaw === "1" || bedsRaw === "2" ? bedsRaw : "all";

  const errors: string[] = [];
  const checkInDate = parseDate(checkIn);
  const checkOutDate = parseDate(checkOut);

  if (!checkInDate) errors.push("Check-in must be a valid date.");
  else if (checkInDate < today) errors.push("Check-in cannot be before today.");
  else {
    const maxAdvance = new Date(today);
    maxAdvance.setDate(maxAdvance.getDate() + 365);
    if (checkInDate > maxAdvance) errors.push("Check-in cannot be more than 1 year ahead.");
  }

  if (!checkOutDate) errors.push("Check-out must be a valid date.");
  else if (checkInDate && checkOutDate <= checkInDate) errors.push("Check-out must be after check-in.");
  else if (checkInDate && nightsBetween(checkIn, checkOut) > 31) errors.push("Maximum stay is 31 days.");

  if (childrenAges.some((age) => age < 0 || age > 17 || Number.isNaN(age))) {
    errors.push("Child ages must be between 0 and 17.");
  }

  if (roomAdults.some((n) => n < 1)) {
    errors.push("Each room needs at least 1 adult.");
  }

  return {
    checkIn,
    checkOut,
    rooms,
    adults,
    childrenAges,
    beds,
    roomAdults,
    roomChildren,
    errors,
    isValid: errors.length === 0,
  };
}

export function buildQuery(search: SearchParams, beds?: SearchParams["beds"]): string {
  const q = new URLSearchParams();
  q.set("checkIn", search.checkIn);
  q.set("checkOut", search.checkOut);
  q.set("rooms", String(search.rooms));
  q.set("adults", search.roomAdults.join(","));
  q.set(
    "childrenAges",
    search.roomChildren.map((ages) => ages.join(",")).join("|"),
  );
  const bedFilter = beds ?? search.beds;
  if (bedFilter !== "all") q.set("beds", bedFilter);
  return q.toString();
}

export function buildCheckoutUrl(roomId: string, search: SearchParams): string {
  const q = new URLSearchParams(buildQuery(search));
  q.set("roomId", roomId);
  return `/checkout?${q.toString()}`;
}

export function travelerSummary(search: SearchParams): string {
  const travelers = search.adults + search.childrenAges.length;
  return `${travelers} traveler${travelers === 1 ? "" : "s"}, ${search.rooms} room${search.rooms === 1 ? "" : "s"}`;
}

export function daysUntilCheckIn(checkIn: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(checkIn);
  if (!start) return 999;
  return Math.round((start.getTime() - today.getTime()) / 86400000);
}
