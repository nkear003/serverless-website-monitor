export type Payload = {
  message: string;
};

namespace NodeJS {
  interface ProcessEnv {
    SENDGRID_API_KEY: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE_NUMBER: string;
    TO_PHONE_NUMBER: string;
    TO_EMAIL: string;
    FROM_EMAIL: string;
    GOOGLE_SHEET_ID: string;
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
