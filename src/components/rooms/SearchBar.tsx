"use client";

import { addDays } from "date-fns";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookingCalendar,
  checkInDisabledMatchers,
  checkOutDisabledMatchers,
} from "@/components/rooms/BookingCalendar";
import {
  buildQuery,
  formatDate,
  guestDraftsToSearch,
  parseDate,
  searchToGuestDrafts,
  toISODate,
  travelerSummary,
} from "@/lib/utils";
import type { RoomGuestDraft, SearchParams } from "@/types";

interface SearchBarProps {
  search: SearchParams;
}

type Panel = "checkIn" | "checkOut" | "travelers" | null;

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-zinc-900" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <rect x="7" y="14" width="3" height="3" rx="0.5"></rect>
    </svg>
  );
}

function TravelersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-zinc-900" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CounterRow({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-medium text-zinc-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-700 cursor-pointer"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function TriggerBlock({
  label,
  value,
  icon,
  active,
  onClick,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-16 flex-1 items-center gap-3 bg-white px-4 text-left hover:bg-zinc-50 md:px-5 ${
        active ? "relative z-10 bg-blue-50 ring-2 ring-inset ring-blue-500" : ""
      } ${className}`}
    >
      {icon}
      <span className="min-w-0">
        <span className="block text-xs font-medium text-zinc-500">{label}</span>
        <span className="block truncate text-sm font-semibold text-zinc-900">{value}</span>
      </span>
    </button>
  );
}

export function SearchBar({ search }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [guestDrafts, setGuestDrafts] = useState<RoomGuestDraft[]>(() => searchToGuestDrafts(search));

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pushSearch = (next: SearchParams) => {
    startTransition(() => {
      router.replace(`${pathname}?${buildQuery(next)}`, { scroll: false });
    });
  };

  const updateDates = (field: "checkIn" | "checkOut", value: string) => {
    const next = { ...search, [field]: value };
    if (field === "checkIn") {
      const checkInDate = parseDate(value);
      const checkOutDate = parseDate(search.checkOut);
      if (checkInDate && checkOutDate && checkInDate >= checkOutDate) {
        next.checkOut = toISODate(addDays(checkInDate, 1));
      }
    }
    pushSearch(next);
    setOpenPanel(null);
  };

  const applyTravelers = () => {
    pushSearch(guestDraftsToSearch(search, guestDrafts));
    setOpenPanel(null);
  };

  const updateRoom = (index: number, updater: (room: RoomGuestDraft) => RoomGuestDraft) => {
    setGuestDrafts((current) => current.map((room, i) => (i === index ? updater(room) : room)));
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <TriggerBlock
          label="Start date"
          value={formatDate(search.checkIn)}
          icon={<CalendarIcon />}
          active={openPanel === "checkIn"}
          onClick={() => setOpenPanel(openPanel === "checkIn" ? null : "checkIn")}

          className={`cursor-pointer flex-1 rounded-lg border bg-white p-3 transition-colors ${
            openPanel === "checkIn"
              ? "border-blue-600 ring-1 ring-blue-600"
              : "border-zinc-300 "
          }`}
        />
        <TriggerBlock
          label="End date"
          value={formatDate(search.checkOut)}
          icon={<CalendarIcon />}
          active={openPanel === "checkOut"}
          onClick={() => setOpenPanel(openPanel === "checkOut" ? null : "checkOut")}
          className={`cursor-pointer flex-1 rounded-lg border bg-white p-3 transition-colors ${
            openPanel === "checkOut"
              ? "border-blue-600 ring-1 ring-blue-600"
              : "border-zinc-300"
          }`}
        />
        <TriggerBlock
          label="Travelers"
          value={travelerSummary(search)}
          icon={<TravelersIcon />}
          active={openPanel === "travelers"}
          onClick={() => {
            if (openPanel === "travelers") {
              setOpenPanel(null);
            } else {
              setGuestDrafts(searchToGuestDrafts(search));
              setOpenPanel("travelers");
            }
          }}
          className={`cursor-pointer flex-1 rounded-lg border bg-white p-3 transition-colors ${
            openPanel === "travelers"
              ? "border-blue-600 ring-1 ring-blue-600"
              : "border-zinc-300"
          }`}
        />
      </div>

      {openPanel === "checkIn" ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
          <BookingCalendar
            selected={search.checkIn}
            disabled={checkInDisabledMatchers()}
            onSelect={(value) => updateDates("checkIn", value)}
          />
        </div>
      ) : null}

      {openPanel === "checkOut" ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg sm:left-1/3">
          <BookingCalendar
            selected={search.checkOut}
            disabled={checkOutDisabledMatchers(search.checkIn)}
            onSelect={(value) => updateDates("checkOut", value)}
          />
        </div>
      ) : null}

      {openPanel === "travelers" ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg">
          <div className="max-h-[28rem] space-y-5 overflow-y-auto">
            {guestDrafts.map((room, index) => (
              <div key={index} className={index > 0 ? "border-t border-zinc-100 pt-5" : ""}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">Room {index + 1}</p>
                  {guestDrafts.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setGuestDrafts((current) => current.filter((_, i) => i !== index))}
                      className="text-sm font-medium text-zinc-500 hover:text-red-600"
                    >
                      Remove room
                    </button>
                  ) : null}
                </div>

                <CounterRow
                  label="Adults"
                  hint="Ages 18+"
                  value={room.adults}
                  min={1}
                  onChange={(adults) => updateRoom(index, (r) => ({ ...r, adults }))}
                />

                <CounterRow
                  label="Children"
                  hint="Ages 0–17"
                  value={room.childrenAges.length}
                  min={0}
                  onChange={(count) =>
                    updateRoom(index, (r) => {
                      const next = [...r.childrenAges];
                      while (next.length < count) next.push(0);
                      while (next.length > count) next.pop();
                      return { ...r, childrenAges: next };
                    })
                  }
                />

                {room.childrenAges.length > 0 ? (
                  <div className="space-y-2 pb-2">
                    {room.childrenAges.map((age, childIndex) => (
                      <label key={childIndex} className="flex items-center justify-between gap-3 text-sm text-zinc-700">
                        Child {childIndex + 1} age
                        <select
                          value={age}
                          onChange={(event) =>
                            updateRoom(index, (r) => {
                              const childrenAges = [...r.childrenAges];
                              childrenAges[childIndex] = Number.parseInt(event.target.value, 10);
                              return { ...r, childrenAges };
                            })
                          }
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                        >
                          {Array.from({ length: 18 }, (_, n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {guestDrafts.length < 8 ? (
            <button
              type="button"
              onClick={() => setGuestDrafts((current) => [...current, { adults: 1, childrenAges: [] }])}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer hover:bg-blue-50 rounded-lg p-2"
            >
              Add another room
            </button>
          ) : null}

          <button
            type="button"
            onClick={applyTravelers}
            className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
