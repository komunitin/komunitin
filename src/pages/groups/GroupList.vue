<template>
  <layout>
    <template v-slot:toolbar>
      <search-bar
        :title="$t('groupsNearYou')"
        :back-button="true"
        @newSearch="fetchGroups"
      />
    </template>
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <div class="row q-col-gutter-md">
        <div
          v-for="group of groups"
          :key="group.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <group-card :group="group" />
        </div>
      </div>
    </div>
  </layout>
</template>

<script lang="ts">
import Vue from "vue";

import { Group } from "../../store/model";

import Layout from "../../layouts/Layout.vue";
import SearchBar from "../../components/SearchBar.vue";
import GroupCard from "../../components/GroupCard.vue";

import KError, { KErrorCode } from "../../KError";

/**
 * Groups's list.
 */
export default Vue.extend({
  name: "GroupList",
  components: {
    Layout,
    SearchBar,
    GroupCard
  },
  data() {
    return {
      isLoading: true,
      location: undefined as [number, number] | undefined
    };
  },
  computed: {
    groups(): Group[] {
      return this.$store.getters["groups/currentList"];
    }
  },
  mounted: function() {
    this.getUserLocation();
  },
  methods: {
    hasLocation(): boolean {
      return this.location !== undefined;
    },
    handleLocationInfo(position: Position) {
      this.location = [position.coords.longitude, position.coords.latitude];
      // Update group list
      this.fetchGroups();
    },
    handleLocationError(error: PositionError) {
      // Handle Error.
      const codes = [] as KErrorCode[];
      codes[error.TIMEOUT] = KErrorCode.PositionTimeout;
      codes[error.POSITION_UNAVAILABLE] = KErrorCode.PositionUnavailable;
      codes[error.PERMISSION_DENIED] = KErrorCode.PositionPermisionDenied;
      this.$handleError(new KError(codes[error.code], error.message, error));

      // Show groups anyway.
      this.fetchGroups();
    },
    getUserLocation() {
      navigator.geolocation.getCurrentPosition(
        this.handleLocationInfo,
        this.handleLocationError,
        { maximumAge: 1500000, timeout: 100000 }
      );
    },
    /**
     * Load groups ordered by location, if available. Optionally filter them by a search
     */
    async fetchGroups(search?: string) {
      try {
        this.isLoading = true;
        await this.$store.dispatch("groups/loadList", {
          location: this.location,
          search,
          include: "contacts"
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
});
</script>
