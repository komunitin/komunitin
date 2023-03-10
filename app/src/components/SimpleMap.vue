<template>
  <l-map
    :options="{ zoomControl: false, dragging: interactive }"
    style="height: 200px; width: 100% ; margin: 0; z-index:0;"
    :zoom="zoom"
    :center="centerLatLng"
    :use-global-leaflet="false"
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
import { defineComponent } from "vue";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

interface SimpleMapData {
  url: string,
  zoom: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markerIcon?: any
}

export default defineComponent({
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
  data() : SimpleMapData {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 3,
    };
  },
  computed: {
    // Leaflet expects [latitude, longitude] while GeoJSON
    // is the opposite.
    centerLatLng() {
      return this.center?.slice().reverse();
    },
    markerLatLng() {
      return this.marker?.slice().reverse();
    },
  },
  async beforeMount() {
    // See here on why we're not just importing leaflet at the beggining of the file:
    // https://github.com/vue-leaflet/vue-leaflet#working-with-leaflet
    const { icon } = await import("leaflet/dist/leaflet-src.esm")
    this.markerIcon = icon({
      iconUrl: require("../assets/icons/marker.png"),
      shadowUrl: require("../assets/icons/marker-shadow.png"),
    })
  }
});
</script>
<!--style scoped>
.leaflet-bottom.leaflet-right {
  display: none;
}
</style-->
