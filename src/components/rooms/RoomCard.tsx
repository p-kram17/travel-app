"use client";

import Image from "next/image";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  checkoutUrl: string;
  canReserve: boolean;
}

export function RoomCard({ room, checkoutUrl, canReserve }: RoomCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const image = room.images[imageIndex] ?? room.images[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-zinc-100">
        {room.isLowestPrice ? (
          <span className="absolute left-0 top-0 z-10 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
            Our lowest price
          </span>
        ) : null}

        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : null}

        {room.images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setImageIndex((i) => (i === 0 ? room.images.length - 1 : i - 1))}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setImageIndex((i) => (i === room.images.length - 1 ? 0 : i + 1))}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-semibold text-zinc-900">{room.name}</h2>

        <ul className="mt-3 space-y-2 text-sm">
          {room.amenities.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              {a.id === "parking" ? (
                <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white">
                  P
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              )}
              <span className={a.emphasis === "success" ? "font-medium text-emerald-700" : "text-zinc-700"}>
                {a.label}
              </span>
            </li>
          ))}
        </ul>

        {room.mealPlan ? (
          <p className="mt-3 text-sm text-zinc-700">
            <span className="font-medium">Meals:</span> {room.mealPlan.label}
          </p>
        ) : null}

        <div className="mt-3">
          <p className={`text-sm font-medium ${room.cancellation.type === "non_refundable" ? "text-zinc-600" : "text-emerald-700"}`}>
            {room.cancellation.summary}
          </p>
          {room.cancellation.deadline ? (
            <p className="text-xs text-zinc-500">Before {formatDate(room.cancellation.deadline, true)}</p>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-4">
            {room.remainingCount !== null ? (
              <p className="text-sm font-medium text-red-600">We have {room.remainingCount} left</p>
            ) : (
              <span />
            )}
            <div className="text-right">
              {room.pricing.discountAmount ? (
                <span className="mb-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  {formatCurrency(room.pricing.discountAmount)} off
                </span>
              ) : null}
              <p className="text-xs text-zinc-500">{formatCurrency(room.pricing.nightlyRate)} nightly</p>
              <p className="text-xl font-bold text-zinc-900">
                {formatCurrency(room.pricing.totalPrice)} <span className="text-base">total</span>
              </p>
              {room.pricing.originalTotal ? (
                <p className="text-sm text-zinc-400 line-through">{formatCurrency(room.pricing.originalTotal)}</p>
              ) : null}
              <p className="text-xs text-zinc-500">Total with taxes and fees</p>
            </div>
          </div>

          {canReserve ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Reserve
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-lg bg-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-500"
            >
              Reserve
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
