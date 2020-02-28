<template>
  <q-page-container class="container-kn">
    <q-header reveal elevated>
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" aria-label="Home" @click="$router.back()" />

        <q-toolbar-title v-if="viewSearch !== true">{{ $t('Groups near you')}}</q-toolbar-title>

        <q-input
          v-if="viewSearch === true"
          class="search-kn"
          dark
          v-model="search"
          dense
          autofocus
        />
        <q-btn flat v-on:click="searchBox()" icon="search" />
      </q-toolbar>
    </q-header>
    <div class="q-pa-md row items-start q-gutter-md" style="min-height: 300px;">
      <q-card
        v-for="exchange of exchanges"
        :key="exchange.id"
        class="card-kn col-xs-12 col-sm-5 col-md-3"
      >
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img :src="exchange.logo" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ exchange.name }}</q-item-label>
            <q-item-label caption>{{ exchange.code }}</q-item-label>
          </q-item-section>
          <!-- @todo Share exchange. -->
          <q-btn flat dense round icon="share" aria-label="Share" />
        </q-item>

        <img src="~assets/nomapa.png" />
        <q-card-section>{{ exchange.description }}</q-card-section>
        <q-card-actions>
          <q-btn :to="`exchanges/${exchange.id}`" flat color="primary">Explora</q-btn>
          <q-btn flat color="primary">Registra't</q-btn>
        </q-card-actions>
      </q-card>
      <vue-element-loading :active="isLoading" spinner="ring" color="#666" />
    </div>
  </q-page-container>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
// @ts-ignore
import VueElementLoading from 'vue-element-loading';

/**
 * Listado de exhanges.
 *
 * @todo Recibir localización para mostrar las más cercanas primero.
 * @todo Se podría añadir la distancia de cada ecoxarxa respecto a la del usuario.
 */
export default Vue.extend({
  name: 'ExchangeListPage',
  data() {
    return {
      exchanges: [] as any[],
      isLoading: false as boolean,
      haveUserLocation: false as boolean,
      lng: '' as string,
      lat: '' as string,
      pag: 1 as number,
      perPag: 10 as number,
      search: '' as string,
      viewSearch: false as boolean,
      searchBoxStep: 0 as number
    };
  },
  components: {
    VueElementLoading
  },
  beforeMount: function() {
    this.isLoading = true;
  },
  mounted: function() {
    this.getUserLocation();
  },
  methods: {
    /**
     * - One click open input.
     * - Second click launch search.
     */
    searchBox() {
      if (this.search !== '') {
        // Launch search.
      } else {
        this.viewSearch = !this.viewSearch;
      }
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
    displayLocationInfo(position: any) {
      this.lng = position.coords.longitude;
      this.lat = position.coords.latitude;

      console.log(`longitude: ${this.lng} | latitude: ${this.lat}`);
      this.getExchanges(this.pag, this.perPag, this.lng, this.lat);
    },
    handleLocationError(error: any) {
      switch (error.code) {
        case 3:
          // timeout was hit, meaning nothing's in the cache
          // let's provide a default location:
          // this.displayLocationInfo({
          //   coords: { longitude: 33.631839, latitude: 27.380583 }
          // });

          // now let's make a non-cached request to get the actual position
          // navigator.geolocation.getCurrentPosition(
          //   this.displayLocationInfo,
          //   this.handleLocationError
          // );
          console.log('Timeout was hit');
          break;
        case 2:
          // ...device can't get data
          console.log("device can't get data");
          break;
        case 1:
          // ...user said no ☹️
          console.log('user said no ☹️');
      }
      this.getExchanges(this.pag, this.perPag);
    },
    getUserLocation() {
      navigator.geolocation.getCurrentPosition(
        this.displayLocationInfo,
        this.handleLocationError,
        { maximumAge: 1500000, timeout: 100000 }
      );
    },
    getExchanges(pag: number, perPag: number, lat?: string, lng?: string) {
      api
        .getExchangesList(pag, perPag, lat, lng)
        .then(response => {
          this.exchanges = response.data;
          this.isLoading = false;
        })
        .catch(e => {
          this.isLoading = false;
          // @todo Use localstorage cache.
          // @ts-ignore
          this.$errorsManagement.newError(e, 'ExchangesList');
          this.displayErrors();
        });
    }
  }
});
</script>
<style>
.search-kn {
  /* width: 30px; */

  font-size: 20px;
  font-style: oblique;
}
</style>
