import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authrId: v.string(),
    imageStorageId: v.id("_storage"),
  })
    .searchIndex("post_title", {
      searchField: "title",
    })
    .searchIndex("post_content", {
      searchField: "content",
    }),
  comments: defineTable({
    body: v.string(),
    autherName: v.string(),
    autherId: v.string(),
    postId: v.id("posts"),
  }),
});
