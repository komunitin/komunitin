<template>
  <page-header 
    :title="$t('editOffer')" 
    balance 
    :back="`/groups/${code}/offers/${offerCode}`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <offer-form 
        v-if="offer"
        :code="code"
        :model-value="offer"
        show-state
        :submit-label="$t('save')"
        @submit="onSubmit"
      />
    </q-page>
  </page-container>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import OfferForm from "./OfferForm.vue"
import { useStore } from 'vuex';
import { Offer, Category } from '../../store/model';
import { DeepPartial } from 'quasar';
import { useRouter } from 'vue-router';

const props = defineProps<{
  code: string
  offerCode: string
}>()
const store = useStore()
const offer = ref<Offer & {category: Category} | null>(null)

const fetchData = async () => {
  await store.dispatch("offers/load", {
    group: props.code,
    code: props.offerCode,
    include: "category"
  })
  offer.value = store.getters["offers/current"]
}

fetchData()
const router = useRouter()

const onSubmit = async (resource: DeepPartial<Offer>) => {
  await store.dispatch("offers/update", {
    group: props.code,
    code: resource.attributes?.code,
    resource
  })
  const offer = store.getters["offers/current"]
  // Go to offer page.
  router.push({
    name: "Offer",
    params: {
      code: props.code,
      offerCode: offer.attributes.code
    }
  })
}
</script>