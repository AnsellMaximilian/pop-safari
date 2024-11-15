import {
  NEARBY_MARKER,
  POLYGON,
  POLYGON_POINT,
  polygonOptions,
  SEARCH_PLACE_MARKER,
  TOUR_MARKER,
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
  MarkerUtils,
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

  const marker = await MarkerUtils.createImageMarker(
    location.lat(),
    location.lng(),
    "/search-marker.svg",
    SEARCH_PLACE_MARKER,
    true
  );

  map3DElement.append(marker);

  setTimeout(() => {
    removeElementsWithClass(SEARCH_PLACE_MARKER);
  }, 5000);

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
  radius: number = 500,
  onMarkerClick?: (place: google.maps.places.Place) => void | Promise<void>
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
    fields: ["id", "displayName", "location", "businessStatus"],
    locationRestriction: {
      center: center,
      radius: radius,
    },
    // optional parameters
    maxResultCount: 5,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: "en-US",
    region: "us",
  };

  //@ts-ignore
  const { places } = await Place.searchNearby(request);
  removeElementsWithClass(SEARCH_PLACE_MARKER);

  if (places.length && map) {
    const { LatLngBounds } = (await google.maps.importLibrary(
      "core"
    )) as google.maps.CoreLibrary;

    // Loop through and get all the results.
    places.forEach(async (place) => {
      if (place.location?.lat() && place.location?.lng()) {
        const marker = await MarkerUtils.createImageMarker(
          place.location?.lat(),
          place.location?.lng(),
          "/search-marker.svg",
          SEARCH_PLACE_MARKER,
          true,
          (e) => {
            e.stopPropagation();
            if (onMarkerClick) onMarkerClick(place);
          }
        );
        map.append(marker);
      }
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
  console.log("I'm getting elevation");
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
  removeElementsWithClass(TOUR_MARKER);
  const pointsWithAltitudes = await getAltitudesForPoints(steps);

  const initialCenter = {
    latitude: pointsWithAltitudes[0].latitude,
    longitude: pointsWithAltitudes[0].longitude,
    altitude: pointsWithAltitudes[0].altitude,
  };
  const groundCircle = createGroundCircle(map, initialCenter, 10);

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
          (targetCenter.altitude - startCenter.altitude) * easedProgress,
      };
      map.tilt = startTilt + (targetTilt - startTilt) * easedProgress;
      map.heading =
        startHeading + (targetHeading - startHeading) * easedProgress;
      map.range = startRange + (targetRange - startRange) * easedProgress;

      updateGroundCircle(
        groundCircle,
        {
          latitude: map.center.lat,
          longitude: map.center.lng,
        },
        10
      );

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

export async function getAltitudesForPointsWithSampling(
  points: LatLng[],
  sampleInterval: number = 50,
  offset: number = 50
): Promise<LatLngAlt[]> {
  const altitudes: LatLngAlt[] = [];

  for (let i = 0; i < points.length; i += sampleInterval) {
    const point = points[i];

    const elevation = await getElevation({
      latitude: point.latitude,
      longitude: point.longitude,
    });

    const altitudeWithOffset = elevation + offset;

    for (let j = i; j < Math.min(i + sampleInterval, points.length); j++) {
      altitudes.push({
        ...points[j],
        altitude: altitudeWithOffset,
      });
    }
  }

  return altitudes;
}

export function createGroundCircle(
  map: google.maps.maps3d.Map3DElement,
  center: LatLng,
  radiusMeters: number,
  numPoints: number = 30
): google.maps.maps3d.Polygon3DElement {
  const { latitude, longitude } = center;

  const coordinates = Array.from({ length: numPoints }, (_, i) => {
    const angle = (i * 360) / numPoints;
    const radian = (angle * Math.PI) / 180;

    return {
      lat: latitude + (radiusMeters / 111320) * Math.cos(radian),
      lng:
        longitude +
        (radiusMeters / (111320 * Math.cos(latitude * (Math.PI / 180)))) *
          Math.sin(radian),
    };
  });

  const polygon = new google.maps.maps3d.Polygon3DElement({
    outerCoordinates: coordinates,
    altitudeMode: google.maps.maps3d.AltitudeMode.CLAMP_TO_GROUND,
    fillColor: "#F97316",
    // fillOpacity: 0.3,
    strokeColor: "#FFFFFF",
    strokeWidth: 2,
  });

  polygon.classList.add(TOUR_MARKER);

  map.append(polygon);
  return polygon;
}

export function updateGroundCircle(
  polygon: google.maps.maps3d.Polygon3DElement,
  center: LatLng,
  radiusMeters: number,
  numPoints: number = 30
) {
  const { latitude, longitude } = center;

  const newCoordinates = Array.from({ length: numPoints }, (_, i) => {
    const angle = (i * 360) / numPoints;
    const radian = (angle * Math.PI) / 180;

    return {
      lat: latitude + (radiusMeters / 111320) * Math.cos(radian),
      lng:
        longitude +
        (radiusMeters / (111320 * Math.cos(latitude * (Math.PI / 180)))) *
          Math.sin(radian),
    };
  });

  polygon.outerCoordinates = newCoordinates;
}

export async function createPulseEffect(
  map: google.maps.maps3d.Map3DElement,
  clickPosition: LatLng,
  pulseCount: number = 3,
  maxRadius: number = 100,
  delayBetweenPulses: number = 300,
  pulseDuration: number = 3000 // Slower pulse duration in milliseconds
) {
  // @ts-ignore
  const { Polyline3DElement } = await google.maps.importLibrary("maps3d");

  const createPulseCircle = (delay: number) => {
    const numPoints = 30;
    const circleElement = new Polyline3DElement({
      coordinates: Array.from({ length: numPoints }, (_, i) => {
        const angle = (i * 360) / numPoints;
        const radian = (angle * Math.PI) / 180;
        return {
          lat: clickPosition.latitude + (5 / 111320) * Math.cos(radian),
          lng:
            clickPosition.longitude +
            (5 /
              (111320 * Math.cos(clickPosition.latitude * (Math.PI / 180)))) *
              Math.sin(radian),
        };
      }),
      altitudeMode: google.maps.maps3d.AltitudeMode.CLAMP_TO_GROUND,
      strokeColor: "#F97316",
      strokeWidth: 3,
    });

    map.append(circleElement);

    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / pulseDuration;
      const easedProgress = Math.min(progress, 1);

      const currentRadius = easedProgress * maxRadius;
      circleElement.coordinates = Array.from({ length: numPoints }, (_, i) => {
        const angle = (i * 360) / numPoints;
        const radian = (angle * Math.PI) / 180;
        return {
          lat:
            clickPosition.latitude +
            (currentRadius / 111320) * Math.cos(radian),
          lng:
            clickPosition.longitude +
            (currentRadius /
              (111320 * Math.cos(clickPosition.latitude * (Math.PI / 180)))) *
              Math.sin(radian),
        };
      });

      circleElement.strokeColor = `rgba(249, 115, 22, ${1 - easedProgress})`;

      if (easedProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        map.removeChild(circleElement);
      }
    };

    setTimeout(() => requestAnimationFrame(animate), delay);
  };

  for (let i = 0; i < pulseCount; i++) {
    createPulseCircle(i * delayBetweenPulses);
  }
}
