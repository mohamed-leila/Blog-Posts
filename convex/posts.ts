import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("User not found");
    }
    const blogArticle = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authrId: user._id,
      imageStorageId: args.imageStorageId,
    });
    return blogArticle;
  },
});
export const getPost = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return await Promise.all(
      posts.map(async (post) => {
        const resolvedImageId =
          post.imageStorageId !== undefined
            ? await ctx.storage.getUrl(post.imageStorageId)
            : null;
        return { ...post, imageUrl: resolvedImageId };
      })
    );
  },
});
export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }
    const resolvedImage =
      post.imageStorageId !== undefined
        ? await ctx.storage.getUrl(post.imageStorageId)
        : null;
    return {
      ...post,
      imageUrl: resolvedImage,
    };
  },
});
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = authComponent.getAuthUser(ctx);
    if (!user) throw new ConvexError("user is not authntcated");
    return await ctx.storage.generateUploadUrl();
  },
});
// const messages = await ctx.db
//   .query("messages")
//   .withSearchIndex("search_body", (q) =>
//     q.search("body", "hello hi").eq("channel", "#general")
//   )
//   .take(10);
interface SearchPostArgs {
  _id: string;
  title: string;
  content: string;
}
export const searchPosts = query({
  args: {
    query: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = args.limit;
    const results: Array<SearchPostArgs> = [];
    const seen = new Set();
    const pushDoc = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;
        seen.add(doc._id);
        results.push({
          _id: doc._id,
          title: doc.title,
          content: doc.content,
        });
        if (results.length > limit) break;
      }
    };
    const titleMatches = await ctx.db
      .query("posts")
      .withSearchIndex("post_title", (q) => q.search("title", args.query))
      .take(limit);
    await pushDoc(titleMatches);
    const contentMatches = await ctx.db
      .query("posts")
      .withSearchIndex("post_content", (q) => q.search("content", args.query))
      .take(limit);
    await pushDoc(contentMatches);
    return results;
  },
});
