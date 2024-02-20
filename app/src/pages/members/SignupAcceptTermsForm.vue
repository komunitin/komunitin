<template>
  <q-form >
    <group-header :group="group" class="q-pl-none"/>
    <div class="text-h6 q-my-md">
      {{ $t('membershipTerms') }}
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="col text-body1 text-onsurface"
      v-html="md2html(terms)"
    />
    <!-- eslint-enable vue/no-v-html -->
    <q-btn
      :label="$t('acceptTerms')"
      type="submit"
      color="primary"
      padding="xs lg"
      unelevated
      @click="emit('accept')"
    />
  </q-form>
</template>
<script setup lang="ts">
import { Group } from 'src/store/model';
import md2html from 'src/plugins/Md2html';
import GroupHeader from 'src/components/GroupHeader.vue'

const props = defineProps<{
  group: Group
  terms: string
}>()

const emit = defineEmits<{
  (e: 'accept'): void
}>()

</script>