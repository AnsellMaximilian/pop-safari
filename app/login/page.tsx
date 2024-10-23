"use client";

import Image from "next/image";
import logo from "@/assets/pop-safari-logo.svg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUser } from "@/contexts/user/UserContext";
import Link from "next/link";
import publicRoute from "@/hooks/publicRoute";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function LoginPage() {
  const { login, isProcessing } = useUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;

    login(email, password);
  }
  return (
    <div className="flex flex-col justify-center grow items-center p-4">
      <Card className="w-full md:w-[500px] max-w-full">
        <CardHeader className="text-center">
          <Image
            src={logo}
            width={100}
            height={100}
            alt="logo"
            className="mx-auto block mb-2"
          />

          <CardTitle className="">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
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
                      <Input
                        type="password"
                        placeholder="Your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex">
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={isProcessing}
                >
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="mt-2">
        Don&apos;t have an account? Register{" "}
        <Link href="/register" className="text-primary">
          here
        </Link>
      </div>
    </div>
  );
}

export default publicRoute(LoginPage);
