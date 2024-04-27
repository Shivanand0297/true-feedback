"use client";
import axios, { AxiosError } from "axios";
import { userSignupSchema } from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const SignUp = () => {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [isUsernameUnique, setIsUsernameUnique] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();

  useEffect(() => {
    const checkUniqueUsername = async () => {
      if (username) {
        try {
          setIsCheckingUsername(true);
          setUserMessage("");

          const response = await axios.get<ApiResponse>("/api/check-unique-username", {
            params: {
              username: username,
            },
          });

          if (response.data.success) {
            setIsUsernameUnique(true);
          }
          setUserMessage(response.data.message);
        } catch (error) {
          let err = error as AxiosError<ApiResponse>;
          setUserMessage(err.response?.data.message ?? "Error Checking username");
          toast.error(err.response?.data.message ?? "Error Checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUniqueUsername();
  }, [username]);

  const form = useForm<z.infer<typeof userSignupSchema>>({
    resolver: zodResolver(userSignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof userSignupSchema>) {
    try {
      setIsSubmitting(true);
      const response = await axios.post<ApiResponse>("/api/sign-up", values);
      if (response.data.success) {
        toast.success(response.data.message);
        router.replace(`/verify/${username}`);
      }
    } catch (error) {
      console.error("error in signup form", error);
      let err = error as AxiosError<ApiResponse>;
      toast.error(err.response?.data.message ?? "error in signup form");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-foreground/50 flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Enter your username, email and password below to signup to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              autoComplete="off"
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="shadcn"
                        type="text"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>
                    {isCheckingUsername ? <Loader2 className="size-4 animate-spin" /> : <p>{userMessage}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
