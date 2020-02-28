<template>
  <div class="row items-start q-gutter-md col-kn" style="min-height: 300px;">
    <q-card
      v-for="exchange of exchanges"
      :key="exchange.id"
      class="card-kn col-xs-12 col-sm-5 col-md-3"
    >
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img :src="exchange.logo" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ exchange.name }}</q-item-label>
          <q-item-label caption>{{ exchange.code }}</q-item-label>
        </q-item-section>
        <!-- @todo Share exchange. -->
        <q-btn flat dense round icon="share" aria-label="Share" />
      </q-item>

      <img src="~assets/nomapa.png" />
      <q-card-section>{{ exchange.description }}</q-card-section>
      <q-card-actions>
        <q-btn :to="`exchanges/${exchange.id}`" flat color="primary">Explora</q-btn>
        <q-btn flat color="primary">Registra't</q-btn>
      </q-card-actions>
    </q-card>
    <vue-element-loading :active="isLoading" spinner="ring" color="#666" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import api from '../../services/ICESApi';
// @ts-ignore
import VueElementLoading from 'vue-element-loading';

/**
 * Listado de exhanges.
 *
 * @todo Recibir localización para mostrar las más cercanas primero.
 * @todo Se podría añadir la distancia de cada ecoxarxa respecto a la del usuario.
 */
export default Vue.extend({
  name: 'ExchangeListPage',
  data() {
    return {
      exchanges: [] as any[],
      isLoading: false as boolean
    };
  },
  components: {
    VueElementLoading
  },
  beforeMount: function() {
    this.isLoading = true;
  },
  mounted: function() {
    api
      .getExchangesList()
      .then(response => {
        this.exchanges = response.data;
        this.isLoading = false;
      })
      .catch(e => {
        this.isLoading = false;
        // @todo Use localstorage cache.
        // @ts-ignore
        this.$errorsManagement.newError(e, 'ExchangesList');
        this.displayErrors();
      });
  },
  methods: {
    displayErrors(): void {
      // @ts-ignore
      let errors = this.$errorsManagement.getErrors();
      if (errors) {
        for (var error in errors) {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: errors[error],
            icon: 'report_problem'
          });
        }
      }
    }
  }
});
</script>
<style>
.card-kn {
  max-width: 94%;
  justify-content: center;
}
.col-kn {
  display: flex;
  width: 94%;
  margin-left: -4px;
}
.container-kn {
  margin: 16px 0 0 0;
}
</style>
