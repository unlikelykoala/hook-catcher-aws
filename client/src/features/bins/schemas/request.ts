import { z } from "zod"

import { PersistedBinSchema } from "@/features/bins/schemas/bin"

export const RequestDocumentSchema = z.object({
  _id: z.string(),
  method: z.string(),
  path: z.string(),
  headers: z.record(z.string(), z.unknown()),
  body: z
    .unknown()
    .transform((value) =>
      typeof value === "string" ? value : JSON.stringify(value)
    ),
  bin_id: z.string(),
  received_at: z.coerce.date(),
})

export const BinWithRequestsSchema = z.object({
  bin: PersistedBinSchema,
  requests: z.array(RequestDocumentSchema),
})
