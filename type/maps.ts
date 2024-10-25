export interface Map3dEvent extends Event {
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
