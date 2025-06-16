import { createAdapter, handleRequest } from "solid-rouage/fetch";
import { serve } from "bun";

const adapter = createAdapter({
  handle: async (request: Request) => {
    const url = new URL(request.url);
    const pathName = url.pathname;
    const acceptEncoding = request.headers.get("Accept-Encoding") || "";

    return handleRequest({ pathName, acceptEncoding });
  },

  listen: () => {
    serve({
      port: process.env.PORT ? Number(process.env.PORT) : 3000,

      routes: {
        "/health": new Response("OK"),
      },

      fetch(request) {
        return adapter!.handle(request);
      },
    });
  },
});

export default adapter;
