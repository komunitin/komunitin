<template>
  <q-list>
    <q-item>
      <q-item-section avatar>
        <q-icon name="account_circle"/>
      </q-item-section>
      <q-item-section>
        <div class="text-h6">Name</div>
        <q-item-label caption>ABCD0123</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="expand_more"/>
      </q-item-section>
    </q-item>

    <q-separator />

    <menu-item icon="home" :title="$t('home')"/>
    <menu-item icon="account_balance_wallet" :title="$t('movements')"/>
    <menu-item icon="loyalty" :title="$t('myNeeds')"/>
    <menu-item icon="local_offer" :title="$t('myOffers')"/>

    <q-separator/>

    <!-- Group -->
    <q-item>
      <q-item-section avatar>
        <q-icon name="account_circle"/>
      </q-item-section>
      <q-item-section>
        <div class="text-h6">Group name</div>
        <q-item-label caption>ABCD</q-item-label>
      </q-item-section>
    </q-item>

    <menu-item icon="info" :title="$t('news')"/>
    <menu-item icon="loyalty" :title="$t('needs')"/>
    <menu-item icon="local_offer" :title="$t('offers')"/>
    <menu-item icon="people" :title="$t('accounts')"/>
    <menu-item icon="stats" :title="$t('stats')"/>

    <q-separator/>

    <menu-item icon="group_work" :title="$t('otherGroups')"/>
    <menu-item icon="settings" :title="$t('settings')"/>
    <menu-item icon="help" :title="$t('help')"/>
    <menu-item icon="info_outline" :title="$t('about')"/>
  <q-list>
</template>