import z from "zod";
export const TodoCreateSchema = z.object(
  {
    title: z.string({ error: "title is required." }).trim().min(3).max(100),
    isDone: z.boolean().default(false),
  },
  {
    error: "Invalid data in body.",
  }
);
export const UpdatedSchema = TodoCreateSchema.partial();

export const ReorderSchema = z.array(
  z.object({
    _id: z.string(),
    order: z.number(),
  })
);
