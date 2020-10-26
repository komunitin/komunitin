<template>
  <div>
    <span v-if="caption && right" class="q-pr-md text-overline text-uppercase text-onsurface-m">{{ category.attributes.name }}</span>
    <q-avatar :icon="category.attributes.icon" text-color="onprimary" :color="color" size="40px" >
      <q-tooltip v-if="!caption">{{ category.attributes.name }}</q-tooltip>
    </q-avatar>
    <span v-if="caption && !right" class="q-pl-md text-overline text-uppercase text-onsurface-m">{{ category.attributes.name }}</span>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "CategoryAvatar",
  props: {
    category: {
      type: Object,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    caption: {
      type: Boolean,
      required: false,
      default: false,
    },
    right: {
      type: Boolean,
      required: false,
      default: false,
    }
  }
})
</script>