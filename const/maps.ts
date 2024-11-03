export const polygonOptions: google.maps.maps3d.Polygon3DElementOptions = {
  strokeColor: "#EA4335",
  strokeWidth: 4,
  //   strokeOpacity: 0.8,
  fillColor: "blue",
  //   fillOpacity: 0.2,
  altitudeMode: "ABSOLUTE" as google.maps.maps3d.AltitudeMode.ABSOLUTE,
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

// polyline
export const ROUTE_POLYLINE = "ROUTE_POLYLINE";
