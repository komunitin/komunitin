<template>
  <q-layout>
    <q-page-container class="container-kn">
      <q-header reveal elevated>
        <q-toolbar>
          <q-btn flat dense round icon="arrow_back" aria-label="Home" @click="$router.back()" />
          <q-toolbar-title v-if="group.data">
            {{
            group.data.attributes.name
            }}
          </q-toolbar-title>
          <q-toolbar-title v-else>{{ $t('Groups near you') }}</q-toolbar-title>

          <q-btn v-if="group.data" right flat icon="message" @click="contactsView = true" />
          <navigator-share
            v-bind:on-error="onError"
            v-bind:on-success="onSuccess"
            v-bind:url="url"
            v-bind:title="title"
            text="Komunitin group"
          >
            <q-btn slot="clickable" right flat outline icon="share" />
          </navigator-share>
        </q-toolbar>
      </q-header>
      <vue-element-loading :active="isLoading" spinner="ring" color="#666" />
      <div
        v-if="group.data"
        class="group-detail q-pa-md row items-start q-gutter-md"
        style="min-height: 300px;"
      >
        <q-dialog v-model="contactsView">
          <contact-card :waysContact="group.included" />
        </q-dialog>

        <q-dialog v-model="socialButtonsView">
          <social-buttons v-bind:url="url" v-bind:title="title" />
        </q-dialog>

        <q-card class="card-header row justify-between">
          <q-card-section class="col-sm-4 col-xs-12">
            <q-img :src="group.data.attributes.image">
              <div
                class="absolute-bottom text-subtitle1 text-center"
              >{{ group.data.attributes.name }}</div>
            </q-img>
          </q-card-section>
          <!--<q-separator />-->
          <q-card-section class="group-description col-sm-8 col-xs-12">
            <h6 class="code-group">{{ group.data.attributes.code }}</h6>
            <div v-html="group.data.attributes.description"></div>
            <q-separator />
            <q-icon size="18px" flat round name="link" />
            <q-btn
              type="a"
              flat
              class="group-website"
              :href="group.data.attributes.website"
              target="_blank"
            >{{ group.data.attributes.website | link }}</q-btn>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-overline group-title-section">
              <q-icon name="local_offer" />Offers
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section horizontal>
            <q-card-section class="col-4 group-count-box">
              <h2 class="group-count">{{ group.data.relatinships.offers.meta.count }}</h2>
              <q-btn
                :to="
                  `exchanges/${group.data.relatinships.offers.links.related}`
                "
                flat
                color="primary"
              >Explora</q-btn>
            </q-card-section>

            <q-separator vertical />

            <q-card-section class="col-8">
              <ul>
                <li>53 Alimentació</li>
                <li>44 Serveis professionals</li>
                <li>38 Salut i higiene</li>
                <li>32 Arts i cultura</li>
                <li>i més categories</li>
              </ul>
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-overline group-title-section">
              <q-icon name="loyalty" />Needs
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section horizontal>
            <q-card-section class="col-4 group-count-box">
              <h2 class="group-count">{{ group.data.relatinships.needs.meta.count }}</h2>
              <q-btn
                :to="`exchanges/${group.data.relatinships.needs.links.related}`"
                flat
                color="primary"
              >Explora</q-btn>
            </q-card-section>

            <q-separator vertical />

            <q-card-section class="col-8">
              <ul>
                <li>53 Alimentació</li>
                <li>44 Serveis professionals</li>
                <li>38 Salut i higiene</li>
                <li>32 Arts i cultura</li>
                <li>i més categories</li>
              </ul>
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-overline group-title-section">
              <q-icon name="account_circle" />Members
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section horizontal>
            <q-card-section class="col-4 group-count-box">
              <h2 class="group-count">{{ group.data.relatinships.members.meta.count }}</h2>
              <q-btn
                :to="
                  `exchanges/${group.data.relatinships.members.links.related}`
                "
                flat
                color="primary"
              >Explora</q-btn>
            </q-card-section>

            <q-separator vertical />

            <q-card-section class="col-8">
              <ul>
                <li>53 Alimentació</li>
                <li>44 Serveis professionals</li>
                <li>38 Salut i higiene</li>
                <li>32 Arts i cultura</li>
                <li>i més categories</li>
              </ul>
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-overline group-title-section">
              <q-icon name="monetization_on" />Currency
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section horizontal>
            <q-card-section class="col-4 group-count-box">
              <h2 class="group-count">@</h2>
              <p>Vent</p>

              <q-btn
                :to="`exchanges/${group.data.relatinships.needs.links.related}`"
                flat
                color="primary"
              >Explora</q-btn>
            </q-card-section>

            <q-separator vertical />

            <q-card-section class="col-8">
              <ul>
                <li>53 Alimentació</li>
                <li>44 Serveis professionals</li>
                <li>38 Salut i higiene</li>
                <li>32 Arts i cultura</li>
                <li>i més categories</li>
              </ul>
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <simple-map class="simple-map" :center="center" :markerLatLng="markerLatLng" />
          </q-card-section>
          <q-card-section class="group-footer-card">
            {{
            group.data.attributes.location.name
            }}
          </q-card-section>
        </q-card>

        <contact-card :waysContact="group.included" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
// @ts-ignore
import SimpleMap from '../../components/SimpleMap';
// @ts-ignore
import ContactCard from '../../components/ContactCard';
import { GroupModel } from './models/model';
// @ts-ignore
import VueElementLoading from 'vue-element-loading';
// @ts-ignore
import NavigatorShare from '../../components/NavigatorShare';
// @ts-ignore
import SocialButtons from '../../components/SocialButtons';

/**
 * ExchangePage.
 */
export default Vue.extend({
  name: 'ExchangePage',
  data() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      group: {} as GroupModel,
      isLoading: true as boolean,
      contactsView: false,
      socialButtonsView: false
    };
  },
  filters: {
    link(link: string): string {
      return link.replace(/(https|http):\/\//, '');
    }
  },
  components: {
    VueElementLoading,
    SimpleMap,
    NavigatorShare,
    ContactCard,
    SocialButtons
  },
  props: {
    id: String
  },
  beforeMount: function(): void {
    this.isLoading = true;
  },
  mounted: function(): void {
    this.collectExchange(this.id);
    this.displayErrors();
  },
  methods: {
    async collectExchange(id: string) {
      await api
        .getExchange(id)
        .then(response => {
          this.group = response.data;
          this.isLoading = false;
        })
        .catch(e => {
          this.isLoading = false;
          // @ts-ignore
          this.$errorsManagement.newError(e, 'ExchangesList');
          this.displayErrors();
        });
    },
    displayErrors(): void {
      // @ts-ignore
      let errors = this.$errorsManagement.getErrors();
      if (errors) {
        for (var error in errors) {
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
  }
});
</script>
<style scope>
.card-header {
  box-shadow: none;
  max-width: 100% !important;
  width: 100%;
}
.group-website {
  text-transform: none;
  margin-left: 4px;
}
.group-detail .q-card {
  width: 100%;
  max-width: 350px;
}
.group-detail .q-card__section {
  padding: 0;
}
.code-group {
  margin: 0 0 5px 0;
}
.simple-map {
  width: 100%;
  margin: 0;
  padding: 0;
}
.q-btn__wrapper.col.row.q-anchor--skip {
  padding: 0 4px;
}
.group-title-section {
  font-size: 17px;
  color: rgba(0, 0, 0, 0.63);
  margin: 8px;
}
.material-icons.q-icon.notranslate {
  margin: 0 10px 0 0;
}
.q-card:not(.card-header) hr {
  background: transparent;
}
.group-count {
  margin: 18px 0;
}
.group-detail li {
  list-style: none;
}
.group-count-box {
  padding: 0 0 0 15px !important;
}
.group-footer-card {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.63);
}
.group-detail a {
  color: black;
  text-decoration: none;
}
.group-detail .leaflet-control-attribuittion.leaflet-control {
  display: none !important;
}
.group-description {
  padding: 10px 0 0 8px !important;
}
.card-header .q-img.overflow-hidden {
  height: auto;
}
</style>
