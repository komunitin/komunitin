<template>
  <q-page class="q-pa-md main-page">
    <h6>{{ $t('Welcome to') }}</h6>
    <div class="main-logo">
      <img alt="logo" id="logo" src="~assets/komunitin-logo.svg" />
    </div>
    <p>{{ $t('Komunitin is') }}</p>

    <div class="highlights box-section-main">
      <p>{{ $t('Find Comunnity') }}</p>
    </div>

    <div class="q-pa-md row items-start q-gutter-md">
      <q-card class="welcome-card col-xs-12 col-sm-5 col-md-3">
        <q-card-section>
          <div class="text-h6">{{ $t('New in komunitin') }}</div>
          <div class="text-subtitle2">{{ $t('Find exchange nearby') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-btn
            color="primary"
            text-color="white"
            :label="$t('Use location')"
          />
          <p>
            {{ $t('or select country') }}
          </p>

          <div>
            <q-btn-dropdown
              class="col1"
              color="primary"
              :label="$t('Select conuntry')"
            >
              <q-list>
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Spain</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>France</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-item-label>Italy</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="welcome-card col-xs-12 col-sm-5 col-md-3">
        <q-card-section>
          <div class="text-h6">{{ $t('Crear nueva ecoxarxa') }}</div>
          <div class="text-subtitle2">{{ $t('"If not have community"') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="box-section-main">
            <q-btn
              color="primary"
              text-color="white"
              :label="$t('New exchange')"
              :to="{ name: 'NewExchangePage' }"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="welcome-card col-xs-12 col-sm-5 col-md-3">
        <q-card-section>
          <div class="text-h6">{{ $t('Need help') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="box-section-main">
            <p>{{ $t('Need help') }}</p>

            <q-btn color="primary" text-color="white" :label="$t('help')" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Pagina de bienvenida.
@Component
export default class PageIndex extends Vue {}
</script>
<style>
.welcome-card {
  margin-bottom: 4px;
}
</style>
