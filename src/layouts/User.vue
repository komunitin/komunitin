<template>
    <q-layout view="lhh Lpr lff">
        <q-drawer show-if-above v-model="left" side="left" bordered>
            <menu-drawer/>
        </q-drawer>
        <router-view/>
    </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import menuDrawer from '../components/MenuDrawer.vue';
/**
 * Main layout with left drawer, toolbar and main content.
 */
export default Vue.extend({
  name: 'User'
});
</script>