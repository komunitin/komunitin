<template>
  <div class="row">
    <q-card class="my-card">
      <q-card-section>
        <q-img :src="exchange.logo" style="max-width: 400px; height: 200px;">
          <div class="absolute-bottom text-subtitle1 text-center">{{ exchange.name}}</div>
        </q-img>

        <h6>{{ exchange.code}}</h6>

        <div>{{ exchange.description}}</div>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section>
        <p>
          Accounts:
          <b>{{ exchange.accounts}}</b>
        </p>
        <p>
          Location:
          <b>{{ exchange.location}}</b>
        </p>
      </q-card-section>
    </q-card>
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
<style>
.q-card {
  width: 300px;
  box-shadow: none;
}
</style>