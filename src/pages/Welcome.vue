<template>
  <q-page class="q-pa-md main-page">
    <h6>{{ $t('welcome_to') }}</h6>
    <div class="main-logo">
      <img
        alt="logo"
        id="logo"
        src="~assets/komunitin-logo.svg"
      >
    </div>
    <p>{{ $t('komuniti_is') }}</p>

    <div class="highlights box-section-main">
      <p>{{ $t('find_comunnity') }}</p>
    </div>

    <div class="q-pa-md row items-start q-gutter-md">

      <q-card class="welcome-card col-xs-12 col-sm-5 col-md-3">
        <q-card-section>
          <div class="text-h6">{{ $t('new_in_komunitin') }}</div>
          <div class="text-subtitle2">{{ $t('find_exchange') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">

          <q-btn
            color="primary"
            text-color="white"
            :label="$t('use_location')"
          />
          <p>
            {{ $t('or_select') }}
          </p>

          <div>
            <q-btn-dropdown
              class="col1"
              color="primary"
              :label="$t('select_country')"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                >
                  <q-item-section>
                    <q-item-label>Spain</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                >
                  <q-item-section>
                    <q-item-label>France</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                >
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
          <div class="text-subtitle2">{{ $t('if_not_have_community') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">

          <div class="box-section-main">

            <q-btn
              color="primary"
              text-color="white"
              :label="$t('new_exchange')"
              :to="{ name: 'NewExchangePage' }"
            />

          </div>

        </q-card-section>
      </q-card>

      <q-card class="welcome-card col-xs-12 col-sm-5 col-md-3">
        <q-card-section>
          <div class="text-h6">{{ $t('need_help') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">

          <div class="box-section-main">

            <p>{{ $t('need_help') }}</p>

            <q-btn
              color="primary"
              text-color="white"
              :label="$t('help')"
            />
          </div>

        </q-card-section>
      </q-card>

    </div>

  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>
<style>
.welcome-card {
  margin-bottom: 4px;
}
</style>

