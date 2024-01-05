<template>
  <q-avatar
    :size="size"
    text-color="white"
    :style="`background-color: ${bgColor};`"
  >
    <img 
      v-if="imgSrc" 
      :src="imgSrc"
      style="object-fit: cover;"
    >
    <template v-else>
      {{ initial }}
    </template>
  </q-avatar>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import {colors} from "quasar";

export default defineComponent({
  props: {
    imgSrc: {
      type: String,
      required: false,
      default: null
    },
    text: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: false,
      default: "40px"
    }
  },
  computed: {
    initial(): string {
      return this.text.substring(0,1).toUpperCase();
    },
    bgColor(): string {
      const seed = Math.abs(this.text.split("").reduce(
        (hash: number, b: string) => (((hash << 5) - hash) + b.charCodeAt(0)*997), 0)); 
      const rgb = colors.hsvToRgb({h: seed % 360, s: 80, v:80});
      return colors.rgbToHex(rgb);
    }
  }
});
</script>