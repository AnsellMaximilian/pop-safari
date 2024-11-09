import {
  NEARBY_MARKER,
  POLYGON,
  POLYGON_POINT,
  polygonOptions,
  SEARCH_PLACE_MARKER,
} from "@/const/maps";
import {
  FlyCameraOptions,
  LatLng,
  LatLngAlt,
  PlaceData,
  RouteRequest,
  RouteResponse,
  RouteStep,
} from "@/type/maps";
import {
  removeElementsWithClass,
  removeElementsWithSelector,
} from "@/utils/maps";
import { Loader } from "@googlemaps/js-api-loader";
import axios from "axios";
import { v4 } from "uuid";

export const loader = new Loader({
  apiKey: String(process.env.NEXT_PUBLIC_MAPS_API_KEY),
  version: "alpha",
});

export async function initAutocomplete(
  map3DElement: google.maps.maps3d.Map3DElement,
  onFoundPlace?: (place: google.maps.places.PlaceResult) => Promise<void>
) {
  // @ts-ignore
  const { Autocomplete } = await google.maps.importLibrary("places");
  const autocomplete = new Autocomplete(document.getElementById("pac-input"), {
    fields: ["geometry", "name", "place_id"],
  });

  const listener: google.maps.MapsEventListener = autocomplete.addListener(
    "place_changed",
    () => {
      //viewer.entities.removeAll();
      const place: google.maps.places.PlaceResult = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.viewport) {
        window.alert("No viewport for input: " + place.name);
        return;
      }

      if (onFoundPlace) {
        onFoundPlace(place);
      }

      // zoomToViewport(place.geometry, map3DElement, place);
      zoomToLocation(place.geometry.location!, map3DElement, place);
    }
  );

  return listener;

  // google.maps.event.removeListener(listener);
}

export const zoomToViewport = async (
  geometry: google.maps.places.PlaceGeometry,
  map3DElement: google.maps.maps3d.Map3DElement,
  place: google.maps.places.PlaceResult
) => {
  // @ts-ignore
  const { AltitudeMode, Polyline3DElement } = await google.maps.importLibrary(
    "maps3d"
  );
  let viewport = geometry.viewport!;
  let locationPoints = [
    { lat: viewport.getNorthEast().lat(), lng: viewport.getNorthEast().lng() },
    { lat: viewport.getSouthWest().lat(), lng: viewport.getNorthEast().lng() },
    { lat: viewport.getSouthWest().lat(), lng: viewport.getSouthWest().lng() },
    { lat: viewport.getNorthEast().lat(), lng: viewport.getSouthWest().lng() },
    { lat: viewport.getNorthEast().lat(), lng: viewport.getNorthEast().lng() },
  ];
  let locationPolyline = new Polyline3DElement({
    altitudeMode: AltitudeMode.CLAMP_TO_GROUND,
    strokeColor: "blue",
    strokeWidth: 10,
    coordinates: locationPoints,
  });
  map3DElement.append(locationPolyline);
  let elevation = await getElevationforPoint(geometry.location!, place);
  if (map3DElement) {
    map3DElement.center = {
      lat: geometry.location!.lat(),
      lng: geometry.location!.lng(),
      altitude: elevation ?? 0 + 50,
    };
    map3DElement.heading = 0;
    map3DElement.range = 1000;
    map3DElement.tilt = 65;
  }
};

export async function getElevationforPoint(
  location: google.maps.LatLng,
  place: google.maps.places.PlaceResult
) {
  // @ts-ignore
  const { ElevationService } = await google.maps.importLibrary("elevation");
  // Get place elevation using the ElevationService.
  const elevatorService = new google.maps.ElevationService();
  const elevationResponse = await elevatorService.getElevationForLocations({
    locations: [location],
  });
  if (!(elevationResponse.results && elevationResponse.results.length)) {
    window.alert(`Insufficient elevation data for place: ${place.name}`);
    return;
  }
  const elevation = elevationResponse.results[0].elevation || 10;
  return elevation;
}

export const zoomToLocation = async (
  location: google.maps.LatLng,
  map3DElement: google.maps.maps3d.Map3DElement,
  place: google.maps.places.PlaceResult
) => {
  // @ts-ignore
  const { Marker3DElement } = await google.maps.importLibrary("maps3d");

  removeElementsWithClass(SEARCH_PLACE_MARKER);

  // Place a marker at the location
  const marker = new Marker3DElement({
    position: { lat: location.lat(), lng: location.lng(), altitude: 50 }, // Set altitude as needed
    title: "Selected Location",
    label: "Found Place",
  });
  marker.classList.add(SEARCH_PLACE_MARKER);
  map3DElement.append(marker);

  // Zoom to the marker location
  let elevation = await getElevationforPoint(location, place);
  map3DElement.center = {
    lat: location.lat(),
    lng: location.lng(),
    altitude: elevation ?? 0 + 50,
  };
  map3DElement.heading = 0;
  map3DElement.range = 1000;
  map3DElement.tilt = 65;
};
// NEARBY

export async function getNearbyPlaces(
  lat: number,
  lng: number,
  map?: google.maps.maps3d.Map3DElement,
  radius: number = 500
) {
  //@ts-ignore
  const { Place, SearchNearbyRankPreference } =
    (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
  // @ts-ignore
  const { Marker3DElement } = (await google.maps.importLibrary(
    "maps3d"
  )) as google.maps.Maps3DLibrary;

  // Restrict within the map viewport.
  let center = new google.maps.LatLng(lat, lng);

  const request = {
    // required parameters
    fields: ["displayName", "location", "businessStatus"],
    locationRestriction: {
      center: center,
      radius: 500,
    },
    // optional parameters
    maxResultCount: 5,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: "en-US",
    region: "us",
  };

  //@ts-ignore
  const { places } = await Place.searchNearby(request);
  removeElementsWithClass(NEARBY_MARKER);

  if (places.length && map) {
    const { LatLngBounds } = (await google.maps.importLibrary(
      "core"
    )) as google.maps.CoreLibrary;

    // Loop through and get all the results.
    places.forEach((place) => {
      const marker = new Marker3DElement({
        position: { lat: place.location?.lat(), lng: place.location?.lng() },
        label: place.displayName ?? "Place",
      });

      marker.classList.add(NEARBY_MARKER);
      map.append(marker);
    });
  }
  return places;
}

export async function computeRoute(
  request: RouteRequest
): Promise<RouteResponse> {
  try {
    const response = await axios.post<RouteResponse>(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        ...request,
        units: "METRIC", // Ensuring units are set to Metric
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": String(process.env.NEXT_PUBLIC_MAPS_API_KEY),
          "X-Goog-FieldMask":
            // "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs,routes.legs.steps,routes.legs.distanceMeters,routes.legs.duration,routes.legs.steps.polyline.encodedPolyline",
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error computing route:", error);
    throw error;
  }
}

export function getBaseRouteRequest(
  originLatLng: LatLng,
  destinationLatLng: LatLng,
  intermediates: LatLng[]
) {
  // Example usage of computeRoute function
  const routeRequest: RouteRequest = {
    origin: {
      location: {
        latLng: {
          latitude: originLatLng.latitude,
          longitude: originLatLng.longitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destinationLatLng.latitude,
          longitude: destinationLatLng.longitude,
        },
      },
    },
    intermediates: intermediates.map((i) => ({
      location: {
        latLng: {
          latitude: i.latitude,
          longitude: i.longitude,
        },
      },
    })),
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false,
    },
    languageCode: "en-US",
  };

  return routeRequest;
}

export async function getPlaceDetails(
  placeId: string
): Promise<PlaceData | null> {
  try {
    const placeDetails = (await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,photos,currentOpeningHours,currentSecondaryOpeningHours,internationalPhoneNumber,nationalPhoneNumber,priceLevel,rating,regularOpeningHours,regularSecondaryOpeningHours,userRatingCount,websiteUri,formattedAddress,location,types,viewport&key=${String(
        process.env.NEXT_PUBLIC_MAPS_API_KEY
      )}`
    )) as { data: PlaceData };

    return placeDetails.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function createPolygon(
  map: google.maps.maps3d.Map3DElement,
  points: LatLng[],
  altitude: number = 300,
  id: string,
  strokeColor?: string,
  fillColor?: string
) {
  const options = polygonOptions;

  if (strokeColor) options.strokeColor = strokeColor;
  if (fillColor) options.fillColor = fillColor;
  const polygon = new google.maps.maps3d.Polygon3DElement(options);
  polygon.outerCoordinates = points.map((p) => ({
    lat: p.latitude,
    lng: p.longitude,
    altitude: altitude,
  }));
  polygon.classList.add(POLYGON);
  polygon.classList.add(id);
  polygon.id = id;
  map.append(polygon);
}

export const generateValidId = () => {
  return "VALID_" + v4();
};

export async function getElevation(coord: LatLng) {
  const location = new google.maps.LatLng(coord.latitude, coord.longitude);
  // @ts-ignore
  const { ElevationService } = await google.maps.importLibrary("elevation");
  // Get place elevation using the ElevationService.
  const elevatorService = new google.maps.ElevationService();
  const elevationResponse = await elevatorService.getElevationForLocations({
    locations: [location],
  });

  if (!(elevationResponse.results && elevationResponse.results.length)) {
    return 100;
  }
  const elevation = elevationResponse.results[0].elevation || 10;

  return elevation;
}

export function findCenter(coordinates: LatLng[]): LatLng {
  let totalLat = 0;
  let totalLng = 0;

  coordinates.forEach((coord) => {
    totalLat += coord.latitude;
    totalLng += coord.longitude;
  });

  const centerLat = totalLat / coordinates.length;
  const centerLng = totalLng / coordinates.length;

  return { latitude: centerLat, longitude: centerLng };
}

export async function flyAlongRoute(
  map: google.maps.maps3d.Map3DElement,
  steps: LatLng[],
  durationPerStep: number = 500
) {
  const pointsWithAltitudes = await getAltitudesForPoints(steps);

  let currentStep = 0;

  function flyToNextStep() {
    if (currentStep >= pointsWithAltitudes.length - 1) return;

    const startCenter = map.center!;
    const targetCenter = pointsWithAltitudes[currentStep];
    const startTilt = map.tilt || 45;
    const targetTilt = 45;
    const startHeading = map.heading || 10;
    const targetHeading = startHeading + 10;
    const startRange = map.range || 500;
    const targetRange = 500;

    let startTime: number | null = null;

    function animateStep(time: number) {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / durationPerStep;
      const easedProgress = Math.min(progress, 1);

      map.center = {
        lat:
          startCenter.lat +
          (targetCenter.latitude - startCenter.lat) * easedProgress,
        lng:
          startCenter.lng +
          (targetCenter.longitude - startCenter.lng) * easedProgress,
        altitude:
          startCenter.altitude +
          (startCenter.altitude - startCenter.altitude) * easedProgress,
      };
      map.tilt = startTilt + (targetTilt - startTilt) * easedProgress;
      map.heading =
        startHeading + (targetHeading - startHeading) * easedProgress;
      map.range = startRange + (targetRange - startRange) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        currentStep++;
        flyToNextStep();
      }
    }

    requestAnimationFrame(animateStep);
  }

  flyToNextStep();
}
export async function getAltitudesForPoints(
  points: LatLng[],
  offset: number = 50
): Promise<LatLngAlt[]> {
  const altitudes = await Promise.all(
    points.map(async (point) => {
      const elevation = await getElevation({
        latitude: point.latitude,
        longitude: point.longitude,
      });
      return { ...point, altitude: elevation + offset };
    })
  );
  return altitudes;
}

function calculateHeading(start: LatLng, end: LatLng): number {
  const dLon = ((end.longitude - start.longitude) * Math.PI) / 180;
  const lat1 = (start.latitude * Math.PI) / 180;
  const lat2 = (end.latitude * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getOffsetPosition(
  start: LatLng,
  heading: number,
  distanceMeters: number
): LatLng {
  const earthRadius = 6371000;
  const angularDistance = distanceMeters / earthRadius;

  const lat1 = (start.latitude * Math.PI) / 180;
  const lng1 = (start.longitude * Math.PI) / 180;
  const headingRad = (heading * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(headingRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(headingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lng2 * 180) / Math.PI,
  };
}

export async function animateCameraAlongRouteWithForwardLooking(
  map: google.maps.maps3d.Map3DElement,
  points: LatLng[],
  durationPerStep: number = 2000,
  followDistance: number = 10
) {
  const pointsWithAltitudes = await getAltitudesForPoints(points);

  let currentPoint = 0;

  function flyToNextSegment() {
    if (currentPoint >= pointsWithAltitudes.length - 1) return;

    const start = pointsWithAltitudes[currentPoint];
    const end = pointsWithAltitudes[currentPoint + 1];
    const heading = calculateHeading(start, end);

    const offsetPosition = getOffsetPosition(start, heading, -followDistance);
    const targetAltitude = end.altitude;

    const startCenter = map.center!;
    const startTilt = map.tilt!;
    const startHeading = map.heading!;
    const startRange = map.range!;
    let startAltitude = start.altitude;

    const targetTilt = 45;
    const targetRange = 500;
    let startTime: number | null = null;

    function animateStep(time: number) {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / durationPerStep;
      const easedProgress = Math.min(progress, 1);

      const interpolatedAltitude =
        startAltitude + (targetAltitude - startAltitude) * easedProgress;

      // Update map center and heading to face forward along the segment direction
      map.center = {
        lat:
          startCenter.lat +
          (offsetPosition.latitude - startCenter.lat) * easedProgress,
        lng:
          startCenter.lng +
          (offsetPosition.longitude - startCenter.lng) * easedProgress,
        altitude: interpolatedAltitude,
      };
      map.tilt = startTilt + (targetTilt - startTilt) * easedProgress;
      map.heading = startHeading + (heading - startHeading) * easedProgress; // Adjust heading
      map.range = startRange + (targetRange - startRange) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      } else {
        currentPoint++;
        flyToNextSegment();
      }
    }

    requestAnimationFrame(animateStep);
  }

  flyToNextSegment();
}
