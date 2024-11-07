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
import { useEffect, useRef, useState } from "react";
import Map3D from "@/components/Map3D";
import { loader } from "@/lib/maps";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function LoginPage() {
  const { login, isProcessing } = useUser();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);

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

  useEffect(() => {
    if (map) {
      const camera = {
        center: {
          lat: 43.878747034000355,
          lng: -103.45850265347022,
          altitude: 1653.6700800236404,
        },
        tilt: 38.562146810825524,
        range: 345.3777056404943,
        heading: -67.68847669942795,
      };
      // @ts-ignore
      map.flyCameraAround({
        camera,
        durationMillis: 120000,
        rounds: 5,
      });
    }
  }, [map]);
  return (
    <Map3D
      mapRef={mapRef}
      setMap={setMap}
      disableLabels
      className="inset-0 fixed"
      options={{
        center: {
          lat: 43.878747034000355,
          lng: -103.45850265347022,
          altitude: 1653.6700800236404,
        },
        tilt: 38.562146810825524,
        range: 345.3777056404943,
        heading: -67.68847669942795,
      }}
    >
      <div className="flex flex-col justify-center grow items-center p-4 bottom-4 left-1/2 absolute -translate-x-1/2 z-10 w-full">
        <div className="w-full md:w-[500px]">
          <svg
            className="w-full"
            viewBox="0 0 224.4478 58.54113"
            version="1.1"
            id="svg1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs id="defs1" />
            <g id="layer1" transform="translate(62.187935,-115.51285)">
              <path
                id="rect1"
                style={{ strokeWidth: 7.165, fill: "#FFFFFF" }}
                d="m -62.187935,115.51285 v 58.54113 H 162.25986 V 115.51285 A 128.66426,86.669678 0 0 1 50.036222,159.93701 128.66426,86.669678 0 0 1 -62.187935,115.51285 Z"
              />
            </g>
          </svg>

          <Card className="rounded-none border-t-0 rounded-b-md">
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
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
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
              <div className="mt-2 text-center">
                Don&apos;t have an account? Register{" "}
                <Link href="/register" className="text-primary">
                  here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Map3D>
  );
}

export default publicRoute(LoginPage);
