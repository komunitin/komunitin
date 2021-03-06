<template>
<div>
  <q-page-sticky position="top" expand class="z-fab">
    <div :style="`height: ${computedHeight}px;`" class="overflow-hidden relative-position full-width">
      <div class="absolute-bottom">
        <slot/>
      </div>
    </div>
    <q-scroll-observer ref="scrollObserver" @scroll.passive="scrollHandler" />
    <slot name="fixed"/>
  </q-page-sticky>
  <!-- Pull down the main content -->
  <div :style="`height: ${collapsibleHeight + fixedHeight}px;`"/>
</div>
</template>
<script lang="ts">
import Vue from "vue"

export interface ScrollDetails {
  position: number;
  direction: "up" | "down";
  directionChanged: boolean;
  inflexionPosition: number;
}

/**
 * This element provides a second header in a page, with two sections.
 *  - The `collapsible` section will shrink and disappear on scroll.
 *  - The `fixed`section will remain on top of the page, after the actual header.
 * 
 * This element must be placed as the first child of the QPage element.
 */
export default Vue.extend({
  name: "CollapsibleHeader",
  props: {
    /**
     * The height, in pixels, of the collapsible section.
     */
    collapsibleHeight: {
      type: Number,
      required: true,
    },
    /**
     * The height, in pixels, of the fixed section.
     */
    fixedHeight: {
      type: Number,
      required: true,
    }
  },
  data: () => ({
    offset: 0,
  }),
  computed: {
    computedHeight(): number {
      return this.collapsibleHeight - this.offset;
    },
  },
  methods: {
    scrollHandler(details: ScrollDetails) {
      const newOffset = Math.min(details.position, this.collapsibleHeight);
      if (newOffset != this.offset) {
        this.offset = newOffset;
      }
    }
  }
})
</script>