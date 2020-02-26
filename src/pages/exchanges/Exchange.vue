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
  <div v-else class="loadnig">Loading....</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

export default Vue.extend({
  name: 'ExchangePage',
  props: {
    id: String
  },
  beforeMount: function() {
    this.$q.loading.show({
      delay: 400 // ms
    });
  },
  mounted: function() {
    this.$q.loading.hide();
    this.getExchange(this.id);
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
