import { Loader } from "@googlemaps/js-api-loader";

export const loader = new Loader({
  apiKey: String(process.env.NEXT_PUBLIC_MAPS_API_KEY),
  version: "alpha",
});
