<template>
  <q-item v-bind="$attrs" :clickable="to && !active" :active="active" @click="click">
    <!-- Member avatar & name -->
    <q-item-section avatar>
      <avatar :img-src="member.attributes.image" :text="member.attributes.name" />
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
import Avatar from "./Avatar.vue";

export default Vue.extend({
  name: "MemberHeader",
  components: {
    Avatar
  },
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
