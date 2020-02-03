<template>
<div>
<h2>Exchange</h2>
<ul v-for="item of exchanges">
  <li>{{ item.name }}</li>
</ul>
<button @click="getAllExchanges">Get Echanges</button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

export default Vue.extend ({
  name: 'ExchangePage',
  computed: {
    ...mapState('exchanges', ['exchanges'])
  },
  methods: {
    ...mapActions('exchanges', ['getAllExchanges'])
  }

});
</script>