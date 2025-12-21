import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCommentsByPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();
    return comments;
  },
});
export const creatComments = mutation({
  args: { body: v.string(), postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("user not found");
    return await ctx.db.insert("comments", {
      postId: args.postId,
      body: args.body,
      autherId: user._id,
      autherName: user.name,
    });
  },
});
