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

    <div class="box-section-main">
      <h6>{{ $t('new_in_komunitin') }}</h6>
      <p>
        {{ $t('find_exchange') }}
      </p>
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

    </div>

    <div class="highlights box-section-main">
      <p>{{ $t('find_comunnity') }}</p>
    </div>

    <div class="box-section-main">

      <p>{{ $t('if_not_have_community') }}</p>

      <q-btn
        color="primary"
        text-color="white"
        :label="$t('new_exchange')"
        :to="{ name: 'NewExchangePage' }"
      />

    </div>

    <div class="box-section-main">

      <p>{{ $t('need_help') }}</p>

      <q-btn
        color="primary"
        text-color="white"
        :label="$t('help')"
      />
    </div>

  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>
