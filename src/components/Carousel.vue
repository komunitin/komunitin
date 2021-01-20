<template>
  <div>
    <q-carousel
      v-model="slide"
      v-bind="$attrs"
      animated
      swipeable
      infinite
      keep-alive
      :arrows="images.length > 1 && (!thumbnails || $q.screen.lt.md)"
    >
      <q-carousel-slide
        v-for="(image, i) of images"
        :key="i"
        :name="i + 1"
        class="q-pa-none"
        :img-src="image"
      >
      </q-carousel-slide>
    </q-carousel>
    <div
      v-if="thumbnails && (images.length > 1)"
      class="gt-sm q-mt-none row q-col-gutter-sm"
    >
      <div v-for="(image, i) of images" :key="i" class="col-3">
        <img
          :src="image"
          class="thumbnail vertical-bottom cursor-pointer"
          :class="'thumbnail-' + (slide == i + 1 ? 'active' : 'inactive')"
          @click="slide = i + 1"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
/**
 * Almost just a wrapper around Quasar QCarousel to avoid repetition and unify behavior across the app.
 */
export default Vue.extend({
  props: {
    thumbnails: {
      type: Boolean,
      required: false,
      default: false,
    },
    images: {
      type: Array,
      required: true,
    }
  },
  data: () => ({
    slide: 1
  }),
});
</script>
<style lang="scss" scope>
.thumbnail {
  width: 100%
}
.thumbnail-inactive {
  opacity: 0.5;
}
.thumbnail-inactive:hover {
  opacity: 1;
}
</style>