<template>
  <q-card v-if="group">
    <!-- Header with group avatar, name and short code -->
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="group.attributes.image" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ group.attributes.name }}</q-item-label>
        <q-item-label caption>{{ group.attributes.code }}</q-item-label>
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
        :center="group.attributes.location.coordinates"
        :marker="group.attributes.location.coordinates"
      />
    </q-card-section>
    <!-- Group description -->
    <q-card-section>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-clamp="5" v-html="compiledMarkdown(group.attributes.description)"></div>
    </q-card-section>
    <!-- group actions -->
    <q-card-actions>
      <q-btn :to="`groups/${group.attributes.code}`" flat color="primary">{{$t("Explore")}}</q-btn>
      <q-btn flat color="primary">{{ $t("Sign Up") }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";

import ShareButton from "./ShareButton.vue";
import SimpleMap from "./SimpleMap.vue";
import Clamp from "../plugins/Clamp";
import markdownToTxt from "markdown-to-txt";

Vue.use(Clamp);

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
  },
  methods: {
    // @todo In order for clamp to work well it is necessary
    //       to pass plain text.
    compiledMarkdown: function(text: string) {
      return markdownToTxt(text);
    }
  }
});
</script>
