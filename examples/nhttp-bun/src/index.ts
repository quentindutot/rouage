import nhttp, { type RequestEvent } from "@nhttp/nhttp";
import { createAdapter, handleRequest } from "solid-rouage/fetch";
import { serve } from "srvx";

const app = nhttp();

app.get("/health", (rev: RequestEvent) => {
  return rev.response.send("OK");
});

app.any("/**", async (rev: RequestEvent) => {
  const pathName = rev.path;
  const acceptEncoding = rev.headers.get("Accept-Encoding") || "";

  const response = await handleRequest({ pathName, acceptEncoding });
  return response;
});

export default createAdapter({
  handle: (request) => app.fetch(request),
  listen: () => serve({ fetch: app.fetch }),
});
