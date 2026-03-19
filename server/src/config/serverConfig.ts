import {
  GetParametersCommand,
  SSMClient,
} from "@aws-sdk/client-ssm";

export type ServerConfig = {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_SSL: boolean;
  MONGO_DB_NAME: string;
  MONGO_RETRY_WRITES: boolean;
  AWS_REGION: string;
  AWS_SECRETS_MANAGER_SECRET_ID: string;
};

const PARAMETER_NAMES = {
  AWS_REGION: "/hookcatcher/prod/aws/region",
  AWS_SECRETS_MANAGER_SECRET_ID: "/hookcatcher/prod/aws/sm_secret_id",
  MONGO_DB_NAME: "/hookcatcher/prod/mongo/db_name",
  MONGO_RETRY_WRITES: "/hookcatcher/prod/mongo/retry_writes",
  DB_NAME: "/hookcatcher/prod/postgres/db_name",
  DB_HOST: "/hookcatcher/prod/postgres/host",
  DB_PORT: "/hookcatcher/prod/postgres/port",
  DB_SSL: "/hookcatcher/prod/postgres/ssl",
} as const;

let cachedConfig: ServerConfig | null = null;
let inFlightConfigPromise: Promise<ServerConfig> | null = null;

function isLocalEnvironment(): boolean {
  return process.env.NODE_ENV !== "production";
}

function getRequiredString(
  source: Record<string, string | undefined>,
  key: keyof ServerConfig,
): string {
  const value = source[key]?.trim();

  if (!value) {
    throw new Error(`Missing required configuration value: ${key}`);
  }

  return value;
}

function parseNumber(value: string, key: keyof ServerConfig): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Configuration value ${key} must be a positive integer.`);
  }

  return parsedValue;
}

function parseBoolean(value: string, key: keyof ServerConfig): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`Configuration value ${key} must be "true" or "false".`);
}

function parseConfig(source: Record<string, string | undefined>): ServerConfig {
  return {
    DB_HOST: getRequiredString(source, "DB_HOST"),
    DB_PORT: parseNumber(getRequiredString(source, "DB_PORT"), "DB_PORT"),
    DB_NAME: getRequiredString(source, "DB_NAME"),
    DB_SSL: parseBoolean(getRequiredString(source, "DB_SSL"), "DB_SSL"),
    MONGO_DB_NAME: getRequiredString(source, "MONGO_DB_NAME"),
    MONGO_RETRY_WRITES: parseBoolean(
      getRequiredString(source, "MONGO_RETRY_WRITES"),
      "MONGO_RETRY_WRITES",
    ),
    AWS_REGION: getRequiredString(source, "AWS_REGION"),
    AWS_SECRETS_MANAGER_SECRET_ID: getRequiredString(
      source,
      "AWS_SECRETS_MANAGER_SECRET_ID",
    ),
  };
}

function getLocalConfig(): ServerConfig {
  return parseConfig(process.env);
}

async function getRemoteParameters(): Promise<Record<string, string>> {
  const bootstrapRegion = process.env.AWS_REGION?.trim() || "us-east-1";
  const client = new SSMClient({ region: bootstrapRegion });
  const parameterNames = Object.values(PARAMETER_NAMES);
  const response = await client.send(
    new GetParametersCommand({
      Names: parameterNames,
    }),
  );

  const parameterMap = new Map<string, string>();

  for (const parameter of response.Parameters ?? []) {
    if (parameter.Name && typeof parameter.Value === "string") {
      parameterMap.set(parameter.Name, parameter.Value);
    }
  }

  const missingParameters = parameterNames.filter(
    (parameterName) => !parameterMap.has(parameterName),
  );

  if (missingParameters.length > 0) {
    throw new Error(
      `Missing required SSM parameters: ${missingParameters.join(", ")}`,
    );
  }

  return {
    AWS_REGION: parameterMap.get(PARAMETER_NAMES.AWS_REGION)!,
    AWS_SECRETS_MANAGER_SECRET_ID: parameterMap.get(
      PARAMETER_NAMES.AWS_SECRETS_MANAGER_SECRET_ID,
    )!,
    MONGO_DB_NAME: parameterMap.get(PARAMETER_NAMES.MONGO_DB_NAME)!,
    MONGO_RETRY_WRITES: parameterMap.get(PARAMETER_NAMES.MONGO_RETRY_WRITES)!,
    DB_NAME: parameterMap.get(PARAMETER_NAMES.DB_NAME)!,
    DB_HOST: parameterMap.get(PARAMETER_NAMES.DB_HOST)!,
    DB_PORT: parameterMap.get(PARAMETER_NAMES.DB_PORT)!,
    DB_SSL: parameterMap.get(PARAMETER_NAMES.DB_SSL)!,
  };
}

async function fetchServerConfig(): Promise<ServerConfig> {
  if (isLocalEnvironment()) {
    return getLocalConfig();
  }

  const parameterValues = await getRemoteParameters();
  return parseConfig(parameterValues);
}

export async function loadServerConfig(): Promise<ServerConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (inFlightConfigPromise) {
    return inFlightConfigPromise;
  }

  inFlightConfigPromise = fetchServerConfig()
    .then((config) => {
      cachedConfig = config;
      return config;
    })
    .finally(() => {
      inFlightConfigPromise = null;
    });

  return inFlightConfigPromise;
}

export function getServerConfig(): ServerConfig {
  if (!cachedConfig) {
    throw new Error("Server config has not been loaded yet.");
  }

  return cachedConfig;
}
