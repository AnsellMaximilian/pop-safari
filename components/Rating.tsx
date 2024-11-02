import { Star } from "lucide-react";
import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

export default function Rating({
  rating,
  showPoints = false,
}: {
  rating: number;
  showPoints?: boolean;
}) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2 items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          return Math.floor(rating) >= i + 1 ? (
            <FaStar className="text-yellow-300" />
          ) : (
            <FaRegStar />
          );
        })}
      </div>
      {showPoints && (
        <div className="text-xs font-bold self-center align-middle leading-3">
          {rating}
        </div>
      )}
    </div>
  );
}
