import { env } from "@/config/env";
import {
  BinApiResponseSchema,
  PersistedBinsSchema,
} from "@/features/bins/schemas/bin";
import { BinWithRequestsSchema } from "@/features/bins/schemas/request";

export async function getAllBins() {
  const response = await fetch(`${env.API_URL}/api/bins`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch bins: ${response.status}`);
  }

  const data = await response.json();
  const parsedBins = PersistedBinsSchema.parse(data);

  return [...parsedBins].sort(
    (left, right) => right.created_at.getTime() - left.created_at.getTime()
  );
}

export async function createBin() {
  const response = await fetch(`${env.API_URL}/api/bins`, { method: "POST" });

  if (!response.ok) {
    throw new Error("Create bin request failed");
  }

  return BinApiResponseSchema.parse(await response.json());
}

export async function getBin(id: string) {
  const response = await fetch(`${env.API_URL}/api/bins/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error && typeof error.error === "string"
        ? error.error
        : `Failed to fetch bin ${id}: ${response.status}`;

    throw new Error(message);
  }

  return BinWithRequestsSchema.parse(await response.json());
}

export async function deleteBin(id: string) {
  const response = await fetch(`${env.API_URL}/api/bins/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Deletion of bin ${id} was unsuccessful.`);
  }
}
