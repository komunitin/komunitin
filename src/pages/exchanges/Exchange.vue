<template>
  <div>
    <h2>Exchange: {{ id }}</h2>
    {{ exchange.name}}
    {{ exchange.code}}
    {{ exchange.description}}
    {{ exchange.logo}}
    {{ exchange.country}}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

export default Vue.extend({
  name: 'ExchangePage',
  props: {
    id: String
  },
  mounted: function() {
    this.getExchange(this.id);
    console.log(this.exchange);
  },
  computed: {
    ...mapState('exchanges', ['exchange'])
  },
  methods: {
    ...mapActions('exchanges', ['getExchange'])
  }
});
</script>