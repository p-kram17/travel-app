import type { Metadata } from "next";
import { getRoomById } from "@/lib/rooms";
import { formatDate, readSearch } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Travel - Checkout",
  description: "Complete your hotel reservation.",
};

interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const raw = await searchParams;
  const search = readSearch(raw);
  const roomId = typeof raw.roomId === "string" ? raw.roomId : "";
  const room = getRoomById(roomId);

  const bookingDetails = [
    { 
      label: "Room", 
      value: room?.name || ""
    },
    { 
      label: "Check-in", 
      value: formatDate(search.checkIn, true) 
    },
    { 
      label: "Check-out", 
      value: formatDate(search.checkOut, true) 
    },
    { 
      label: "Guests", 
      value: `${search.adults} adult${search.adults === 1 ? "" : "s"}${
        search.childrenAges.length
          ? `, ${search.childrenAges.length} child${search.childrenAges.length === 1 ? "" : "ren"} (ages ${search.childrenAges.join(", ")})`
          : ""
      }, ${search.rooms} room${search.rooms === 1 ? "" : "s"}` 
    }
  ];

  return (
    <main className="mx-auto flex justify-center min-h-full w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-black">Checkout</h1>
      <p className="mt-2 text-black">
        Reservation details passed from room selection.
      </p>

      {!search.isValid || !room ? (
        <div role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Invalid or incomplete booking. Go back and select a room again.
        </div>
      ) : (
        <div className="mt-8 flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-zinc-50 text-sm">
          {bookingDetails.map((detail, index) => (
            <div key={index} className="flex items-center justify-between p-4">
              <span className="font-medium text-zinc-500">{detail.label}</span>
              <span className="rounded-md px-3 py-1.5 font-medium text-zinc-900">
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
