import { env } from "@/env";

export function getOpenapiUrl() {
  return {
    sdi: env.APP_ENV === "production" ? "https://sdi.openapi.it" : "https://test.sdi.openapi.it",
    company: env.APP_ENV === "production" ? "https://company.openapi.com" : "https://test.company.openapi.com",
  };
}
