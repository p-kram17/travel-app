import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomFilters } from "@/components/rooms/RoomFilters";
import { SearchBar } from "@/components/rooms/SearchBar";
import { getRooms } from "@/lib/rooms";
import { buildCheckoutUrl, readSearch } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Travel - Choose your room",
  description: "Browse available hotel rooms and reserve your stay.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: PageProps) {
  const raw = await searchParams;
  const search = readSearch(raw);
  const allRooms = search.isValid ? getRooms(search, "all") : [];
  const rooms = search.isValid ? getRooms(search) : [];

  return (
    <main className="flex-1 bg-zinc-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Choose your room
        </h1>

        <div className="mt-6 space-y-6">
          <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-zinc-200" />}>
            <SearchBar search={search} />
          </Suspense>

          {search.errors.length > 0 ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-medium">Fix the following to search or reserve:</p>
              <ul className="mt-2 list-disc pl-5">
                {search.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <RoomFilters
            search={search}
            totalCount={allRooms.length}
            visibleCount={rooms.length}
            isValid={search.isValid}
          />

          {!search.isValid ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-zinc-600">
              Correct the search details above to see available rooms.
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-zinc-600">
              No rooms match your filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  checkoutUrl={buildCheckoutUrl(room.id, search)}
                  canReserve={search.isValid}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
