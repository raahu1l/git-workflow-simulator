export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const websocketUrl =
  process.env.NEXT_PUBLIC_WS_URL ||
  apiUrl.replace(/^http/, "ws");
