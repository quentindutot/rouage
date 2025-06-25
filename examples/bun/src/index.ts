import { createAdapter, handleRequest } from "solid-rouage/fetch";
import { serve } from "bun";

const adapter = createAdapter({
  handle: async (request) => {
    const url = new URL(request.url);
    const pathName = url.pathname;
    const acceptEncoding = request.headers.get("Accept-Encoding") || "";

    const response = await handleRequest({ pathName, acceptEncoding });
    return response;
  },

  listen: () => {
    serve({
      port: process.env.PORT ? Number(process.env.PORT) : 3000,

      routes: {
        "/health": new Response("OK"),
      },

      fetch: async (request) => {
        return (
          (await adapter.handle(request)) ??
          new Response("Not Found", { status: 404 })
        );
      },
    });
  },
});

export default adapter;
