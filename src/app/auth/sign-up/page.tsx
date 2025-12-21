"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/app/schemas/auth";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function SignUp() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  function onSubmit(data: z.infer<typeof signUpSchema>) {
    startTransition(async () => {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed up successfully");
            router.push("/");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  }
  return (
    <Card className="space-y-2">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Sign up to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    type="text"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Button
              disabled={isPending}
              type="submit"
              className={buttonVariants({ variant: "default" })}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing up...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
