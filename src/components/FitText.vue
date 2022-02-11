<template>
  <span class="fittext">
    <slot />
  </span>
</template>

<script lang="ts">
import Vue from "vue";

/**
 * The <fit-text> component is a <span> that adjusts its fontSize 
 * so that it fits the parent element width.
 * @displayName Fit Text
 */
export default Vue.extend({
  name: 'FitText',
  props: {
    update: {
      type: Boolean,
      default: false,
    }
  },
  mounted: function() {
    // Call the fit function after the children has been rendered too.
    this.$nextTick(this.fit);

    // Call it also after fonts have been loaded. We don't check this 
    // condition before calling since this way the first call already 
    // does some adjustment and therefore the text does not do a big 
    // jump once fonts are loaded.

    // Experimental API `fonts` is not (yet) included in Document interface.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).fonts?.ready.then(this.fit);
    // Update on resize.
    if ((this.update) && (typeof ResizeObserver !== 'undefined')) {
      const observer = new ResizeObserver(this.fit);
      observer.observe(this.$el.parentElement as HTMLElement);
    }
  },
  updated: function() {
    // Call the fit function after the children has been rendered too.
    this.$nextTick(this.fit);
  },
  methods: {
    /**   
     * Sets the font-size style property of this element so that it fits 
     * the parent container height.
     */
    fit() {
      // Initializations get (and cast) this element and its parent.
      const element = this.$el as HTMLElement;
      const parent = element.parentElement;
      // Check that the element is in the dom.
      if (parent != null) {
        const parentWidth = parent.clientWidth;
        let ratio = parentWidth / element.clientWidth;
        // We loop until 0.1% accuracy or 5 iterations.
        let counter = 0;
        while (Math.abs(ratio - 1) > 0.001 && counter < 5) {
          // Multiply the current fontSize by the relation of widths
          // between this element and the parent one.
          const fontSize = getComputedStyle(element).fontSize;
          const currentSize = parseFloat(fontSize.slice(0, -2));
          const unit = fontSize.slice(-2);
          element.style.fontSize = currentSize * ratio + unit;
          // Prepare next iteration.
          ratio = parentWidth / element.clientWidth;
          counter++;
        }
      }
    }
  }
});

</script>
<style lang="scss" scoped>
  span.fittext {
    // Make the span have clientWidth.
    display: inline-block;
    // Forbid word wrapping.
    white-space: nowrap;
  }
</style>