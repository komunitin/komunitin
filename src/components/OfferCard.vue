<template>
  <q-card v-if="offer">
    <!-- Header with offer avatar, name and short code -->
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="offer.attributes.images[0].href" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ offer.attributes.name }}</q-item-label>
      </q-item-section>
      <share-button
        class="text-icon-dark"
        :text="$t('Check the exchange community {offer}', {offer: offer.attributes.name})"
        :title="offer.attributes.name"
        :url="url"
      />
    </q-item>
    <!-- Offer description -->
    <q-card-section>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-clamp="5" v-html="compiledMarkdown(offer.attributes.content)"></div>
    </q-card-section>
    <!-- offer actions -->
    <q-card-actions>
      <q-btn :to="`offers/${offer.id}`" flat color="primary">{{$t("Explore")}}</q-btn>
      <q-btn flat color="primary">{{ $t("Sign Up") }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import Vue from "vue";
import marked from "marked";

import ShareButton from "./ShareButton.vue";
import Clamp from "../plugins/Clamp";

Vue.use(Clamp);

export default Vue.extend({
  name: "OfferCard",
  components: {
    ShareButton
  },
  props: {
    offer: {
      type: Object,
      required: true,
      default: undefined
    }
  },
  computed: {
    url() {
      const base = window?.location.origin ?? "";
      return (
        base + this.$router.resolve("offers/" + this.offer.attributes.code).href
      );
    }
  },
  methods: {
    /**
     * @todo Se me ocurre que podríamos hacer una directiva de Vue que sea markdown
     * (si no es que alguien la ha hecho ya), y ponemos
     * <div v-markdown>{{ data.markdowntext }}</div> para que lo renderice.
     * Así nos ahorramos el v-html también. O si esto no es práctico, pues
     * <div :v-markdown="data.markdowntext"></div>. O incluso un componente
     * <markdown>{{data.markdown}}</markdown>. Algo así.
     */
    compiledMarkdown: function(text: string) {
      return marked(text, { sanitize: true, gfm: true, breaks: true });
    }
  }
});
</script>
