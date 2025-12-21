"use client";
import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentsSchema } from "@/app/schemas/comments";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import z from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

function CommentSection(props: {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPost>;
}) {
  const params = useParams<{ id: Id<"posts"> }>();
  const creatComment = useMutation(api.comments.creatComments);
  const comments = usePreloadedQuery(props.preloadedComments);
  const form = useForm({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      body: "",
      postId: params.id,
    },
  });
  const [isPending, startTransition] = useTransition();
  async function onSubmit(data: z.infer<typeof commentsSchema>) {
    startTransition(async () => {
      try {
        await creatComment(data);
        form.reset();
        toast.success("Comment added successfully");
      } catch (error) {
        console.log(error);
      }
    });
  }
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <MessageSquare className="size-5" />

        <h2 className="text-xl font-bold">
          {comments ? comments!.length : "0"} Comments
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="body"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Comment</FieldLabel>
                <Textarea
                  aria-invalid={fieldState.invalid}
                  placeholder="please share you thouts"
                  {...field}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Button className="mt-6" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="sr-only">Adding comment...</span>
              </>
            ) : (
              <span className="">Add Comment</span>
            )}
          </Button>
        </form>
        <section className="mt-6">
          {comments?.map((comment) => (
            <div key={comment._id} className="flex gap-2 space-y-8">
              <Avatar className=" space-y-6">
                <AvatarImage
                  className="size-10"
                  src={`https://avatar.vercel.sh/${comment.autherName}?rounded=60`}
                  alt={comment.autherName}
                />
                <AvatarFallback>
                  {comment.autherName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between ">
                  <p className="font-semibold text-sm">{comment.autherName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment._creationTime).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-normal text-muted-foreground">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}

export default CommentSection;
