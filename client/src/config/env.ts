/**
  This module assumes that the environment is loaded via 
  Vite's built-in .env support.

  Only environment vars prefixed with the value of PREFIX (see below) 
  will be imported.

  Inspiration: 
  https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/config/env.ts
 */

import * as z from "zod";

const PREFIX = "VITE_APP_";
const browserOrigin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost";

const createEnv = () => {
  const EnvSchema = z.object({
    API_URL: z
      .string()
      .optional()
      .transform((value) => value?.trim() ?? ""),
    APP_URL: z
      .string()
      .optional()
      .transform((value) => value?.trim() ?? ""),
    // ENABLE_API_MOCKING: z
    //   .string()
    //   .refine((s) => s === 'true' || s === 'false')
    //   .transform((s) => s === 'true')
    //   .optional(),
    // APP_MOCK_API_PORT: z.string().optional().default('8080'),
  });

  const envVars = Object.entries(import.meta.env).reduce<
    Record<string, string>
  >((acc, curr) => {
    const [key, value] = curr;
    if (key.startsWith(PREFIX)) {
      acc[key.replace(PREFIX, "")] = value;
    }
    return acc;
  }, {});

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
`
    );
  }

  return parsedEnv.data;
};

export const env = createEnv();

export const appOrigin = env.APP_URL || browserOrigin;
export const backendUrl = new URL(env.API_URL || "/", browserOrigin);
export const backendOrigin = backendUrl.origin;
