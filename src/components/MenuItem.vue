<template>
  <q-item clickable>
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-label>{{ title }}</q-item-label>
  </q-item>
</template>

<script lang="ts">
import Vue from "vue";
/**
 * List item in the left drawer menu.
 */
export default Vue.extend({
  name: "menu-item",
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  }
});
</script>
