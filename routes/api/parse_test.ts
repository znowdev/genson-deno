import { assertEquals } from "$std/assert/mod.ts";
import { handler } from "./parse.ts";
import { createCompoundSchema, createSchema } from "npm:genson-js@0.0.8";

const arrayBody = [{ key1: "value1", key2: "value2" }];
const nonArrayBody = { key1: "value1", key2: "value2" };

const url = "http://localhost:3000/api/parse";

Deno.test("handler should return a compound schema for array body", async () => {
  const init: RequestInit = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(arrayBody),
  };

  const response = await handler(new Request(url, init));
  const expectedSchema = createCompoundSchema(arrayBody);

  assertEquals(await response.json(), expectedSchema);
});

Deno.test("handler should return a schema for non-array body", async () => {
  const init: RequestInit = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nonArrayBody),
  };

  const response = await handler(new Request(url, init));
  const expectedSchema = createSchema(nonArrayBody);

  assertEquals(await response.json(), expectedSchema);
});

Deno.test("handler should return 400 for invalid JSON", async () => {
  const init: RequestInit = {
    method: "POST",
    body: "bad",
  };

  const response = await handler(new Request(url, init));

  assertEquals(response.status, 400);
});
