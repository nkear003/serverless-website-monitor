declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    TO_EMAIL: string;
    FROM_EMAIL: string;
    GOOGLE_SHEET_ID: string;
    GOOGLE_SHEET_NAME: string;
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    MONITOR_URL: string;
    ETHEREAL_PASSWORD: string;
    ETHEREAL_USER: string;
    ETHEREAL_NAME: string;
    MONGO_CONNECTION_STRING: string;
    DB_NAME: string;
    DB_COLLECTION_NAME: string;
  }
}
