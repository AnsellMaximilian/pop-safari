"use client";

import Image from "next/image";
import logo from "@/assets/pop-safari-logo.svg";
import defUser from "@/assets/default-user.svg";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import publicRoute from "@/hooks/publicRoute";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { account, config, databases, storage } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "appwrite";
import { useUser } from "@/contexts/user/UserContext";
import Map3D from "@/components/Map3D";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile } from "@/type";
import { cn } from "@/lib/utils";

enum RegisterStep {
  ACCOUNT = "ACCOUNT",
  PROFILE = "PROFILE",
}

const accountFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string(),
});

const profileFormSchema = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be at least 5 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" })
    .regex(/^\S*$/, { message: "Username must not contain spaces" }),
  bio: z.string().max(500),
});

function RegisterPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);

  const { currentUser, getAccount, setCurrentUser } = useUser();
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const { toast } = useToast();
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isProfileCreationLoading, setIsProfileCreationLoading] =
    useState(false);

  const [registerStep, setRegisterStep] = useState<RegisterStep>(
    RegisterStep.ACCOUNT
  );

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreviewURL, setProfilePicturePreviewURL] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileChange: React.ChangeEventHandler<
    HTMLInputElement
  > = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (file) {
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Image Error",
          description: "Currently, the image should not be bigger than 10mb",
        });
        return;
      }
      setProfilePicture(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      password: "",
      email: "",
    },
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
      username: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      setRegisterStep(RegisterStep.PROFILE);

      if (currentUser.profile) router.push("/dashboard");

      if (map) {
        // @ts-ignore
        map.flyCameraTo({
          endCamera: {
            center: {
              lat: 40.690778183679924,
              lng: -74.04598916643296,
              altitude: 4.4824985330985285,
            },
            tilt: 75.0833654030122,
            range: 339.86727774790785,
            heading: -42.73798559581846,
          },
          durationMillis: 5000,
        });
      }
    }
  }, [currentUser, map]);

  async function onCompleteProfile(values: z.infer<typeof profileFormSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;

    if (currentUser === null) return;

    try {
      const { username, bio } = values;
      setIsProfileCreationLoading(true);

      const foundProfiles = await databases.listDocuments(
        config.dbId,
        config.userProfileCollectionId,
        [Query.equal("username", username)]
      );

      if (foundProfiles.total > 0) throw new Error("Username taken");

      // upload picture first
      let profileImageId: null | string = null;
      if (profilePicture) {
        const picture = await storage.createFile(
          config.bucketId,
          currentUser.$id,
          profilePicture
        );

        profileImageId = picture.$id;
      }

      const createdProfile = (await databases.createDocument(
        config.dbId,
        config.userProfileCollectionId,
        currentUser.$id,
        { username, bio, profileImageId, name: currentUser.name },

        [
          Permission.update(Role.user(currentUser.$id)),
          Permission.delete(Role.user(currentUser.$id)),
        ]
      )) as UserProfile;

      setCurrentUser((prev) =>
        prev ? { ...prev, profile: createdProfile } : null
      );
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) errorMsg = error.message;
      hasError = true;
      setIsProfileCreationLoading(false);
    } finally {
      if (hasError)
        toast({
          title: "Profile Creation Failed",
          variant: "destructive",
          description: errorMsg,
        });
    }
  }

  async function onCreateAccount(values: z.infer<typeof accountFormSchema>) {
    let errorMsg = "Something went wrong.";
    let hasError = false;

    try {
      const { name, email, password } = values;
      setIsRegisterLoading(true);

      const createdAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      const session = await account.createEmailPasswordSession(email, password);
      setCurrentUser({ ...createdAccount, profile: null, business: null });
      setRegisterStep(RegisterStep.PROFILE);
    } catch (error) {
      if (error instanceof Error) errorMsg = error.message;
      hasError = true;
      setIsRegisterLoading(false);
    } finally {
      if (hasError)
        toast({
          title: "Registration Failed",
          variant: "destructive",
          description: errorMsg,
        });
    }
  }
  return (
    <Map3D mapRef={mapRef} className="fixed inset-0" setMap={setMap}>
      <div
        className={cn(
          "h-full flex items-center p-4 absolute top-0 z-30 transition-all duration-1000",
          registerStep === RegisterStep.ACCOUNT
            ? "right-full translate-x-full"
            : "right-0 translate-x-0"
        )}
      >
        {registerStep === RegisterStep.ACCOUNT ? (
          <Card
            className="w-full h-full md:w-[500px] max-w-full"
            key={RegisterStep.ACCOUNT}
          >
            <CardHeader className="text-center">
              <Image
                src={logo}
                width={100}
                height={100}
                alt="logo"
                className="mx-auto block mb-2"
              />

              <CardTitle className="">Register</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form
                  onSubmit={accountForm.handleSubmit(onCreateAccount)}
                  className="space-y-4"
                >
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
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
                    control={accountForm.control}
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
                      disabled={isRegisterLoading}
                    >
                      Register
                    </Button>{" "}
                  </div>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Already have an account? Login{" "}
                <Link href="/login" className="text-primary">
                  here
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            className="w-full h-full md:w-[500px] max-w-full ml-auto"
            key={RegisterStep.PROFILE}
          >
            <CardHeader className="text-center">
              <Image
                src={logo}
                width={100}
                height={100}
                alt="logo"
                className="mx-auto block mb-2"
              />

              <CardTitle className="">Complete Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onCompleteProfile)}
                  className="space-y-4"
                >
                  <FormItem className="flex flex-col items-center">
                    <div className="">
                      <Image
                        className="w-32 h-32 rounded-full "
                        width={500}
                        height={500}
                        alt="business picture"
                        onClick={() => fileInputRef?.current?.click()}
                        src={profilePicturePreviewURL ?? defUser}
                      ></Image>
                      <FormControl>
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileChange}
                          ref={fileInputRef}
                        />
                      </FormControl>
                    </div>
                    <FormLabel>Profile Picture</FormLabel>
                  </FormItem>
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a little about yourself"
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
                      disabled={isProfileCreationLoading}
                    >
                      Complete Profile
                    </Button>{" "}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </Map3D>
  );
}

export default RegisterPage;
