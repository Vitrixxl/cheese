import z from "zod";

export const messageSchema = z.union([
  z.object({
    key: z.literal("move"),
    payload: z.object({
      move: z.object({
        from: z.string(),
        to: z.string(),
        promotion: z.optional(z.string()),
      }),
    }),
  }),
  z.object({
    key: z.literal("message"),
    payload: z.object({
      content: z.string(),
    }),
  }),
  z.object({
    key: z.literal("resign"),
    payload: z.null(),
  }),
  z.object({
    key: z.literal("drawOffer"),
    payload: z.null(),
  }),
  z.object({
    key: z.literal("drawResponse"),
    payload: z.object({
      response: z.boolean(),
    }),
  }),
]);
