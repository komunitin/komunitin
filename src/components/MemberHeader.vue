<template>
  <q-item>
    <!-- Member avatar & name -->
    <q-item-section avatar>
      <q-avatar>
        <img :src="member.attributes.image" />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1" class="text-subtitle2 text-onsurface-m">
        {{ member.attributes.name }}
      </q-item-label>
      <!-- Offer updated date -->
      <q-item-label caption>
        <!-- FIXME: This is a temporal placeholder. Substitute it by the real number -->
        <!-- eslint-disable-next-line vue-i18n/no-raw-text -->
        <slot name="caption">ABCD0123</slot>
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
export default Vue.extend({
  name: "MemberHeader",
  props: {
    member: {
      type: Object,
      required: true,
    }
  }
});
</script>
