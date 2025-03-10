/* eslint-disable node/no-process-env */
export function getAppUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return baseUrl.replace(/^(https?:\/\/)[^.]+\./, "$1app.");
}
