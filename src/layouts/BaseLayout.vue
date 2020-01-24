<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="$router.currentRoute.path == '/'"
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="menu"
          aria-label="Menu"
        />

        <q-btn
          v-else
          flat
          dense
          round
          icon="arrow_back"
          aria-label="Home"
          @click="$router.back()"
        />


        <q-toolbar-title>
          Komunitin
        </q-toolbar-title>

        <div>

          <q-select
            flat
            dense
            round
            outlined
            v-model='locale'
            @input="setLocale"
            emit-value
            map-options
            :options="langs"
          />

          <q-btn
            flat
            dense
            round
            @click="leftDrawerOpen = !leftDrawerOpen"
            icon="share"
            aria-label="Share"
          />
          <q-btn
            flat
            dense
            round
            @click="leftDrawerOpen = !leftDrawerOpen"
            icon="account_circle"
            aria-label="Account"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>{{ $t('Menu') }}</q-item-label>
        <q-item
          clickable
          tag="a"
          href="/login"
        >
          <q-item-section avatar>
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('Login') }}</q-item-label>
            <q-item-label caption>{{ $t('Log in') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          tag="a"
          target="_blank"
          href="https://github.com/komunitin/komunitin"
        >
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('help') }}</q-item-label>
            <q-item-label caption>github.com/komunitin</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          tag="a"
          href="/new-exchange"
        >
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('new_exchange') }}</q-item-label>
            <q-item-label caption>{{ $t('create a new exchange') }}</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'BaseLayout',

  data () {
    return {
      leftDrawerOpen: false,
      // locale: this.$q.lang.isoName,
      locale: this.$i18n.locale,
      langs: [
        {
          label: 'Es',
          value: 'es'
        },
        {
          label: 'Ca',
          value: 'ca'
        },
        {
          label: 'En',
          value: 'en-us'
        }
      ]
    }
  },
  methods: {
    setLocale (locale) {
      // cambiamos Vue-i18n locale 
      this.$i18n.locale = locale
      localStorage.setItem('lang', locale)

      // @todo Cargar el pack de idioma de Quasar de forma dinámica
      import(`quasar/lang/${locale}`).then(({ default: messages }) => {
        this.$q.lang.set(messages)
      })
      console.log(this.$router.currentRoute.path)

    }
  }


}
</script>
