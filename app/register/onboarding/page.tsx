"use client";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { SiGooglemybusiness } from "react-icons/si";
import OnboardType from "./OnboardType";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import privateRoute from "@/hooks/privateRoute";
import { useUser } from "@/contexts/user/UserContext";

export enum IOnboardType {
  USER = "USER",
  BUSINESS = "BUSINESS",
}
function Onboarding() {
  const router = useRouter();
  const { currentUser } = useUser();

  const [selectedType, setSelectedType] = useState<IOnboardType>(
    IOnboardType.USER
  );

  useEffect(() => {
    if (currentUser?.profile) router.push("/maps");
  }, [currentUser]);
  return (
    <div className="grow container mx-auto p-8 flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-8 grow">
        <OnboardType
          onClick={() => setSelectedType(IOnboardType.USER)}
          name="User"
          icon={FaUsers}
          selected={selectedType === IOnboardType.USER}
          type={IOnboardType.USER}
        />
        <OnboardType
          onClick={() => setSelectedType(IOnboardType.BUSINESS)}
          name="Business"
          icon={SiGooglemybusiness}
          selected={selectedType === IOnboardType.BUSINESS}
          type={IOnboardType.BUSINESS}
        />
      </div>
      <div className="flex">
        <Button
          className="ml-auto"
          onClick={() => {
            router.push(
              `/register/onboarding/${
                selectedType === IOnboardType.USER ? "user" : "business"
              }`
            );
          }}
        >
          Proceed
        </Button>
      </div>
    </div>
  );
}

export default privateRoute(Onboarding);
