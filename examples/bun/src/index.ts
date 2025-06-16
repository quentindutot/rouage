import { handleRequest } from "solid-rouage/fetch";

Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,

  routes: {
    // Health check
    "/health": new Response("OK"),
  },

  // Fallback handler for all other routes
  async fetch(request: Request) {
    const url = new URL(request.url);
    const pathName = url.pathname;
    const acceptEncoding = request.headers.get("Accept-Encoding") || "";

    return handleRequest({ pathName, acceptEncoding });
  },
});
