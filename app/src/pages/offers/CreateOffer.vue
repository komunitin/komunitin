<template>
  <page-header 
    :title="$t('createOffer')" 
    balance 
    :back="`/groups/${code}/offers`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <offer-form 
        :code="code"
        :show-state="false"
        :model-value="offer"
        @submit="onSubmit"
      />
    </q-page>
  </page-container>
</template>
<script setup lang="ts">
import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import OfferForm from "./OfferForm.vue"
import { Category, Offer } from "src/store/model"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { DeepPartial } from "quasar"
import { ref } from "vue"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  code: string
}>()

const store = useStore()
const router = useRouter()

const offer = ref<Offer & {category: Category} | undefined>(undefined)

// Load initial values from current resource only if we are comming 
// from the preview page.
const forwardUrl = router.options.history.state.forward
if (typeof forwardUrl === "string" && forwardUrl.endsWith("/preview")) {
  offer.value = store.getters["offers/current"] 
}

const onSubmit = async (resource: DeepPartial<Offer>) => {
  if (resource.id === undefined) {
    await store.dispatch("offers/create", {
      group: props.code,
      resource
    })
  } else {
    await store.dispatch("offers/update", {
      group: props.code,
      code: resource.attributes?.code,
      resource
    })
  }

  const offer = store.getters["offers/current"]

  // Go to preview page.
  router.push({
    name: "PreviewOffer",
    params: {
      code: props.code,
      offerCode: offer.attributes.code
    }
  })
}
</script>