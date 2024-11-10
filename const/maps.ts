import { NearbyItemType, LucideIcon } from "@/type";
import { Box, MapPin, MessageCircle } from "lucide-react";

export const polygonOptions: google.maps.maps3d.Polygon3DElementOptions = {
  strokeColor: "#F97316",
  strokeWidth: 4,
  //   strokeOpacity: 0.8,
  fillColor: "rgba(249, 115, 22,.1)",
  //   fillOpacity: 0.2,
  altitudeMode:
    "RELATIVE_TO_GROUND" as google.maps.maps3d.AltitudeMode.RELATIVE_TO_GROUND,
  extruded: true,
  drawsOccludedSegments: true,
};

export const polylineOptions: google.maps.maps3d.Polyline3DElementOptions = {
  strokeColor: "#F97316",
  strokeWidth: 10,
  altitudeMode:
    "RELATIVE_TO_GROUND" as google.maps.maps3d.AltitudeMode.RELATIVE_TO_GROUND,
  extruded: true,
  drawsOccludedSegments: true,
};

export const USER_REGISTRATION_MARKER = "USER_REGISTRATION_MARKER";
export const BUSINESS_REGISTRATION_MARKER = "BUSINESS_REGISTRATION_MARKER";
export const BUSINESS_REGIS_POLY_POINT = "BUSINESS_REGIS_POLY_POINT";

export const SEARCH_PLACE_MARKER = "SEARCH_PLACE_MARKER";
export const CURRENT_USER_POS = "CURRENT_USER_POS";
export const NEARBY_MARKER = "NEARBY_MARKER";

export const GENERAL_MARKER_ONE = "GENERAL_MARKER_ONE";
export const ROUTE_MARKER = "ROUTE_MARKER";

export const SAFARI_SPOT = "SAFARI_SPOT";

// polygons
export const BUSINESS_REGIS_POLYGON = "BUSINESS_REGIS_POLYGON";
export const POLYGON_POINT = "POLYGON_POINT";
export const POLYGON = "POLYGON";
export const TOUR_MARKER = "TOUR_MARKER";

// polyline
export const ROUTE_POLYLINE = "ROUTE_POLYLINE";

export const nearbyItemLabels: { [key in NearbyItemType]: string } = {
  [NearbyItemType.COMMENT]: "Nearby Comment",
  [NearbyItemType.SPOT]: "Nearby Spot",
  [NearbyItemType.POLYGON]: "Nearby Polygon",
};

export const nearbyItemLogo: { [key in NearbyItemType]: LucideIcon } = {
  [NearbyItemType.COMMENT]: MessageCircle,
  [NearbyItemType.SPOT]: MapPin,
  [NearbyItemType.POLYGON]: Box,
};
