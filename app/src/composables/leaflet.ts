import { icon } from "leaflet/dist/leaflet-src.esm"

export const useLeafletSettings = () => {
  return {
    markerIcon: icon({
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      iconUrl: require("../assets/icons/marker.png"),
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      shadowUrl: require("../assets/icons/marker-shadow.png"),
      iconSize: [25, 41],
      iconAnchor: [13, 41]
    }),
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    zoom: 12,
  }
}