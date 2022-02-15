<template>
  <l-map
    :options="{ zoomControl: false, dragging: interactive }"
    style="height: 200px; width: 100% ; margin: 0;"
    :zoom="zoom"
    :center="centerLatLng"
  >
    <l-tile-layer :url="url" />
    <l-marker
      v-if="marker"
      :lat-lng="markerLatLng"
      :icon="markerIcon"
    />
  </l-map>
</template>

<script lang="ts">
import Vue from "vue";
import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default Vue.extend({
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
      markerIcon: L.icon({
        iconUrl: require("../assets/icons/marker.png"),
        shadowUrl: require("../assets/icons/marker-shadow.png"),
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
    },
  }
});
</script>
<!--style scoped>
.leaflet-bottom.leaflet-right {
  display: none;
}
</style-->
