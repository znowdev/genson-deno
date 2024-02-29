import { FreshContext } from "$fresh/server.ts";
import { createSchema,createCompoundSchema } from "npm:genson-js@0.0.8";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
    try {
        const body = await req.json()
        let schema: string;
        if (Array.isArray(body)) {
            schema = createCompoundSchema(body);
        } else {
            schema = createSchema(body);
        }
        return Response.json(schema);
    } catch (error) {
        return new Response("Bad Request", { status: 400 });
    }
  };
