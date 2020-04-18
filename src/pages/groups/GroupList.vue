<template>
  <div>
    <search-bar :title="$t('groupsNearYou')" :back-button="true" @newSearch="fetchGroups" />
    <div class="q-pa-md">
      <q-inner-loading :showing="isLoading" color="icon-dark" />
      <div class="row q-col-gutter-md">
        <div v-for="group of groups" :key="group.id" class="col-12 col-sm-6 col-md-4">
          <group-card :group="group" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import api from "../../services/Api/SocialApi";
import { GroupSummary } from "./models/model";

import SearchBar from "../../components/SearchBar.vue";
import GroupCard from "../../components/GroupCard.vue";

import KError, { KErrorCode } from "../../KError";

/**
 * Groups's list.
 */
export default Vue.extend({
  name: "GroupList",
  components: {
    SearchBar,
    GroupCard
  },
  data() {
    return {
      groups: [] as GroupSummary[],
      isLoading: true as boolean,
      location: null as [number, number] | null
    };
  },
  mounted: function() {
    this.getUserLocation();
  },
  methods: {
    hasLocation(): boolean {
      return this.location != null;
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
        this.groups = await api.getGroups(
          this.location != null ? this.location : undefined,
          search
        );
      } finally {
        this.isLoading = false;
      }
    }
  }
});
</script>
