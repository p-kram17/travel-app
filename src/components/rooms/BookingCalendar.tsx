"use client";

import { addDays, startOfToday } from "date-fns";
import { DayPicker, type Matcher } from "react-day-picker";
import { parseDate, toISODate } from "@/lib/utils";

const calendarClassNames = {
  root: "w-full",
  months: "flex w-full flex-col",
  month: "w-full space-y-3",
  month_caption: "relative flex items-center justify-center pb-1",
  caption_label: "text-sm font-semibold text-zinc-900",
  button_previous:
    "absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 z-10 cursor-pointer hover:bg-blue-100",
  button_next:
    "absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 z-10 cursor-pointer hover:bg-blue-100",
  chevron: "h-4 w-4 fill-zinc-600",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-center text-xs font-medium text-zinc-500",
  week: "mt-1 flex w-full",
  day: "relative p-0 text-center text-sm h-9 w-9",
  day_button:
    "flex h-9 w-9 items-center justify-center rounded-full font-normal text-zinc-900 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
  selected: "[&>button]:bg-blue-600 [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-blue-700",
  today: "[&>button]:font-semibold [&>button]:text-blue-600",
  outside: "invisible",
  disabled: "[&>button]:cursor-not-allowed [&>button]:text-zinc-300 [&>button]:hover:bg-transparent",
};

interface BookingCalendarProps {
  selected: string;
  disabled: Matcher | Matcher[];
  onSelect: (iso: string) => void;
}

export function BookingCalendar({ selected, disabled, onSelect }: BookingCalendarProps) {
  const selectedDate = parseDate(selected) ?? undefined;

  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      defaultMonth={selectedDate ?? startOfToday()}
      showOutsideDays={false}
      disabled={disabled}
      onSelect={(date) => {
        if (date) onSelect(toISODate(date));
      }}
      classNames={calendarClassNames}
    />
  );
}

export function checkInDisabledMatchers(): Matcher[] {
  const today = startOfToday();
  return [{ before: today }, { after: addDays(today, 365) }];
}

export function checkOutDisabledMatchers(checkIn: string): Matcher[] {
  const checkInDate = parseDate(checkIn);
  if (!checkInDate) return [{ before: startOfToday() }];
  return [{ before: addDays(checkInDate, 1) }, { after: addDays(checkInDate, 31) }];
}
