import { FreshContext } from "$fresh/server.ts";
import { getLogger } from "$logging/index.ts";
import { RateLimiterMemory } from "npm:rate-limiter-flexible@5.0.0";

export const handler = [
  getLogger(),
  rate_limiter,
  cors,
];

export async function cors(req: Request, ctx: FreshContext) {
  const origin = req.headers.get("Origin") || "*";
  const resp = await ctx.next();
  const headers = resp.headers;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
  );
  headers.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS, GET, PUT, DELETE",
  );

  return resp;
}

const opts = {
  points: 100, // 6 points
  duration: 10, // Per second
};

const rateLimiter = new RateLimiterMemory(opts);

export async function rate_limiter(_req: Request, ctx: FreshContext) {
  const remoteAddr =
    `${ctx.remoteAddr.transport}:${ctx.remoteAddr.hostname}:${ctx.remoteAddr.port}`;
  return await rateLimiter.consume(remoteAddr, 1) // consume 2 points
    .then(async (rateLimiterRes) => {
      const resp = await ctx.next();
      const headers = resp.headers;

      headers.set("Retry-After", `${rateLimiterRes.msBeforeNext / 1000}`);
      headers.set("X-RateLimit-Limit", `${opts.points}`);
      headers.set("X-RateLimit-Remaining", `${rateLimiterRes.remainingPoints}`);
      headers.set(
        "X-RateLimit-Reset",
        `${new Date(
          Date.now() + rateLimiterRes.msBeforeNext,
        )}`,
      );

      return resp;
    })
    .catch((rateLimiterRes) => {
      console.log(rateLimiterRes.remainingPoints);
      const headers = {
        "Retry-After": `${rateLimiterRes.msBeforeNext / 1000}`,
        "X-RateLimit-Limit": `${opts.points}`,
        "X-RateLimit-Remaining": `${rateLimiterRes.remainingPoints}`,
        "X-RateLimit-Reset": `${new Date(
          Date.now() + rateLimiterRes.msBeforeNext,
        )}`,
      };
      return new Response("Too Many Requests", {
        status: 429,
        headers: headers,
      });
    });
}
