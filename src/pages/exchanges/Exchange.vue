<template>
  <q-layout>
    <q-page-container class="container-kn">
      <q-header reveal elevated>
        <q-toolbar>
          <q-btn flat dense round icon="arrow_back" aria-label="Home" @click="$router.back()" />
          <q-toolbar-title v-if="group.data">{{ group.data.attributes.name }}</q-toolbar-title>
          <q-toolbar-title v-else>{{ $t('Groups near you') }}</q-toolbar-title>

          <q-btn
            v-if="group.data"
            type="a"
            :href="`mailto:${group.data.attributes.mail}`"
            right
            flat
            icon="message"
          />
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
        <q-card class="card-header">
          <q-card-section>
            <q-img :src="group.data.attributes.image" style="max-width: 400px; height: 200px;">
              <div
                class="absolute-bottom text-subtitle1 text-center"
              >{{ group.data.attributes.name }}</div>
            </q-img>
            <h6 class="code-group">{{ group.data.attributes.code }}</h6>
            <div v-html="group.data.attributes.description"></div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-icon size="18px" flat round name="link" />
            <q-btn
              type="a"
              flat
              class="group-website"
              :href="group.data.attributes.website"
              target="_blank"
            >{{ group.data.attributes.website | link }}</q-btn>
          </q-card-actions>
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
                :to="`exchanges/${group.data.relatinships.offers.links.related}`"
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
                :to="`exchanges/${group.data.relatinships.members.links.related}`"
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
          <q-card-section class="group-footer-card">{{ group.data.attributes.location.name }}</q-card-section>
        </q-card>

        <contact-card :waysContact="group.included" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
/**
 * @todo Test de componentes y página.
 * @todo Hacer que si hay espacio el logo pase a la izquierda.
 * @todo Acabar de definir diseño de los títulos de secciones (General, Explora, Localización, Contacto)
 */
import Vue from 'vue';
import api from '../../services/ICESApi';
// @ts-ignore
import SimpleMap from '../../components/SimpleMap';
// @ts-ignore
import ContactCard from '../../components/ContactCard';
import { GroupModel } from './models/model';
// @ts-ignore
import VueElementLoading from 'vue-element-loading';
// @todo Aún pocos navegadores soportan esto, hay que
// añadir una alternativa por si falla.
// @see vue-share-social
// @ts-ignore
import NavigatorShare from '../../components/NavigatorShare';

/**
 * ExchangePage.
 */
export default Vue.extend({
  name: 'ExchangePage',
  data() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      group: {} as GroupModel,
      isLoading: true as boolean
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
    ContactCard
  },
  props: {
    id: String
  },
  beforeMount: function(): void {
    this.isLoading = true;
  },
  mounted: function(): void {
    api
      .getExchange(this.id)
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
    this.displayErrors();
  },
  methods: {
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
      alert(err);
      console.log(err);
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
.group-detail .leaflet-control-attribution.leaflet-control {
  display: none !important;
}
</style>
