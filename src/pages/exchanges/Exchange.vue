<template>
  <div class="row" style="min-height: 400px;">
    <q-card v-if="exchange" class="my-card">
      <q-card-section>
        <q-img
          :src="exchange['attributes']['image']"
          style="max-width: 400px; height: 200px;"
        >
          <div class="absolute-bottom text-subtitle1 text-center">
            {{ exchange['attributes']['name'] }}
          </div>
        </q-img>
        <h6>{{ exchange['attributes']['code'] }}</h6>
        <div v-html="exchange['attributes']['description']"></div>
      </q-card-section>
    </q-card>
    <q-card v-if="exchange">
      <q-card-section>
        <p>
          Accounts:
          <b>{{ exchange['relatinships']['members']['meta']['count'] }}</b>
        </p>
      </q-card-section>
    </q-card>
    <vue-element-loading :active="isLoading" spinner="ring" color="#666" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
// @ts-ignore
import VueElementLoading from 'vue-element-loading';

export default Vue.extend({
  name: 'ExchangePage',
  data() {
    return {
      exchange: false as any[] | boolean,
      isLoading: true as boolean
    };
  },
  components: {
    VueElementLoading
  },
  props: {
    id: String
  },
  beforeMount: function() {
    this.isLoading = true;
  },
  mounted: function() {
    api
      .getExchange(this.id)
      .then(response => {
        this.exchange = response.data;
        this.isLoading = false;
      })
      .catch(e => {
        this.isLoading = false;
        // @todo Use localstorage cache.
        // @ts-ignore
        this.$errorsManagement.newError(e, 'ExchangesList');
      });
    // @ts-ignore
    let errors = this.$errorsManagement.getErrors();
    if (errors) {
      for (var error in errors) {
        // console.log(errors[error]);
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: errors[error],
          icon: 'report_problem'
        });
      }
    }
  }
});
</script>
<style>
.q-card {
  width: 300px;
  box-shadow: none;
}
</style>
