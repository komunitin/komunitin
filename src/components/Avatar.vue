<template>
  <div>
    <q-avatar
      v-if="imgSrc"
      :size="size"
    >
      <img :src="imgSrc">
    </q-avatar>
    <q-avatar
      v-else
      text-color="white"
      :size="size"
      :style="`background-color: ${bgColor};`"
    >
      {{ initial }}
    </q-avatar>
  </div>
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