import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(10, "content must be atleast on 10 characters").max(300, "content must not be longer than on 300 characters"),
})