import Link from "next/link";
import { buildQuery } from "@/lib/utils";
import type { SearchParams } from "@/types";

const FILTERS: { value: SearchParams["beds"]; label: string }[] = [
  { value: "all", label: "All rooms" },
  { value: "1", label: "1 bed" },
  { value: "2", label: "2 beds" },
];

interface RoomFiltersProps {
  search: SearchParams;
  totalCount: number;
  visibleCount: number;
  isValid: boolean;
}

export function RoomFilters({ search, totalCount, visibleCount, isValid }: RoomFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = search.beds === filter.value;
          const href = isValid ? `/?${buildQuery(search, filter.value)}` : "#";

          return (
            <Link
              key={filter.value}
              href={href}
              aria-disabled={!isValid}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                !isValid
                  ? "pointer-events-none opacity-50"
                  : isActive
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      <p className="text-sm text-zinc-500">
        Showing {visibleCount} of {totalCount} rooms
      </p>
    </div>
  );
}
