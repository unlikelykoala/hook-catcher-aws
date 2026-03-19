import type { z } from "zod"

import type {
  BinApiResponseSchema,
  BinPathSchema,
  BinSchema,
  BinsSchema,
  PersistedBinSchema,
  PersistedBinsSchema,
} from "@/features/bins/schemas/bin"
import type {
  BinWithRequestsSchema,
  RequestDocumentSchema,
} from "@/features/bins/schemas/request"

export type Bin = z.infer<typeof BinSchema>
export type Bins = z.infer<typeof BinsSchema>
export type PersistedBin = z.infer<typeof PersistedBinSchema>
export type PersistedBins = z.infer<typeof PersistedBinsSchema>
export type BinApiResponse = z.infer<typeof BinApiResponseSchema>
export type BinPathFormValues = z.infer<typeof BinPathSchema>
export type RequestDocument = z.infer<typeof RequestDocumentSchema>
export type BinWithRequests = z.infer<typeof BinWithRequestsSchema>
