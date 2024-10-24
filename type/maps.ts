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
