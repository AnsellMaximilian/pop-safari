import { SEARCH_PLACE_MARKER } from "@/const/maps";
import { removeElementsWithClass } from "@/utils/maps";
import { Loader } from "@googlemaps/js-api-loader";

export const loader = new Loader({
  apiKey: String(process.env.NEXT_PUBLIC_MAPS_API_KEY),
  version: "alpha",
});

export async function initAutocomplete(
  map3DElement: google.maps.maps3d.Map3DElement
) {
  // @ts-ignore
  const { Autocomplete } = await google.maps.importLibrary("places");
  const autocomplete = new Autocomplete(document.getElementById("pac-input"), {
    fields: ["geometry", "name", "place_id"],
  });
  autocomplete.addListener("place_changed", () => {
    //viewer.entities.removeAll();
    const place: google.maps.places.PlaceResult = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.viewport) {
      window.alert("No viewport for input: " + place.name);
      return;
    }
    // zoomToViewport(place.geometry, map3DElement, place);
    zoomToLocation(place.geometry.location!, map3DElement, place);
  });
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
  console.log(locationPolyline);
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
