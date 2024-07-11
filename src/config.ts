import dotenv from "dotenv";

dotenv.config();

export const setupEnvironment = (): void => {
  const requiredEnvVars = [
    "TO_EMAIL",
    "GOOGLE_SHEET_ID",
    "GOOGLE_SHEET_NAME",
    "GOOGLE_SHEET_PUBLIC_URL",
    "MONITOR_URL",
    "ETHEREAL_PASSWORD",
    "ETHEREAL_EMAIL",
    "MONGO_CONNECTION_STRING",
    "DB_NAME",
    "DB_COLLECTION_NAME",
    "GOOGLE_API_CLIENT_EMAIL",
    "GOOGLE_API_PRIVATE_KEY"
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
  }
};
