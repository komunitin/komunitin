 <template>
  <q-toolbar>
    <slot name="header">
      <q-btn
        v-if="$router.currentRoute.path == '/'"
        flat
        dense
        round
        @click="leftDrawerOpen = !leftDrawerOpen"
        icon="menu"
        aria-label="Menu"
      />

      <q-btn v-else flat dense round icon="arrow_back" aria-label="Home" @click="$router.back()" />

      <q-toolbar-title>Komunitin</q-toolbar-title>

      <div>
        <q-select
          flat
          dense
          round
          outlined
          v-model="locale"
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
    </slot>
  </q-toolbar>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Header',
  data() {
    return {
      leftDrawerOpen: false,
      // locale: this.$q.lang.isoName,
      // locale: this.$q.lang.isoName,
      locale: this.$i18n.locale,
      // Idiomas disponibles.
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
    };
  },
  methods: {
    // Define idioma seleccionado por el usuario y lo
    // guardamos en el LocalStorage.
    // @args locale: Idioma seleccionado.
    setLocale(locale: string) {
      // cambiamos Vue-i18n locale
      this.$i18n.locale = locale;
      localStorage.setItem('lang', locale);

      // Cargar el pack de idioma de Quasar de forma dinámica
      import(`quasar/lang/${locale}`).then(({ default: messages }) => {
        this.$q.lang.set(messages);
      });
      console.log(this.$router.currentRoute.path);
    }
  }
});
</script>