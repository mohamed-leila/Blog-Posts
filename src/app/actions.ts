"use server";

import { redirect } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { postSchema } from "./schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { getToken } from "../lib/auth-server";
import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";
export const createBlogPost = async function (
  data: z.infer<typeof postSchema>
) {
  try {
    const parsedData = postSchema.parse(data);
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    const imageUrl = await fetchMutation(
      api.posts.generateUploadUrl,
      {},
      { token }
    );
    const uploadResult = await fetch(imageUrl, {
      method: "POST",
      headers: { "Content-Type": parsedData.image.type },
      body: parsedData.image,
    });
    const { storageId } = await uploadResult.json();
    if (!uploadResult.ok) {
      throw new Error("Failed to upload image");
    }
    await fetchMutation(
      api.posts.createPost,
      {
        title: parsedData.title,
        content: parsedData.content,
        imageStorageId: storageId,
      },
      {
        token,
      }
    );
  } catch {
    return { error: "Faild to creat post" };
  }
  updateTag("posts");
  return redirect("/blog");
};
