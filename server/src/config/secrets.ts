import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { getServerConfig } from "./serverConfig";

type AppSecrets = {
  MONGO_URI: string;
  DB_USER: string;
  DB_PASSWORD: string;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;

let cachedSecrets: AppSecrets | null = null;
let cacheExpiresAt = 0;
let inFlightSecretsPromise: Promise<AppSecrets> | null = null;

function getSecretTtlMs(): number {
  const rawTtl = process.env.SECRETS_CACHE_TTL_MS;
  const parsedTtl = Number(rawTtl);

  if (!rawTtl || Number.isNaN(parsedTtl) || parsedTtl <= 0) {
    return DEFAULT_TTL_MS;
  }

  return parsedTtl;
}

function parseSecretString(secretString: string): AppSecrets {
  let parsedSecret: unknown;

  try {
    parsedSecret = JSON.parse(secretString);
  } catch (error) {
    throw new Error(
      `AWS secret payload must be valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!parsedSecret || typeof parsedSecret !== "object") {
    throw new Error("AWS secret payload must be a JSON object.");
  }

  const mongoUri = (parsedSecret as Record<string, unknown>).MONGO_URI;
  const dbUser = (parsedSecret as Record<string, unknown>).DB_USER;
  const dbPassword = (parsedSecret as Record<string, unknown>).DB_PASSWORD;

  if (typeof mongoUri !== "string" || mongoUri.length === 0) {
    throw new Error("AWS secret payload is missing MONGO_URI.");
  }

  if (typeof dbUser !== "string" || dbUser.length === 0) {
    throw new Error("AWS secret payload is missing DB_USER.");
  }

  if (typeof dbPassword !== "string") {
    throw new Error("AWS secret payload is missing DB_PASSWORD.");
  }

  return {
    MONGO_URI: mongoUri,
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
  };
}

async function fetchSecrets(): Promise<AppSecrets> {
  const config = getServerConfig();
  const client = new SecretsManagerClient({ region: config.AWS_REGION });

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: config.AWS_SECRETS_MANAGER_SECRET_ID }),
  );

  if (!response.SecretString) {
    throw new Error("AWS secret did not include SecretString.");
  }

  return parseSecretString(response.SecretString);
}

export async function getSecrets(): Promise<AppSecrets> {
  const now = Date.now();

  if (cachedSecrets && now < cacheExpiresAt) {
    return cachedSecrets;
  }

  if (inFlightSecretsPromise) {
    return inFlightSecretsPromise;
  }

  inFlightSecretsPromise = fetchSecrets()
    .then((secrets) => {
      cachedSecrets = secrets;
      cacheExpiresAt = Date.now() + getSecretTtlMs();
      return secrets;
    })
    .finally(() => {
      inFlightSecretsPromise = null;
    });

  return inFlightSecretsPromise;
}

export type { AppSecrets };
