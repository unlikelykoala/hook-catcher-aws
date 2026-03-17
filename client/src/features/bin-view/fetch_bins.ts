import { env } from "@/config/env"
import { PersistedBinsSchema } from "@/components/custom-ui/schema"
import { BinWithRequestsSchema } from "@/types/request"

export async function getAllBins() {
  const response = await fetch(`${env.API_URL}/api/bins`)
  if (!response.ok) {
    throw new Error(`Failed to fetch bins: ${response.status}`)
  }
  const data = await response.json()
  return PersistedBinsSchema.parse(data)
}

export async function getBin(id: string) {
  const response = await fetch(`${env.API_URL}/api/bins/${id}`)
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const message =
      error && typeof error.error === "string"
        ? error.error
        : `Failed to fetch bin ${id}: ${response.status}`

    throw new Error(message)
  }
  const data = await response.json()
  return BinWithRequestsSchema.parse(data)
}

export async function deleteBin(id: string) {
  const response = await fetch(`${env.API_URL}/api/bins/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`Deletion of bin ${id} was unsuccessful.`)
  }
}
