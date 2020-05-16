<template>
  <div class="bg-outside column">
    <div id="container" class="q-mx-auto bg-surface">
      <q-layout id="layout" view="lhr lpr lfr">
        <slot name="toolbar">
          <q-toolbar class="bg-primary text-onprimary">
            <!-- render either back button or menu button -->
            <q-btn
              v-if="back"
              id="back"
              flat
              round
              icon="arrow_back"
              :aria-label="$t('back')"
              @click="$router.back()"
            />
            <q-btn v-else flat round icon="menu" />

            <q-toolbar-title>
              {{ title }}
            </q-toolbar-title>

            <!-- slot for right buttons -->
            <slot name="buttons"></slot>
          </q-toolbar>
        </slot>
        <q-page-container>
          <slot />
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Main app layout.
 * 
 * Pages should use this component as its top-level wrapper:
 * ```
 * <layout>
 *   <!-- Page content -->
 * </layout>
 * ```
 * Pages may overwrite the default toolbar by:
 * ```
 * <layout>
 *   <template v-slot:toolbar>
 *     <!-- Define here your custom toolbar --> 
 *   </template>
 * </layout>
 * ```
 * Or just the right toolbar buttons:
 * ```
 * <layout>
 *   <template v-slot:buttons>
 *     <!-- Define here your custom right toolbar buttons --> 
 *   </template>
 * </layout>
 * ```
 */
export default Vue.extend({
  name: 'Layout',
  props: {
    title: {
      type: String,
      default: ""
    },
    back: {
      type: Boolean,
      default: false
    }
  }
});
</script>
<style lang="scss" scope>

#container {
  width: 100%;
}
// With large screens, wrap the content in a centered box.
@media (min-width: $breakpoint-md-min) {
  #container {
    margin-top: 48px;
    width: 1024px;
  }
}

</style>
