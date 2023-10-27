<template>
  <page-header 
    :title="$t('createNeed')" 
    balance 
    :back="`/groups/${code}/needs`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <need-form 
        :code="code"
        @submit="onSubmit"
      />
    </q-page>
  </page-container>
</template>
<script setup lang="ts">
import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import NeedForm from "./NeedForm.vue"
import { Need } from "src/store/model"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { DeepPartial } from "quasar"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  code: string
}>()

const store = useStore()
const router = useRouter()

const onSubmit = async (resource: DeepPartial<Need>) => {

  await store.dispatch("needs/create", {
    group: props.code,
    resource
  })

  const need = store.getters["needs/current"]
  // Go to needs page.
  router.push({
    name: "PreviewNeed",
    params: {
      code: props.code,
      needCode: need.attributes.code
    }
  })
}
</script>