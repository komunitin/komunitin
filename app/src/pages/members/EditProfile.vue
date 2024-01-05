<template>
  <page-header 
    :title="$t('editProfile')" 
    balance 
    :back="`/groups/${code}/members/${memberCode}`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <div class="q-gutter-y-lg">
        <div>
          <div class="text-subtitle1">
            {{ $t('enterProfileData') }}
          </div>
          <div class="text-onsurface-m">
            {{ $t('editProfileHelpText') }}
          </div>
        </div>
        <avatar-field
          v-model="image"
          :text="myMember?.attributes.name ?? ''"
        />
      </div>
    </q-page>
  </page-container>
</template>
<script setup lang="ts">

import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import AvatarField from "../../components/AvatarField.vue"

import { useStore } from 'vuex';
import { computed, ref, watchEffect } from "vue";

const store = useStore()
const myMember = computed(() => store.getters["myMember"])
const code = computed(() => myMember.value?.group?.attributes?.code)
const memberCode = computed(() => myMember.value?.attributes?.code)

const image = ref<string|null>(null)
watchEffect( () => {
  image.value = myMember.value?.attributes?.image ?? null
})

</script>