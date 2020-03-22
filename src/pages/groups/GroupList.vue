<template>
  <div>
    <search-bar
      title="Groups near you"
      :back-button="true"
      @newSearch="getGroupsListFilter"
    />
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <div class="row q-col-gutter-md">
        <div v-for="group of groups" :key="group.id" class="col-12 col-sm-6 col-md-4">
          <q-card>
            <!-- Header with group avatar, name and short code -->
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img :src="group.data.attributes.image" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ group.data.attributes.name }}</q-item-label>
                <q-item-label caption>
                  {{ group.data.attributes.code }}
                </q-item-label>
              </q-item-section>
              <share-button v-if="group.data" class="text-icon-dark"
                :text="$t('Check the exchange community {group}', {group: group.data.attributes.name})" 
                :title="group.data.attributes.name"
                :url="groupUrl(group.id)"
              />
            </q-item>
            <!-- Group position map -->
            <q-card-section class="simple-map">
              <simple-map
                :center="group.data.attributes.location.coordinates"
                :marker-lat-lng="group.data.attributes.location.coordinates"
              />
            </q-card-section>
            <!-- Group description -->
            <q-card-section>
              {{ group.data.attributes.description | subStr }}
            </q-card-section>
            <!-- group actions -->
            <q-card-actions>
              <q-btn :to="`groups/${group.id}`" flat color="primary">{{$t('Explore')}}</q-btn>
              <q-btn flat color="primary">{{$t('Sign Up')}}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
import { GroupsListModel } from './models/model';

import SimpleMap from '../../components/SimpleMap.vue';
import SearchBar from '../../components/SearchBar.vue';
import ShareButton from '../../components/ShareButton.vue';

/**
 * Groups's list.
 */
export default Vue.extend({
  name: 'GroupList',
  components: {
    SimpleMap,
    SearchBar,
    ShareButton
  },
  filters: {
    subStr: function(string: string): string {
      if (string.length > 400) {
        return string.substring(0, 400) + '...';
      }
      return string;
    }
  },
  data() {
    return {
      groups: [] as GroupsListModel[],
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
  beforeMount: function() {
    this.isLoading = true;
  },
  mounted: function() {
    this.getUserLocation();
  },
  methods: {
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
    displayLocationInfo(position: Position) {
      this.lng = position.coords.longitude;
      this.lat = position.coords.latitude;

      console.debug(`longitude: ${this.lng} | latitude: ${this.lat}`);
      this.getGroups(this.pag, this.perPag, this.lng, this.lat);
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
      this.getGroups(this.pag, this.perPag);
    },
    getUserLocation() {
      navigator.geolocation.getCurrentPosition(
        this.displayLocationInfo,
        this.handleLocationError,
        { maximumAge: 1500000, timeout: 100000 }
      );
    },
    async getGroups(pag: number, perPag: number, lat?: number, lng?: number) {
      await api
        .getGroupsList(pag, perPag, lat, lng)
        .then(response => {
          this.isLoading = false;
          this.groups = response.data;
        })
        .catch(e => {
          this.$errorsManagement.newError(e, 'GroupsList');
          this.isLoading = false;
          this.displayErrors();
        });
    },
    getGroupsListFilter(filter: string) {
      this.isLoading = true;
      api
        .getGroupsListFilter(filter)
        .then(response => {
          this.isLoading = false;
          this.groups = response.data;
        })
        .catch(e => {
          this.$errorsManagement.newError(e, 'GroupsList');
          this.displayErrors();
          this.isLoading = false;
        });
    },
    groupUrl(id: string) : string {
      const base = window?.location.origin ?? '';
      return base + this.$router.resolve('groups/'+id).href;
    }
  }
});
</script>
