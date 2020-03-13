<template>
  <q-page-container class="container-kn">
    <q-header reveal elevated>
      <search-bar @newSearch="getExchangesListFilter" title="Groups near you" :backButton="true" />
    </q-header>
    <div class="q-pa-md row items-start q-gutter-md" style="min-height: 300px;">
      <vue-element-loading :active="isLoading" spinner="ring" color="#666" />
      <q-card
        v-for="exchange of exchanges"
        :key="exchange.id"
        class="card-kn col-xs-12 col-sm-5 col-md-3"
      >
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img :src="exchange.data.attributes.image" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ exchange.data.attributes.name }}</q-item-label>
            <q-item-label caption>{{ exchange.data.attributes.code }}</q-item-label>
          </q-item-section>
          <q-btn flat dense round icon="share" aria-label="Share" />
        </q-item>

        <!-- <img src="~assets/nomapa.png" /> -->
        <q-card-section class="simple-map">
          <simple-map
            :center="exchange.data.attributes.location.coordinates"
            :markerLatLng="exchange.data.attributes.location.coordinates"
          />
        </q-card-section>

        <q-card-section>{{ exchange.data.attributes.description | subStr }}</q-card-section>
        <q-card-actions>
          <q-btn :to="`exchanges/${exchange.id}`" flat color="primary">Explora</q-btn>
          <q-btn flat color="primary">Registra't</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page-container>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
import { GroupsListModel } from './models/model';

// @ts-ignore
import VueElementLoading from 'vue-element-loading';

// @ts-ignore
import SimpleMap from '../../components/SimpleMap';
// @ts-ignore
import SearchBar from '../../components/SearchBar';

/**
 * Groups's list.
 */
export default Vue.extend({
  name: 'ExchangeListPage',
  data() {
    return {
      exchanges: [] as GroupsListModel[],
      isLoading: false as boolean,
      haveUserLocation: false as boolean,
      lng: null as number | null,
      lat: null as number | null,
      pag: 1 as number,
      perPag: 10 as number
      // search: '' as string,
      // viewSearch: false as boolean
    };
  },
  components: {
    VueElementLoading,
    SimpleMap,
    SearchBar
  },
  beforeMount: function() {
    this.isLoading = true;
  },
  mounted: function() {
    this.getUserLocation();
  },
  filters: {
    subStr: function(string: string): string {
      if (string.length > 400) {
        return string.substring(0, 400) + '...';
      }
      return string;
    }
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
    displayLocationInfo(position: Position) {
      this.lng = position.coords.longitude;
      this.lat = position.coords.latitude;

      console.debug(`longitude: ${this.lng} | latitude: ${this.lat}`);
      this.getExchanges(this.pag, this.perPag, this.lng, this.lat);
    },
    handleLocationError(error: PositionError) {
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
          console.debug('Timeout was hit');
          break;
        case 2:
          // ...device can't get data
          // eslint-disable-next-line quotes
          console.debug("device can't get data");
          break;
        case 1:
          // ...user said no ☹️
          console.debug('user said no ☹️');
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
    async getExchanges(pag: number, perPag: number, lat?: number, lng?: number) {
      await api
        .getExchangesList(pag, perPag, lat, lng)
        .then(response => {
          this.isLoading = false;
          this.exchanges = response.data;
        })
        .catch(e => {
          // @ts-ignore
          this.$errorsManagement.newError(e, 'ExchangesList');
          this.isLoading = false;
          this.displayErrors();
        });
    },
    getExchangesListFilter(filter: string) {
      this.isLoading = true;
      api
        .getExchangesListFilter(filter)
        .then(response => {
          this.isLoading = false;
          this.exchanges = response.data;
        })
        .catch(e => {
          // @ts-ignore
          this.$errorsManagement.newError(e, 'ExchangesList');
          this.displayErrors();
          this.isLoading = false;
        });
    }
  }
});
</script>
<style scope>
.search-kn {
  width: 100%;
  font-size: 20px;
  font-style: oblique;
}
.velmld-spinner[data-v-1a4f1fc2] {
  top: 70px !important;
}
.simple-map {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
