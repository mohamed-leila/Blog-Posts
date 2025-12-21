import z from "zod";
import { Id } from "../../../convex/_generated/dataModel";

export const commentsSchema = z.object({
  body: z.string(),
  postId: z.custom<Id<"posts">>(),
});
