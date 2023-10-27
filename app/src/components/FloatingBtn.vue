<template>
  <q-page-sticky
    position="bottom"
    :offset="[0, 24]"
  >
    <q-btn 
      v-bind="$attrs" 
      fab
    />
  </q-page-sticky>
</template>
<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "FloatingBtn",
  inheritAttrs: false,
})

</script>