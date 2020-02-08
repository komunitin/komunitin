<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card
      v-for="exchange of exchanges"
      :key="exchange.id"
      class="welcome-card col-xs-12 col-sm-5 col-md-3"
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
      <q-card-section>{{ exchange.description}}</q-card-section>
      <q-card-actions>
        <q-btn :to="`exchanges/${exchange.id}`" flat color="primary">Explora</q-btn>
        <q-btn flat color="primary">Registra't</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

/**
 * Listado de exhanges.
 *
 * @todo Recibir localización para mostrar las más cercanas primero.
 * @todo Se podría añadir la distancia de cada ecoxarxa respecto a la del usuario.
 */
export default Vue.extend({
  name: 'ExchangeListPage',
  mounted: function() {
    this.getAllExchanges();
  },
  computed: {
    ...mapState('exchanges', ['exchanges'])
  },
  methods: {
    ...mapActions('exchanges', ['getAllExchanges'])
  }
});
</script>