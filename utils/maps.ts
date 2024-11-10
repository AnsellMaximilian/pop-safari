export function removeElementsWithClass(className: string) {
  const elements = document.getElementsByClassName(`${className}`);

  Array.from(elements).forEach((e) => e.remove());
}

export function removeElementsWithSelector(selector: string) {
  const elements = document.querySelectorAll(`${selector}`);

  elements.forEach((e) => e.remove());
}

export class MarkerUtils {
  static async createSvgMarker(lat: number, lng: number, svgContent: string) {
    // @ts-ignore
    const { Marker3DElement } = (await google.maps.importLibrary(
      "maps3d"
    )) as google.maps.Maps3DLibrary;
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(
      svgContent,
      "image/svg+xml"
    ).documentElement;
    //
    const marker = new Marker3DElement({
      position: { lat, lng },
    });

    const template = document.createElement("template");
    template.content.append(svgElement);
    marker.append(template);

    return marker;
  }

  static async createImageMarker(
    lat: number,
    lng: number,
    imageUrl: string,
    className: string,
    extruded: boolean = false
  ) {
    // @ts-ignore
    const { Marker3DElement, AltitudeMode } = (await google.maps.importLibrary(
      "maps3d"
    )) as google.maps.Maps3DLibrary;
    const img = document.createElement("img");

    img.src = imageUrl;

    const extraOptions = extruded
      ? {
          position: { lat, lng, altitude: 100 },
          extruded: true,
          altitudeMode: AltitudeMode.RELATIVE_TO_GROUND,
        }
      : {};

    const marker = new Marker3DElement({
      position: { lat, lng },
      collisionBehavior: google.maps.CollisionBehavior.REQUIRED,
      ...extraOptions,
    });

    const template = document.createElement("template");
    template.content.append(img);

    marker.classList.add(className);

    marker.append(template);

    return marker;
  }

  static async createGlyphMarker(
    lat: number,
    lng: number,
    glyphUrl: string,
    backgroundColor = "white"
  ) {
    // @ts-ignore
    const { Marker3DElement } = await google.maps.importLibrary("maps3d");
    // @ts-ignore
    const { PinElement } = await google.maps.importLibrary("marker");

    const glyphPin = new PinElement({
      background: backgroundColor,
      glyph: new URL(glyphUrl),
    });

    const marker = new Marker3DElement({
      position: { lat, lng },
    });
    marker.append(glyphPin);

    return marker;
  }

  static async createPlaceIconMarker(placeId: string): Promise<any> {
    // @ts-ignore
    const { Marker3DElement } = await google.maps.importLibrary("maps3d");
    // @ts-ignore
    const { PinElement } = await google.maps.importLibrary("marker");

    const place = new google.maps.places.Place({
      id: placeId,
    });

    await place.fetchFields({
      fields: ["location", "svgIconMaskURI", "iconBackgroundColor"],
    });

    if (!place.location || !place.svgIconMaskURI || !place.iconBackgroundColor)
      return null;

    const pinElement = new PinElement({
      background: place.iconBackgroundColor,
      glyph: new URL(String(place.svgIconMaskURI)),
    });

    const marker = new Marker3DElement({
      position: place.location,
    });
    marker.append(pinElement);

    return marker;
  }
}
