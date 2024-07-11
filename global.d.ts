declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    TO_EMAIL: string;
    FROM_EMAIL: string;
    FROM_NAME: string;
    GOOGLE_SHEET_ID: string;
    GOOGLE_SHEET_PUBLIC_URL: string;
    GOOGLE_SHEET_NAME: string;
    GOOGLE_CLIENT_EMAIL: string;
    MONITOR_URL: string;
    ETHEREAL_PASSWORD: string;
    ETHEREAL_EMAIL: string;
    ETHEREAL_NAME: string;
    MONGO_CONNECTION_STRING: string;
    DB_NAME: string;
    DB_COLLECTION_NAME: string;
  }
}
