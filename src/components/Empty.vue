<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-md-4 q-pa-lg xs-last">
      <img
        class="full-width empty-img"
        src="~assets/acorn-512.png"
      >
    </div>
    <div class="col-12 col-sm-6 col-md-8 q-pa-lg self-center">
      <div class="text-h4 text-onsurface-m">
        {{ text }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  props: {
    text: {
      type: String,
      default: function() {
        // We need to use a function to access the object method $t.
        return this.$t('nothingHere')
      },
      required: false,
    }
  }
})
</script>
<style lang="scss" scoped>
  .empty-img {
    opacity: 75%;
  }
  @media (max-width: $breakpoint-xs-max) {
    .xs-last {
      order: 2;
    }
  }

</style>