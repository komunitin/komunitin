<template>
  <q-page-sticky
    position="bottom"
    :offset="[0, 24]"
  >
    <q-btn
      fab
      icon="add"
      color="primary"
      :label="$t('createTransaction')"
      :to="`/groups/${myMember.group.attributes.code}/members/${myMember.attributes.code}/transactions/new`"
    />
  </q-page-sticky>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const myMember = computed(() => store.getters.myMember)
</script>