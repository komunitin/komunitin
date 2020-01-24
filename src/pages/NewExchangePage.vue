<template>
  <q-page padding>
    <p>{{ $t('new_exchange_page.To open a new network') }}</p>
    <h6>{{ $t('new_exchange_page.Do you really want to open a new network') }}</h6>
    <ul>
        <li>{{ $t('new_exchange_page.If you want') }}</li>
        <li>{{ $t('new_exchange_page.If you want to try') }}</li>
    </ul>
    <p>{{ $t('new_exchange_page.Create an alternative currency') }}</p>
    <h6>{{ $t('new_exchange_page.What Komunitin has to offer') }}</h6>
    <p>{{ $t('new_exchange_page.If you are already determined') }}</p>
    <p>{{ $t('new_exchange_page.The Komunitin software and the') }}</p>
    <ul>
        <li>{{ $t('new_exchange_page.Komunitin is open source with GPLv2') }}</li>
        <li>{{ $t('new_exchange_page.Komunitin has been developed by activists') }}</li>
        <li>{{ $t('new_exchange_page.Komunitin was conceived as a modern') }}</li>
        <li>{{ $t('new_exchange_page.Komunitin is born with the will to create networks') }}</li>
    </ul>
    <p>{{ $t('new_exchange_page.Going into greater detail') }}</p>
    <ul>
        <li>{{ $t('new_exchange_page.Is always the salesman or saleswoman') }}</li>
        <li>{{ $t('new_exchange_page.The balance of accounts is public') }}</li>
        <li>{{ $t('new_exchange_page.The program integrates the banking') }}</li>
    </ul>
    <p>{{ $t('new_exchange_page.For more information on the operation of Komunitin') }}</p>
    <h6>{{ $t('new_exchange_page.Terms of Use') }}</h6>
    <p>{{ $t('new_exchange_page.Before you open submit your network') }}</p>
    <p>{{ $t('new_exchange_page.The terms of use include') }}</p>
    <h6>{{ $t('new_exchange_page.Go ahead') }}</h6>
    <p>{{ $t('new_exchange_page.To register a new network system') }}</p>
    <p>{{ $t('new_exchange_page.Follow this link to go to the form') }}</p>
      <q-btn
        color="primary"
        text-color="white"
        :label="$t('new_exchange_page.Create a new network')"
      />
    <br />
    <br />
    <p>
      {{ $t('new_exchange_page.Happy trading') }}<br/>
      {{ $t('new_exchange_page.Komunitin team') }}
    </p>

  </q-page>
</template>

<script>
export default {
  name: 'NewExchangePage'
}
</script>
