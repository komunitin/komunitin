import { icon } from "leaflet/dist/leaflet-src.esm"

export const useLeafletSettings = () => {
  return {
    markerIcon: icon({
      iconUrl: require("../assets/icons/marker.png"),
      shadowUrl: require("../assets/icons/marker-shadow.png"),
      iconSize: [25, 41],
      iconAnchor: [13, 41]
    }),
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    zoom: 12,
  }
}