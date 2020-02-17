  <template>
  <q-list>
    <q-item-label header>{{ $t('Menu') }}</q-item-label>
    <q-item clickable tag="a" href="/login">
      <q-item-section avatar>
        <q-icon name="account_circle" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('Login') }}</q-item-label>
        <q-item-label caption>{{ $t('Log in') }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable tag="a" target="_blank" href="https://github.com/komunitin/komunitin">
      <q-item-section avatar>
        <q-icon name="help" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('help') }}</q-item-label>
        <q-item-label caption>github.com/komunitin</q-item-label>
      </q-item-section>
    </q-item>

    <q-item clickable tag="a">
      <q-item-section avatar>
        <q-icon name="help" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('New exchange') }}</q-item-label>
        <q-item-label caption>{{ $t('create a new exchange') }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MenuPanel'
});
</script>