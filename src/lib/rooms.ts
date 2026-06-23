import { daysUntilCheckIn, nightsBetween, parseDate } from "./utils";
import type { Room, SearchParams } from "@/types";

const IMG =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80";

const MOCK_ROOMS: Room[] = [
  {
    id: "king-suite-581",
    name: "1 King Suite",
    images: [{ url: `${IMG}&sig=king1`, alt: "King suite" }],
    bedCount: 1,
    maxOccupancy: 3,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "581 sq ft" },
      { id: "bedrooms", label: "1 bedroom" },
      { id: "occupancy", label: "Sleeps 3" },
      { id: "bed", label: "1 King Bed" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 13, totalPrice: 71, originalTotal: 83, discountAmount: 12 },
    cancellation: { type: "fully_refundable", summary: "Fully refundable", deadline: "2025-09-13" },
    mealPlan: { label: "Breakfast included", included: true },
    remainingCount: 3,
    isLowestPrice: true,
  },
  {
    id: "king-accessible-roll-in",
    name: "King Suite with Accessible Roll-in Shower",
    images: [{ url: `${IMG}&sig=acc1`, alt: "Accessible king suite" }],
    bedCount: 1,
    maxOccupancy: 3,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "520 sq ft" },
      { id: "occupancy", label: "Sleeps 3" },
      { id: "bed", label: "1 King Bed" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 14, totalPrice: 78, originalTotal: 90, discountAmount: 12 },
    cancellation: { type: "fully_refundable", summary: "Fully refundable", deadline: "2025-09-13" },
    mealPlan: null,
    remainingCount: 2,
    isLowestPrice: false,
  },
  {
    id: "king-accessible-tub",
    name: "1 King Bed Accessible Tub",
    images: [{ url: `${IMG}&sig=tub1`, alt: "Accessible tub room" }],
    bedCount: 1,
    maxOccupancy: 2,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "410 sq ft" },
      { id: "occupancy", label: "Sleeps 2" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 12, totalPrice: 68, originalTotal: null, discountAmount: null },
    cancellation: { type: "fully_refundable", summary: "Fully refundable", deadline: "2025-09-13" },
    mealPlan: { label: "Room only", included: false },
    remainingCount: null,
    isLowestPrice: false,
  },
  {
    id: "double-queen-standard",
    name: "2 Queen Beds Standard",
    images: [{ url: `${IMG}&sig=queen1`, alt: "Two queen beds" }],
    bedCount: 2,
    maxOccupancy: 4,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "390 sq ft" },
      { id: "occupancy", label: "Sleeps 4" },
      { id: "bed", label: "2 Queen Beds" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 15, totalPrice: 82, originalTotal: 94, discountAmount: 12 },
    cancellation: { type: "partially_refundable", summary: "Partially refundable", deadline: "2025-09-10" },
    mealPlan: null,
    remainingCount: 5,
    isLowestPrice: false,
  },
  {
    id: "double-queen-deluxe",
    name: "2 Queen Beds Deluxe",
    images: [{ url: `${IMG}&sig=deluxe1`, alt: "Deluxe two queen room" }],
    bedCount: 2,
    maxOccupancy: 4,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "450 sq ft" },
      { id: "occupancy", label: "Sleeps 4" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 17, totalPrice: 95, originalTotal: null, discountAmount: null },
    cancellation: { type: "fully_refundable", summary: "Fully refundable", deadline: "2025-09-13" },
    mealPlan: { label: "Breakfast included", included: true },
    remainingCount: 1,
    isLowestPrice: false,
  },
  {
    id: "studio-king",
    name: "Studio King",
    images: [{ url: `${IMG}&sig=studio1`, alt: "Studio king" }],
    bedCount: 1,
    maxOccupancy: 2,
    amenities: [
      { id: "size", label: "340 sq ft" },
      { id: "occupancy", label: "Sleeps 2" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 11, totalPrice: 62, originalTotal: 70, discountAmount: 8 },
    cancellation: { type: "non_refundable", summary: "Non-refundable", deadline: null },
    mealPlan: null,
    remainingCount: null,
    isLowestPrice: false,
  },
  {
    id: "family-suite-two-queen",
    name: "Family Suite, 2 Queen Beds",
    images: [{ url: `${IMG}&sig=family1`, alt: "Family suite" }],
    bedCount: 2,
    maxOccupancy: 6,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "620 sq ft" },
      { id: "occupancy", label: "Sleeps 6" },
      { id: "bed", label: "2 Queen Beds" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 22, totalPrice: 128, originalTotal: 145, discountAmount: 17 },
    cancellation: { type: "fully_refundable", summary: "Fully refundable", deadline: "2025-09-13" },
    mealPlan: { label: "Breakfast included", included: true },
    remainingCount: 2,
    isLowestPrice: false,
  },
  {
    id: "executive-king",
    name: "Executive King Room",
    images: [{ url: `${IMG}&sig=exec1`, alt: "Executive king" }],
    bedCount: 1,
    maxOccupancy: 2,
    amenities: [
      { id: "parking", label: "Parking included", emphasis: "success" },
      { id: "size", label: "480 sq ft" },
      { id: "occupancy", label: "Sleeps 2" },
      { id: "wifi", label: "Free WiFi" },
    ],
    pricing: { currency: "USD", nightlyRate: 19, totalPrice: 104, originalTotal: null, discountAmount: null },
    cancellation: { type: "fully_refundable", summary: "Fully refundable", deadline: "2025-09-13" },
    mealPlan: { label: "Room only", included: false },
    remainingCount: 4,
    isLowestPrice: false,
  },
];

/** Deterministic 0–1 value from roomId + checkIn (stable across renders). */
function seededChance(roomId: string, checkIn: string): number {
  const key = `${roomId}:${checkIn}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function isBlockedByLeadTime(roomId: string, checkIn: string): boolean {
  const daysOut = daysUntilCheckIn(checkIn);
  if (daysOut > 14) return false;

  const chance = seededChance(roomId, checkIn);
  if (daysOut < 3) return chance < 0.8;
  return chance < 0.4;
}

function scalePricing(room: Room, nights: number, roomCount: number): Room {
  const scale = (n: number) => Math.round(n * nights * roomCount);
  const { pricing } = room;
  return {
    ...room,
    pricing: {
      ...pricing,
      totalPrice: scale(pricing.totalPrice),
      originalTotal: pricing.originalTotal ? scale(pricing.originalTotal) : null,
      discountAmount: pricing.discountAmount ? scale(pricing.discountAmount) : null,
    },
  };
}

function isRoomAvailable(room: Room, search: SearchParams, beds: SearchParams["beds"]): boolean {
  const totalGuests = search.adults + search.childrenAges.length;

  if (room.remainingCount !== null && search.rooms > room.remainingCount) return false;
  if (totalGuests > room.maxOccupancy * search.rooms) return false;
  if (isBlockedByLeadTime(room.id, search.checkIn)) return false;
  if (beds === "1" && room.bedCount !== 1) return false;
  if (beds === "2" && room.bedCount !== 2) return false;

  return true;
}

export function getRooms(search: SearchParams, bedFilter?: SearchParams["beds"]): Room[] {
  if (!parseDate(search.checkIn) || !parseDate(search.checkOut)) return [];

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const beds = bedFilter ?? search.beds;

  return MOCK_ROOMS
    .filter((room) => isRoomAvailable(room, search, beds))
    .map((room) => scalePricing(room, nights, search.rooms));
}

export function getRoomById(roomId: string): Room | undefined {
  return MOCK_ROOMS.find((room) => room.id === roomId);
}
