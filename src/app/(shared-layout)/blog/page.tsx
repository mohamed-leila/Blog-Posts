import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Metadata } from "next";
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
// export const dynamic = "force-static";
// export const revalidate = 30;
export const metadata: Metadata = {
  title: "Blog",
  description: "Read our latest blog posts",
  category: "web development",
  authors: [{ name: "mohamed leila" }],
};
async function BlogPage() {
  return (
    <div className="p-12">
      <div className="space-y-20">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight"> Blog</h1>
          <p className="text-muted-foreground text-2xl">
            Read our latest blog posts
          </p>
        </div>
        <Suspense fallback={<SkeletonCard />}>
          <GetData />
        </Suspense>
      </div>
    </div>
  );
}
async function GetData() {
  // delay for 5 seconds
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  // await connection();
  const posts = await fetchQuery(api.posts.getPost);
  return (
    <div className="grid gap-7 grid-cols-2 md:grid-cols-3">
      {posts.map((post) => (
        <Card className="pt-0" key={post._id}>
          <div className="relative w-full h-48">
            <Image
              src={post.imageUrl ?? "caching-overview.png"}
              alt="caching-overview"
              fill
              className="rounded-t-lg object-cover"
            />
          </div>

          <CardContent className="text-center">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-muted-foreground text-lg">{post.content}</p>
          </CardContent>
          <CardFooter>
            <Link
              href={`/blog/${post._id}`}
              className={buttonVariants({ className: "w-full" })}
            >
              Read More
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
export default BlogPage;

export function SkeletonCard() {
  return (
    <div className=" grid gap-7 grid-cols-2 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className=" flex flex-col space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
