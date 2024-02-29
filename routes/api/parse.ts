import { createCompoundSchema, createSchema } from "npm:genson-js@0.0.8";

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const schema = Array.isArray(body)
      ? createCompoundSchema(body)
      : createSchema(body);
    return Response.json(schema);
  } catch (error) {
    return new Response("Bad Request: " + error.toString(), { status: 400 });
  }
};
