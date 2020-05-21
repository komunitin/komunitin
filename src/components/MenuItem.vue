<template>
  <q-item clickable active-class="bg-active" :active="active" :disable="!to" v-on="$listeners" @click="$router.push(to)">
    <q-item-section avatar>
      <q-icon :name="icon" color="icon-dark"/>
    </q-item-section>
    <q-item-section class="text-subtitle2 text-onsurface-m">{{ title }}</q-item-section>
  </q-item>
</template>

<script lang="ts">
import Vue from "vue";
/**
 * List item in the left drawer menu.
 */
export default Vue.extend({
  name: "MenuItem",
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    active(): boolean {
      return this.to == this.$router.currentRoute.path
    }
  }
});
</script>