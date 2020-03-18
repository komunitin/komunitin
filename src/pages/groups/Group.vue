<template>
  <div>
        <q-toolbar class="bg-primary text-onprimary">
          <q-btn flat round icon="arrow_back" aria-label="Home" @click="$router.back()" />
          <q-toolbar-title>{{ group.data ? group.data.attributes.name : ''}}</q-toolbar-title>

          <q-btn v-if="group.data" right flat round icon="message" @click="contactsView = true" />
          <navigator-share
            :on-error="onError"
            :on-success="onSuccess"
            :url="url"
            :title="title"
            text="Komunitin group"
          >
            <q-btn slot="clickable" right flat round icon="share" />
          </navigator-share>
        </q-toolbar>

        <!-- Modal Dialogs -->
        
        <q-dialog v-model="contactsView">
          <q-card>
            <q-card-section>
              <div class="text-h6">{{$t('Contact')}}</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <contact-list :ways-contact="group.included" />
            </q-card-section>
          </q-card>
        </q-dialog>

        <q-dialog v-model="socialButtonsView">
          <social-buttons :url="url" :title="title" />
        </q-dialog>

        <div class="q-pa-md">
          <!-- Loading spinner -->
          <q-inner-loading :showing="isLoading" color="icon-dark" />
          <!-- Group view -->

          <div v-if="group.data" class="row q-col-gutter-md">
            <!-- image -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-img :src="group.data.attributes.image"/>
            </div>
            <!-- description -->
            <div class="col-12 col-sm-6 col-md-8">
              <div class="text-h6">{{ group.data.attributes.code }}</div>
              <div class="text-onsurface-m" v-html="group.data.attributes.description"></div>
              <q-separator spaced/>
              <div class="k-inset-actions-md">
                <q-btn
                  type="a"
                  flat
                  no-caps
                  :href="group.data.attributes.website"
                  target="_blank"
                  icon="link"
                  :label="group.data.attributes.website | link"
                  color="onsurface-m"
                />
              </div>
            </div>
            <!-- explore -->
            <div class="col-12 col-sm-6">
              <group-stats 
                :title="$t('Offers')"
                icon="local_offer"
                :content="group.data.relatinships.offers.meta.count"
                :href="`groups/${group.data.relatinships.offers.links.related}`"
                :items="['53 Alimentació','44 Serveis professionals','38 Salut i higiene','32 Arts i cultura','i més categories']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <group-stats 
                :title="$t('Needs')"
                icon="loyalty"
                :content="group.data.relatinships.needs.meta.count"
                :href="`groups/${group.data.relatinships.needs.links.related}`"
                :items="['53 Alimentació','44 Serveis professionals','38 Salut i higiene','32 Arts i cultura','i més categories']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <group-stats 
                :title="$t('Members')"
                icon="account_circle"
                :content="group.data.relatinships.members.meta.count"
                :href="`groups/${group.data.relatinships.members.links.related}`"
                :items="['13 Empreses', '8 Organitzacions', '40 Personals','4 Públics']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <group-stats 
                :title="$t('Currency')"
                icon="monetization_on"
                content="ℏ"
                href=""
                :items="['7.201 transaccions / any','89.500 intercanviats / any','6.500 en circulació','1 ECO = 1 EÇ = 0,1 ℏ = 1 tk']"
              />
            </div>
            <div class="col-12 col-sm-6 col-lg-8">
              <q-card square flat>
                <simple-map class="simple-map" :center="center" :marker-lat-lng="markerLatLng" />
                <q-card-section class="group-footer-card text-onsurface-m">
                  <q-icon name="place"/>
                  {{ group.data.attributes.location.name }}</q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-lg-4">
              <contact-list :ways-contact="group.included" />
            </div>
      </div>
    </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
import SimpleMap from '../../components/SimpleMap.vue';
import ContactList from '../../components/ContactList.vue';
import { GroupModel } from './models/model';
import NavigatorShare from '../../components/NavigatorShare.vue';
import SocialButtons from '../../components/SocialButtons.vue';
import GroupStats from '../../components/GroupStats.vue';

/**
 * GroupPage.
 */
export default Vue.extend({
  name: 'GroupPage',
  filters: {
    link(link: string): string {
      return link.replace(/(https|http):\/\//, '');
    }
  },
  components: {
    SimpleMap,
    NavigatorShare,
    ContactList,
    SocialButtons,
    GroupStats
  },
  props: {
    id: String
  },
  data() {
    return {
      group: {} as GroupModel,
      isLoading: true as boolean,
      contactsView: false,
      socialButtonsView: false
    };
  },
  computed: {
    center: function(): [number, number] {
      return [
        this.group.data.attributes.location.coordinates[0][0][0],
        this.group.data.attributes.location.coordinates[0][0][1]
      ];
    },
    markerLatLng: function(): [number, number] {
      return [
        this.group.data.attributes.location.coordinates[0][0][0],
        this.group.data.attributes.location.coordinates[0][0][1]
      ];
    },
    url() {
      return window.location.href;
    },
    title() {
      return document.title;
    }
  },
  beforeMount: function(): void {
    this.isLoading = true;
  },
  mounted: function(): void {
    this.collectGroup(this.id);
    this.displayErrors();
  },
  methods: {
    async collectGroup(id: string) {
      await api
        .getGroup(id)
        .then(response => {
          this.group = response.data;
          this.isLoading = false;
        })
        .catch(e => {
          this.isLoading = false;
          this.$errorsManagement.newError(e, 'GroupsList');
          this.displayErrors();
        });
    },
    displayErrors(): void {
      const errors = this.$errorsManagement.getErrors();
      if (errors) {
        for (const error in errors) {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: errors[error],
            icon: 'report_problem'
          });
        }
      }
    },
    onError(err: string) {
      // alert(err);
      console.log(err);
      this.contactsView = false;
      this.socialButtonsView = true;
    },
    onSuccess(err: string) {
      console.log(err);
    }
  }
});
</script>