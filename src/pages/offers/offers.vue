<template>
  <layout :search="true" :title="$t('offers')" @search="fetchOffers">

  </layout>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  methods: {
    fetchOffers(search?: string) {
      this.$store.dispatch("offers/loadList", {
        location: this.location,
        search,
        include: "members"
      });
    }
  }
})
</script>