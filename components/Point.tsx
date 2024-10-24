import { Coordinate } from "@/type/maps";
import { MdHeight } from "react-icons/md";
import { TbWorldLatitude, TbWorldLongitude } from "react-icons/tb";

import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  coord: Coordinate;
}

export default function Point({ coord, ...props }: Props) {
  return (
    <div {...props} className={cn("flex gap-1 text-xs", props.className)}>
      <div className="flex gap-2 border-border p-2 rounded-md border shadow-sm items-center">
        <TbWorldLatitude /> <span>{coord.lat}</span>
      </div>
      <div className="flex gap-2 border-border p-2 rounded-md border shadow-sm items-center">
        <TbWorldLongitude /> <span>{coord.lng}</span>
      </div>
      <div className="flex gap-2 border-border p-2 rounded-md border shadow-sm items-center">
        <MdHeight /> <span>{coord.altitude}</span>
      </div>
    </div>
  );
}
