import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { nearbyItemLabels, nearbyItemLogo } from "@/const/maps";
import { NearbyItemInfo } from "@/type";
import { X } from "lucide-react";
import React from "react";

export default function NearbyItem({
  item,
  onClose,
}: {
  item: NearbyItemInfo;
  onClose?: () => void;
}) {
  const Logo = nearbyItemLogo[item.type];
  return (
    <div className=" bg-white rounded-lg min-w-[500px] grow">
      <header className="p-4 flex items-center gap-4">
        <Logo />
        <span className="font-bold text-lg">{nearbyItemLabels[item.type]}</span>

        <Button
          className="ml-auto"
          size="icon"
          variant="outline"
          onClick={() => {
            if (onClose) onClose();
          }}
        >
          <X />
        </Button>
      </header>
      <Separator />
      <div className="p-4">
        <h2 className="text-lg font-bold">{item.title}</h2>
        <p>{item.description || "No description available"}</p>
      </div>
    </div>
  );
}
