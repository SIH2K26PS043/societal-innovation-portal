import { fail, type ApiError } from "@repo/types";

/** Throw this anywhere inside a route() body to return a typed error envelope. */
export class HttpError extends Error {
  constructor(
    public code: ApiError["code"],
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export const errors = {
  unauthorized: (m = "Not signed in") => new HttpError("UNAUTHORIZED", m, 401),
  forbidden: (m = "Insufficient permissions") => new HttpError("FORBIDDEN", m, 403),
  notFound: (m = "Not found") => new HttpError("NOT_FOUND", m, 404),
  validation: (m = "Invalid input") => new HttpError("VALIDATION", m, 400),
  conflict: (m = "Conflict") => new HttpError("CONFLICT", m, 409),
};

/**
 * Wrap every route handler body. Maps thrown HttpErrors + unknown errors to the
 * standard { data, error } envelope so the client always gets a consistent shape.
 */
export async function route(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) {
      return Response.json(fail(e.code, e.message), { status: e.status });
    }
    console.error("[route] Unhandled error:", e);
    return Response.json(fail("SERVER", "Unexpected server error"), { status: 500 });
  }
}
