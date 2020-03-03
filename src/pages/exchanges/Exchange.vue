<template>
  <q-page-container class="container-kn">
    <q-header reveal elevated>
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" aria-label="Home" @click="$router.back()" />
        <q-toolbar-title>{{ $t('Groups near you') }}</q-toolbar-title>
        <q-btn right flat icon="message" />
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
    <div class="row" style="min-height: 400px;">
      <q-card v-if="group.data" class="my-card">
        <q-card-section>
          <q-img :src="group.data.attributes.image" style="max-width: 400px; height: 200px;">
            <div class="absolute-bottom text-subtitle1 text-center">{{ group.data.attributes.name }}</div>
          </q-img>
          <h6>{{ group.data.attributes.code }}</h6>
          <div v-html="group.data.attributes.description"></div>
        </q-card-section>
        <q-card-section>
          <simple-map class="simple-map" :center="center" :markerLatLng="markerLatLng" />
        </q-card-section>
      </q-card>
      <q-card v-if="group.data">
        <q-card-section>
          <p>
            Accounts:
            <b>{{ group.data.relatinships.members.meta.count }}</b>
          </p>
        </q-card-section>
      </q-card>
      <vue-element-loading :active="isLoading" spinner="ring" color="#666" />
    </div>
  </q-page-container>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
// @ts-ignore
import SimpleMap from '../../components/SimpleMap';
import { GroupModel } from './models/model';

// @ts-ignore
import VueElementLoading from 'vue-element-loading';
// @todo Aún pocos navegadores soportan esto, hay que
// añadir una alternativa por si falla.
// @see vue-share-social
// @ts-ignore
import NavigatorShare from 'vue-navigator-share';

/**
 * ExchangePage.
 *
 * @todo Share and Message buttons.
 */
export default Vue.extend({
  name: 'ExchangePage',
  data() {
    return {
      group: {} as GroupModel,
      isLoading: true as boolean
    };
  },
  components: {
    VueElementLoading,
    SimpleMap,
    NavigatorShare
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
        console.log(this.group); // @dev
      })
      .catch(e => {
        this.isLoading = false;
        // @todo Use localstorage cache.
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
.q-card {
  width: 300px;
  box-shadow: none;
}
.simple-map {
  width: 100%;
  margin: 0;
  padding: 0;
}
.q-btn__wrapper.col.row.q-anchor--skip {
  padding: 0 4px;
}
</style>
