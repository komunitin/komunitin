<template>
  <q-card v-if="group" v-card-click-to="`/groups/${group.attributes.code}`">
    <!-- Header with group avatar, name and short code -->
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="group.attributes.image" />
        </q-avatar>
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
        class="text-icon-dark"
        :text="$t('Check the exchange community {group}', {group: group.attributes.name})"
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
      <div v-clamp="5" v-md2txt="group.attributes.description"></div>
    </q-card-section>
    <!-- group actions -->
    <q-card-actions>
      <q-btn :to="`groups/${group.attributes.code}`" flat color="primary">{{$t("explore")}}</q-btn>
      <q-btn flat color="primary">{{ $t("signUp") }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";

import ShareButton from "./ShareButton.vue";
import SimpleMap from "./SimpleMap.vue";
import Clamp from "../plugins/Clamp";
import Md2txt from "../plugins/Md2txt";
import CardClickTo from "../plugins/CardClickTo";

Vue.use(Clamp);
Vue.use(Md2txt);
Vue.use(CardClickTo);

export default Vue.extend({
  name: "GroupCard",
  components: {
    ShareButton,
    SimpleMap
  },
  props: {
    group: {
      type: Object,
      required: true,
      default: undefined
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
