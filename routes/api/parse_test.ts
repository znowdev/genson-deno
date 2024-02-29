import { assertEquals } from "$std/assert/mod.ts";
import { handler } from "./parse.ts";
import { createCompoundSchema, createSchema } from "npm:genson-js@0.0.8";

Deno.test("handler should return a compound schema for array body", async () => {
  const mockRequest = {
    json: async () => [{ key1: "value1", key2: "value2" }],
  };

  const response = await handler(mockRequest as any, {} as any);

  const expectedSchema = createCompoundSchema([{
    key1: "value1",
    key2: "value2",
  }]);

  assertEquals(await response.json(), expectedSchema);
});

Deno.test("handler should return a schema for non-array body", async () => {
  const mockRequest = {
    json: async () => ({ key1: "value1", key2: "value2" }),
  };

  const response = await handler(mockRequest as any, {} as any);

  const expectedSchema = createSchema(await mockRequest.json());

  assertEquals(await response.json(), expectedSchema);
});

Deno.test("handler should return 400 for invalid JSON", async () => {
  const mockRequest = {
    json: async () => {
      throw new Error();
    },
  };

  const response = await handler(mockRequest as any, {} as any);

  assertEquals(response.status, 400);
});
