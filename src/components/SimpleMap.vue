<template>
  <l-map
    :options="{ zoomControl: false, dragging: interactive }"
    style="height: 200px; width: 100% ; margin: 0;"
    :zoom="zoom"
    :center="centerLatLng"
  >
    <l-tile-layer :url="url"></l-tile-layer>
    <l-marker
      v-if="marker"
      :lat-lng="markerLatLng"
      :icon="greenIcon"
    ></l-marker>
  </l-map>
</template>

<script>
import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LeafIcon = L.Icon.extend({
  options: {
    iconSize: [50, 50],
    iconAnchor: [25, 40],
    shadowAnchor: [4, 62],
    shadowSize: [50, 64],
    popupAnchor: [-3, -76]
  }
});

export default {
  name: "SimpleMap",
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  props: {
    /**
     * Array of [longitude, latitude]
     */
    center: {
      type: Array,
      default: undefined,
      required: true
    },
    /**
     * Array of [longitude, latitude]
     */
    marker: {
      type: Array,
      default: undefined,
      required: false
    },
    interactive: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 3,
      greenIcon: new LeafIcon({
        // eslint-disable-next-line no-undef
        iconUrl: require("../assets/icons/marker.png"),
        shadowUrl: "http://leafletjs.com/examples/custom-icons/leaf-shadow.png"
      })
    };
  },
  computed: {
    // Leaflet expects [latitude, longitude] while GeoJSON
    // is the opposite.
    centerLatLng() {
      return this.center.slice().reverse();
    },
    markerLatLng() {
      return this.marker.slice().reverse();
    }
  }
};
</script>
<style scoped>
.leaflet-bottom.leaflet-right {
  display: none;
}
</style>
