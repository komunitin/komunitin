<template>
  <q-page class="flex main-page">
    <h6>{{ $t('welcome_to') }}</h6>
    <div class="main-logo">
      <img
        alt="logo"
        id="logo"
        src="~assets/komunitin-logo.svg"
      >
    </div>
    <p>Komunitin es una plataforma de codi obert que ofereix la gestió de moneda social per a les comunitats d'intercanvi.</p>

    <div class="box-section-main">
      <h6>Nou/ nova a komunitin?</h6>
      <p>
        Troba una xarxa d'intercanvi prop de tu i comença a utilitzar moneda social
      </p>
      <q-btn
        color="primary"
        text-color="white"
        label="Utilitza la localització"
        class="col-xs-2 col-sm-2 col-md-1"
      />
      <p>
        o selecciona un país per trobar-la.
      </p>

      <div>
        <q-btn-dropdown
          class="col1"
          color="primary"
          label="Select a country"
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
      <p>Troba la teva comunitat i comença a participar.</p>
    </div>

    <div class="box-section-main">

      <p>Si no tens una comunitat a prop teu sempre pots crear-la i començar una nova</p>

      <q-btn
        color="primary"
        text-color="white"
        label="Nova xarxa d’intercanvi"
      />

    </div>

    <div class="box-section-main">

      <p>Necessites ajuda?</p>

      <q-btn
        color="primary"
        text-color="white"
        label="Help"
      />
    </div>

  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>
