<template>
  <q-item
    :clickable="!active"
    active-class="bg-active"
    :active="active"
    :disable="disable"
    @click="click"
  >
    <q-item-section avatar>
      <q-icon
        :name="icon"
        :color="active ? 'primary' : 'icon-dark'"
      />
    </q-item-section>
    <q-item-section
      class="text-subtitle2"
      :class="active ? 'text-primary' : 'text-onsurface-m'"
    >
      {{ title }}
    </q-item-section>
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
    },
    href: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    active(): boolean {
      return this.to == this.$route.path
    },
    disable(): boolean {
      return !this.to && !this.href && !this.$listeners.click;
    }
  },
  methods: {
    click() {
      if (this.to) {
        this.$router.push(this.to);
      } else if (this.href) {
        window.open(this.href, "_blank");
      }
      this.$emit("click");
    }
  }
});
</script>