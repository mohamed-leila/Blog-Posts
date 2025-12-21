"use client";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { createBlogPost } from "@/app/actions";

function CreatRoute() {
  // const mutation = useMutation(api.posts.createPost)
  const [isPending, startTransition] = useTransition();
  // const router = useRouter();
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      image: undefined,
    },
  });
  async function onSubmit(data: z.infer<typeof postSchema>) {
    startTransition(async () => {
      await createBlogPost(data);
    });
    toast.success("Post created successfully");
    form.reset();
  }
  return (
    <div className="py-12">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Create New Post
        </h1>
        <p className="text-muted-foregroun d text-2xl">
          Create your own blog article
        </p>
      </div>
      {/* FORM */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle></CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>title</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Content</FieldLabel>
                    <Textarea {...field} aria-invalid={fieldState.invalid} />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Iamge</FieldLabel>
                    <Input
                      className="cursor-pointer"
                      aria-invalid={fieldState.invalid}
                      type="file"
                      accept="image"
                      onChange={(event) => {
                        const file = event.target.files![0];
                        field.onChange(file);
                      }}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Button disabled={isPending} variant={"default"}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creating...</span>{" "}
                  </>
                ) : (
                  <span>Create</span>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatRoute;
