import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import CommentSection from "@/components/web/CommentSection";
import { Metadata } from "next";
import PostPresence from "@/components/web/PostPresence";
import { getToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";

type PostIdRouteProps = {
  params: Promise<{ id: Id<"posts"> }>;
};
export async function generateMetadata({
  params,
}: PostIdRouteProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchQuery(api.posts.getPostById, { postId: id });
  if (!post)
    return {
      title: "post not found please try again",
    };

  return {
    title: post.title,
    description: post.content,
  };
}
async function Post({ params }: { params: { id: Id<"posts"> } }) {
  const { id } = await params;
  const token = await getToken();
  const [post, preLoadedComments, userId] = await Promise.all([
    await fetchQuery(api.posts.getPostById, { postId: id }),
    await preloadQuery(api.comments.getCommentsByPost, {
      postId: id,
    }),
    await fetchQuery(api.presence.getUserID, {}, { token }),
  ]);
  if (!userId) {
    return redirect("/auth/login");
  }
  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500 relative ">
      <Link
        className={buttonVariants({
          variant: "outline",
          className: "mb-4",
          size: "lg",
        })}
        href={"/blog"}
      >
        <span className="mr-2 text-xl">
          <ArrowLeft />
        </span>
        <span>Back to blogs</span>
      </Link>
      <div className="relative w-full h-[300px] mb-8 rounded-b-xl">
        <Image
          src={post?.imageUrl ?? "caching-overview.png"}
          alt="caching-overview"
          fill
          className="object-cover object-center hover:scale-105 transition-all duration-300"
        />
      </div>

      <div className="flex flex-col space-y-2 mb-3">
        <h1 className="text-2xl font-bold">{post?.title}</h1>
        <p className="text-muted-foreground text-lg">
          posted on : {new Date(post?._creationTime).toLocaleDateString()}
        </p>
        {userId && <PostPresence roomId={post?._id} userId={userId} />}
      </div>
      <Separator className="mb-6" />
      <div className="text-center">
        <p className="text-muted-foreground font-bold text-xl ">
          {post?.content}
        </p>
      </div>
      <Separator className="mt-6" />
      <CommentSection preloadedComments={preLoadedComments} />
    </div>
  );
}

export default Post;
