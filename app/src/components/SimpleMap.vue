<template>
  <l-map
    :options="{ zoomControl: false, dragging: interactive, attributionControl: false, scrollWheelZoom: interactive }"
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

<script setup lang="ts">
import { computed } from "vue";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import type { PointExpression, LatLngExpression} from "leaflet";
import { useLeafletSettings } from "../composables/leaflet";
import "leaflet/dist/leaflet.css";

const props = withDefaults(defineProps<{
  center: [number, number],
  marker?: [number, number],
  interactive?: boolean
}>(), {
  interactive: true,
  marker: undefined
})

const { url, zoom, markerIcon } = useLeafletSettings()
const centerLatLng = computed(() => props.center?.slice().reverse() as PointExpression)
const markerLatLng = computed(() => props.marker?.slice().reverse() as LatLngExpression)

</script>
