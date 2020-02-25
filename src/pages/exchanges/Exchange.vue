<template>
  <div class="row">
    <q-card class="my-card">
      <q-card-section>
        <q-img :src="exchange['attributes']['image']" style="max-width: 400px; height: 200px;">
          <div
            class="absolute-bottom text-subtitle1 text-center"
          >{{ exchange['attributes']['name'] }}</div>
        </q-img>
        <h6>{{ exchange['attributes']['code'] }}</h6>
        <div v-html="exchange['attributes']['description']"></div>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section>
        <p>
          Accounts:
          <b>{{ exchange['relatinships']['members']['meta']['count'] }}</b>
        </p>
        <p>
          Location:
          <b>{{ exchange['attributes']['localtion']}}</b>
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';
import { clearLastError } from '../../store/exchanges/actions';

export default Vue.extend({
  name: 'ExchangePage',
  props: {
    id: String
  },
  mounted: function() {
    this.getExchange(this.id);
    if (this.lastError.message) {
      console.log(this.lastError.message);
      this.$q.notify({
        color: 'negative',
        position: 'top',
        message: this.lastError.message,
        icon: 'report_problem'
      });
      this.clearLastError;
    }
  },
  computed: {
    ...mapState('exchanges', ['exchange'], ['lastError'])
  },
  methods: {
    ...mapActions('exchanges', ['getExchange'], ['clearLastError'])
  }
});
</script>
<style>
.q-card {
  width: 300px;
  box-shadow: none;
}
</style>
