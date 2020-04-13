<template>
  <div>
    <q-toolbar class="bg-primary text-onprimary">
      <q-btn
        id="back"
        flat
        round
        icon="arrow_back"
        :aria-label="$t('Back')"
        @click="$router.back()"
      />
      <q-toolbar-title>{{group ? group.attributes.name : ""}}</q-toolbar-title>

      <q-btn
        v-if="group"
        right
        flat
        round
        icon="message"
        @click="contactsView = true"
      />
      <share-button
        v-if="group"
        :text="$t('Check the exchange community {group}', {group: group.attributes.name})"
        :title="group.attributes.name"
      />
    </q-toolbar>

    <!-- Message Dialog -->
    <q-dialog v-if="group" v-model="contactsView">
      <q-card>
        <q-card-section class="q-pb-none">
          <div class="text-h6">{{ $t("Contact") }}</div>
        </q-card-section>
        <q-card-section>
          <social-network-list type="contact" :networks="groupContacts" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-pa-md">
      <!-- Loading spinner -->
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <!-- Group view -->

      <div v-if="group" class="row q-col-gutter-md">
        <!-- image -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-img :src="group.attributes.image" />
        </div>
        <!-- description -->
        <div class="col-12 col-sm-6 col-md-8">
          <div class="text-h6">{{ group.attributes.code }}</div>
          <div class="text-onsurface-m" v-html="group.attributes.description"
          ></div>
          <q-separator spaced />
          <div class="k-inset-actions-md">
            <q-btn
              type="a"
              flat
              no-caps
              :href="group.attributes.website"
              target="_blank"
              icon="link"
              :label="group.attributes.website | link"
              color="onsurface-m"
            />
          </div>
        </div>
        <!-- explore -->
        <div class="col-12 col-sm-6">
          <group-stats
            :title="$t('Offers')"
            icon="local_offer"
            :content="group.relationships.offers.meta.count"
            :href="`groups/${group.relationships.offers.links.related}`"
            :items="[
              '53 Alimentació',
              '44 Serveis professionals',
              '38 Salut i higiene',
              '32 Arts i cultura',
              'i més categories'
            ]"
          />
        </div>

        <div class="col-12 col-sm-6">
          <group-stats
            :title="$t('Needs')"
            icon="loyalty"
            :content="group.relationships.needs.meta.count"
            :href="`groups/${group.relationships.needs.links.related}`"
            :items="[
              '53 Alimentació',
              '44 Serveis professionals',
              '38 Salut i higiene',
              '32 Arts i cultura',
              'i més categories'
            ]"
          />
        </div>

        <div class="col-12 col-sm-6">
          <group-stats
            :title="$t('Members')"
            icon="account_circle"
            :content="group.relationships.members.meta.count"
            :href="`groups/${group.relationships.members.links.related}`"
            :items="[
              '13 Empreses',
              '8 Organitzacions',
              '40 Personals',
              '4 Públics'
            ]"
          />
        </div>

        <div class="col-12 col-sm-6">
          <group-stats
            :title="$t('Currency')"
            icon="monetization_on"
            content="ℏ"
            href=""
            :items="[
              '7.201 transaccions / any',
              '89.500 intercanviats / any',
              '6.500 en circulació',
              '1 ECO = 1 EÇ = 0,1 ℏ = 1 tk'
            ]"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-8">
          <q-card square flat>
            <simple-map class="simple-map" :center="center" :marker="marker" />
            <q-card-section class="group-footer-card text-onsurface-m">
              <q-icon name="place" />
              {{ group.attributes.location.name }}</q-card-section
            >
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <social-network-list type="contact" :networks="groupContacts" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import api from "../../services/SocialApi";
import SimpleMap from "../../components/SimpleMap.vue";
import { Group, Contact } from "./models/model";
import GroupStats from "../../components/GroupStats.vue";
import ShareButton from "../../components/ShareButton.vue";
import SocialNetworkList from "../../components/SocialNetworkList.vue";

interface ContactNames {
  [key: string]: {
    name: string;
  };
}
/**
 * Page for Group details.
 */
export default Vue.extend({
  name: "Group",
  filters: {
    link(link: string): string {
      return link.replace(/(https|http):\/\//, "");
    }
  },
  components: {
    SimpleMap,
    ShareButton,
    GroupStats,
    SocialNetworkList
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      group: null as Group | null,
      contacts: [] as Contact[],
      isLoading: true,
      contactsView: false,
      socialButtonsView: false
    };
  },
  computed: {
    center(): [number, number] | undefined {
      return this.group?.attributes.location.coordinates;
    },
    marker(): [number, number] | undefined {
      return this.group?.attributes.location.coordinates;
    },
    url(): string {
      return window.location.href;
    },
    title(): string {
      return document.title;
    },
    groupContacts(): ContactNames {
      return this.contacts?.reduce(
        (contacts: ContactNames, contact: Contact) => {
          contacts[contact.attributes.type] = {
            name: contact.attributes.name
          };
          return contacts;
        },
        {}
      );
    }
  },
  mounted: function(): void {
    this.fetchGroup(this.code);
  },
  methods: {
    async fetchGroup(code: string) {
      try {
        this.isLoading = true;
        this.group = null;
        this.contacts = [];
        const response = await api.getGroupWithContacts(code);
        this.group = response.group;
        this.contacts = response.contacts;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
</script>
