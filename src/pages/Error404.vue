<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
    </p>
    <!-- eslint-disable vue-i18n/no-raw-text -->
    <p class="text-faded">{{ $t('SorryNothingHere') }}<strong>(404)</strong></p>
    <q-btn color="secondary" style="width:200px;" to="/" label="Go back" />
  </div>
</template>
