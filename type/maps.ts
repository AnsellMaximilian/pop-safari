export interface Map3dEvent extends Event {
  placeId?: string;
  position: {
    Eg: number;
    Fg: number;
    Hg: number;
    altitude: number;
    lat: number;
    lng: number;
  };
}

export type Coordinate = {
  lat: number;
  lng: number;
  altitude: number;
};

export enum MarkerPlaceMode {
  POLY = "POLY",
  POINT = " POINT",
}

export interface PlacePhotoAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: PlacePhotoAttribution[];
}

export interface OpeningHoursPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
    date?: {
      year: number;
      month: number;
      day: number;
    };
  };
  close: {
    day: number;
    hour: number;
    minute: number;
    date?: {
      year: number;
      month: number;
      day: number;
    };
  };
}

export interface RegularOpeningHours {
  openNow: boolean;
  periods: OpeningHoursPeriod[];
  weekdayDescriptions: string[];
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Viewport {
  low: Location;
  high: Location;
}

export interface DisplayName {
  text: string;
  languageCode: string;
}

export interface MapResponse<T> {
  data: T;
}

export interface PlaceData {
  id: string;
  types?: string[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  formattedAddress?: string;
  location?: Location;
  viewport?: Viewport;
  rating?: number;
  websiteUri?: string;
  regularOpeningHours?: RegularOpeningHours;
  currentOpeningHours?: RegularOpeningHours;
  userRatingCount?: number;
  displayName?: DisplayName;
  photos?: PlacePhoto[];
}

export interface PlaceDisplay {
  place_id: string;
  name: string;
  photo?: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  distanceMeters: number;
  staticDuration: string;
  polyline: {
    encodedPolyline: string;
  };
  startLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  endLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  navigationInstruction: {
    maneuver: string;
    instructions: string;
  };
  localizedValues: {
    distance: {
      text: string;
    };
    staticDuration: {
      text: string;
    };
  };
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";
}

// RouteLeg type
export interface RouteLeg {
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  polyline: {
    encodedPolyline: string;
  };
  startLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  endLocation: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
  steps: RouteStep[];
  localizedValues: {
    distance: {
      text: string;
    };
    duration: {
      text: string;
    };
    staticDuration: {
      text: string;
    };
  };
}

export interface RouteLocation {
  location: {
    latLng: LatLng;
  };
}

export interface RouteRequest {
  origin: RouteLocation;
  destination: RouteLocation;
  intermediates: RouteLocation[];
  travelMode: "DRIVE" | "BICYCLE" | "WALK" | "TRANSIT";
  routingPreference?: "TRAFFIC_AWARE" | "TRAFFIC_UNAWARE";
  computeAlternativeRoutes?: boolean;
  routeModifiers?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
  };
  languageCode?: string;
  units?: "METRIC";
}

// Response type for route function
export interface RouteResponse {
  routes: Array<{
    legs: RouteLeg[];

    duration: string; // e.g., "15 mins"
    distanceMeters: number;
    polyline: {
      encodedPolyline: string;
    };
  }>;
}
