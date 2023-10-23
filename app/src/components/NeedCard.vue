<template>
  <q-card
    v-if="need"
    v-card-click-to="`/groups/${code}/needs/${need.attributes.code}`"
    flat
    bordered
    :class="[need.attributes.state == 'hidden' ? 'not-published' : '', new Date(need.attributes.expired) < new Date() ? 'expired' : '' ]"
  >
    <!-- Header -->
    <member-header :member="need.member">
      <template #caption>
        {{ $formatDate(need.attributes.updated) }}
      </template>
      <template #side>
        <category-avatar
          :category="need.category"
          type="need"
        />
      </template>
    </member-header>
    <!-- Need images -->
    <carousel
      v-if="hasImages"
      :images="need.attributes.images"
      height="200px"
    />

    <!-- Need text -->
    <q-card-section>
      <div
        v-clamp="hasImages ? 3 : 13"
        class="text-body2 text-justify text-onsurface-m"
      >
        {{ md2txt(need.attributes.content) }}
      </div>
    </q-card-section>

    <q-card-actions>
      <contact-button
        flat
        color="primary"
        :contacts="need.member.contacts"
      >
        {{
          $t("reply")
        }}
      </contact-button>
      <q-space />
      <share-button
        icon="share"
        flat
        round
        color="icon-dark"
        :url="url"
        :title="$t('checkThisNeed', { member: need.member.attributes.name })"
        :text="need.attributes.content"
      />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import cardClickTo from "../plugins/CardClickTo";
import clamp from "../plugins/Clamp";
import md2txt from "../plugins/Md2txt";

import Carousel from "./Carousel.vue";
import CategoryAvatar from "./CategoryAvatar.vue";
import ContactButton from "./ContactButton.vue";
import MemberHeader from "./MemberHeader.vue";
import ShareButton from "./ShareButton.vue";

export default defineComponent({
  name: "NeedCard",
  components: {
    MemberHeader,
    ShareButton,
    ContactButton,
    CategoryAvatar,
    Carousel
  },
  directives: {
    clamp,
    cardClickTo
  },
  props: {
    // Group code.
    code: {
      type: String,
      required: true,
    },
    need: {
      type: Object,
      required: true
    }
  },
  setup() {
    return {
      md2txt
    }
  },
  data: () => ({
    slide: 1
  }),
  computed: {
    hasImages(): boolean {
      return this.need.attributes.images.length > 0;
    },
    url(): string {
      const base = window?.location.origin ?? "";
      return (
        base + this.$router.resolve("needs/" + this.need.attributes.code).href
      );
    }
  }
});
</script>
<style lang="scss" scoped>
  .not-published {
    opacity: 0.5;
  }
  .expired {
    opacity: 0.5;
    background-color: $light-error;
  }
</style>
