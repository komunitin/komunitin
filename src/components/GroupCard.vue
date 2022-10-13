<template>
  <q-card
    v-if="group"
    v-card-click-to="`/groups/${group.attributes.code}`"
    flat
    bordered
  >
    <!-- Header with group avatar, name and short code -->
    <q-item>
      <q-item-section avatar>
        <avatar
          :img-src="group.attributes.image"
          :text="group.attributes.code"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ group.attributes.name }}
        </q-item-label>
        <q-item-label>
          {{ group.attributes.code }}
        </q-item-label>
      </q-item-section>
      <share-button
        icon="share"
        flat
        round
        color="icon-dark"
        :text="
          $t('checkTheExchangeCommunityGroup', { group: group.attributes.name })
        "
        :title="group.attributes.name"
        :url="url"
      />
    </q-item>
    <!-- Group position map -->
    <q-card-section class="simple-map">
      <simple-map
        :interactive="false"
        :center="group.attributes.location.coordinates"
        :marker="group.attributes.location.coordinates"
      />
    </q-card-section>
    <!-- Group description -->
    <q-card-section>
      <div
        v-clamp="5"
        v-md2txt="group.attributes.description"
      />
    </q-card-section>
    <!-- group actions -->
    <q-card-actions>
      <q-btn
        :to="`groups/${group.attributes.code}`"
        flat
        color="primary"
      >
        {{
          $t("explore")
        }}
      </q-btn>
      <q-btn
        flat
        color="primary"
      >
        {{ $t("signUp") }}
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import cardClickTo from "../plugins/CardClickTo";
import clamp from "../plugins/Clamp";
import md2txt from "../plugins/Md2txt";


import Avatar from "./Avatar.vue";
import ShareButton from "./ShareButton.vue";
import SimpleMap from "./SimpleMap.vue";

export default defineComponent({
  name: "GroupCard",
  components: {
    ShareButton,
    SimpleMap,
    Avatar
  },
  directives: {
    md2txt,
    clamp,
    cardClickTo
  },
  props: {
    group: {
      type: Object,
      required: true,
    }
  },
  computed: {
    url() {
      const base = window?.location.origin ?? "";
      return (
        base + this.$router.resolve("groups/" + this.group.attributes.code).href
      );
    }
  }
});
</script>
