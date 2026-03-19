import { z } from "zod";

import {
  INSPECT_URL_PATTERN,
  NANOID_ID_PATTERN,
  SEND_URL_PATTERN,
} from "@/features/bins/lib/constants";

export const PersistedBinSchema = z.object({
  id: z.string().refine((value) => NANOID_ID_PATTERN.test(value), {
    message: "id must be a 10-character nanoid string",
  }),
  created_at: z.coerce.date(),
  expires_at: z.coerce.date(),
});

export const BinSchema = PersistedBinSchema.extend({
  sendUrl: z.string().refine((value) => SEND_URL_PATTERN.test(value), {
    message: "sendUrl must match /api/hooks/{id}",
  }),
  inspectUrl: z.string().refine((value) => INSPECT_URL_PATTERN.test(value), {
    message: "inspectUrl must match /bins/{id}",
  }),
});

export const PersistedBinsSchema = z.array(PersistedBinSchema);
export const BinsSchema = z.array(BinSchema);

export const BinApiResponseSchema = z.object({
  bin: PersistedBinSchema,
  sendUrl: z.string().refine((value) => SEND_URL_PATTERN.test(value), {
    message: "sendUrl must match /api/hooks/{id}",
  }),
  inspectUrl: z.string().refine((value) => INSPECT_URL_PATTERN.test(value), {
    message: "inspectUrl must match /bins/{id}",
  }),
});

export const BinPathSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Bin name is required")
    .max(40, "Bin name must be 40 characters or fewer")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Use only lowercase letters, numbers, and hyphens"
    ),
});

export function normalizeBinPath(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9]/g, "");
}
