export interface SearchParams {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  childrenAges: number[];
  beds: "all" | "1" | "2";
  /** Per-room adults (length === rooms). */
  roomAdults: number[];
  /** Per-room child ages (length === rooms). */
  roomChildren: number[][];
}

export interface Room {
  id: string;
  name: string;
  images: { url: string; alt: string }[];
  bedCount: 1 | 2;
  maxOccupancy: number;
  amenities: { id: string; label: string; emphasis?: "success" }[];
  pricing: {
    currency: string;
    nightlyRate: number;
    totalPrice: number;
    originalTotal: number | null;
    discountAmount: number | null;
  };
  cancellation: {
    type: "fully_refundable" | "partially_refundable" | "non_refundable";
    summary: string;
    deadline: string | null;
  };
  mealPlan: { label: string; included: boolean } | null;
  remainingCount: number | null;
  isLowestPrice: boolean;
}

export interface RoomGuestDraft {
  adults: number;
  childrenAges: number[];
}
