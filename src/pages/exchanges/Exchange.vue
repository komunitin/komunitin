<template>
  <div v-if="exchange" class="row">
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
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
// import { mapState, mapActions } from 'vuex';
import api from '../../services/ICESApi';

export default Vue.extend({
  name: 'ExchangePage',
  data() {
    return {
      exchange: [] as any[]
    };
  },
  props: {
    id: String
  },
  beforeMount: function() {
    this.$q.loading.show();
  },
  mounted: function() {
    api.getExchange(this.id).then(response => {
      this.exchange = response.data;
      this.$q.loading.hide();
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
  // computed: {
  //   ...mapState('exchanges', ['exchange'])
  // },
  // methods: {
  //   ...mapActions('exchanges', ['getExchange'])
  // }
});
</script>
<style>
.q-card {
  width: 300px;
  box-shadow: none;
}
</style>
