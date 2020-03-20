<template>
  <div>
        <q-toolbar class="bg-primary text-onprimary">
          <q-btn flat round icon="arrow_back" aria-label="Home" @click="$router.back()" />
          <q-toolbar-title>{{ group.data ? group.data.attributes.name : ''}}</q-toolbar-title>

          <q-btn v-if="group.data" right flat round icon="message" @click="contactsView = true" />
          <share-button v-if="group.data"
            :text="$t('Check the exchange community {group}', {group: group.data.attributes.name})" 
            :title="group.data.attributes.name"
          />
        </q-toolbar>

        <!-- Message Dialog -->
        <q-dialog v-if="group.data" v-model="contactsView">
          <q-card>
            <q-card-section class="q-pb-none">
              <div class="text-h6">{{$t('Contact')}}</div>
            </q-card-section>
            <q-card-section>
              <social-network-list 
                type="contact"
                :networks="groupContacts"
              />
            </q-card-section>
          </q-card>
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
                :content="group.data.relationships.offers.meta.count"
                :href="`groups/${group.data.relationships.offers.links.related}`"
                :items="['53 Alimentació','44 Serveis professionals','38 Salut i higiene','32 Arts i cultura','i més categories']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <group-stats 
                :title="$t('Needs')"
                icon="loyalty"
                :content="group.data.relationships.needs.meta.count"
                :href="`groups/${group.data.relationships.needs.links.related}`"
                :items="['53 Alimentació','44 Serveis professionals','38 Salut i higiene','32 Arts i cultura','i més categories']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <group-stats 
                :title="$t('Members')"
                icon="account_circle"
                :content="group.data.relationships.members.meta.count"
                :href="`groups/${group.data.relationships.members.links.related}`"
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
              <social-network-list 
                type="contact"
                :networks="groupContacts"
              />
            </div>
      </div>
    </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
import SimpleMap from '../../components/SimpleMap.vue';
import { GroupModel, Contact, ResourceObject } from './models/model';
import GroupStats from '../../components/GroupStats.vue';
import ShareButton from '../../components/ShareButton.vue';
import SocialNetworkList from '../../components/SocialNetworkList.vue';

interface ContactNames {
  [key: string] : {
    name: string
  }
}
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
    ShareButton,
    GroupStats,
    SocialNetworkList
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      group: {} as GroupModel,
      isLoading: true,
      contactsView: false,
      socialButtonsView: false
    };
  },
  computed: {
    center: function(): [number, number] {
      return this.group.data.attributes.location.coordinates[0][0]
    },
    markerLatLng: function(): [number, number] {
      return this.group.data.attributes.location.coordinates[0][0]
    },
    url(): string {
      return window.location.href;
    },
    title(): string {
      return document.title;
    },
    groupContacts() : ContactNames {
      const contactIds = this.group.data.relationships.contacts.data.reduce(
        (accum: string[], resourceId) => { 
          accum.push(resourceId.id)
          return accum; 
        }, [] as string[]);

      const contacts = this.group.included
        .filter(function(resource) {
          const contact = resource as ResourceObject;
          return contact.data.type == "contacts" && contactIds.includes(contact.data.id);
        }).reduce(function (contacts: ContactNames, resource) {
          const contact = resource as Contact;
          contacts[contact.data.attributes.type ] = {
            name: contact.data.attributes.name
          }
          return contacts;
        }, {} as ContactNames);

      return contacts;
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