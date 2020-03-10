<template>
  <l-map
    :options="{zoomControl: false}"
    style="height: 200px; width: 100% ; margin: 0;"
    :zoom="zoom"
    :center="center"
  >
    <l-tile-layer :url="url"></l-tile-layer>
    <l-marker v-if="markerLatLng" :lat-lng="markerLatLng" :icon="greenIcon"></l-marker>
  </l-map>
</template>

<script>
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
// @ts-ignore
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

var LeafIcon = L.Icon.extend({
  options: {
    iconSize: [50, 50],
    iconAnchor: [25, 40],
    shadowAnchor: [4, 62],
    shadowSize: [50, 64],
    popupAnchor: [-3, -76]
  }
});

export default {
  name: 'simple-map',
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  props: ['center', 'markerLatLng'],
  data() {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 3,
      greenIcon: new LeafIcon({
        // eslint-disable-next-line no-undef
        iconUrl: require('../assets/icons/marker.png'),
        shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png'
      })
    };
  }
};
</script>
<style scoped>
.leaflet-bottom.leaflet-right {
  display: none;
}
</style>
