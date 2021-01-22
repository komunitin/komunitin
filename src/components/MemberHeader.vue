<template>
  <q-item v-bind="$attrs" :clickable="to && !active" :active="active" @click="click">
    <!-- Member avatar & name -->
    <q-item-section avatar>
      <q-avatar v-if="member.attributes.image">
        <img :src="member.attributes.image" />
      </q-avatar>
      <q-avatar v-else text-color="white" :style="`background-color: ${memberColor};`">
        {{ initial }}
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1" class="text-subtitle2 text-onsurface-m">
        {{ member.attributes.name }}
      </q-item-label>
      <!-- Offer updated date -->
      <q-item-label caption>
        <slot name="caption">{{ account }}</slot>
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <!-- No content by default on the side slot -->
      <slot name="side"></slot>
    </q-item-section>
  </q-item>
</template>
<script lang="ts">
import Vue from "vue";
import {colors} from "quasar";
export default Vue.extend({
  name: "MemberHeader",
  props: {
    member: {
      type: Object,
      required: true,
    },
    to: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    active(): boolean {
      return this.to == this.$route.path;
    },
    account(): string {
      return (this.member.account) ? this.member.account.attributes.code : "";
    },
    initial(): string {
      return this.member.attributes.name.substring(0,1).toUpperCase();
    },
    memberColor(): string {
      const seed = Math.abs(this.member.attributes.name.split("").reduce(
        (hash: number, b: string) => (((hash << 5) - hash) + b.charCodeAt(0)), 0)); 
      const rgb = colors.hsvToRgb({h: seed % 360, s: 80, v:80});
      return colors.rgbToHex(rgb);
    }
  },
  methods: {
    click() {
      if (this.to) {
        this.$router.push(this.to);
      }
      this.$emit("click");
    }
  }
});
</script>
