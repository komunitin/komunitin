<template>
  <page-header 
    :title="title" 
    balance 
    :back="`/groups/${code}/members/${myMemberCode}/transactions`"
  />
  <q-page-container>
    <q-page>
      <q-tabs
        class="bg-active text-onsurface-m"
        active-class="text-primary"
        align="justify"
      >
        <q-route-tab
          :to="`/groups/${code}/members/${myMemberCode}/transactions/${direction}`"
          :label="$t('enterData')"
          icon="edit"
        />
        <q-route-tab
          :to="`/groups/${code}/members/${myMemberCode}/transactions/${direction}/qr`"
          :label="$t('qrCode')"
          icon="qr_code"
        />
        <q-route-tab
          :to="`/groups/${code}/members/${myMemberCode}/transactions/${direction}/multiple`"
          :label="$t('multiple')"
          icon="list"
        />
      </q-tabs>
      <router-view />
    </q-page>
  </q-page-container>
</template>
<script setup lang="ts">
import PageHeader from 'src/layouts/PageHeader.vue';
import { Member } from 'src/store/model';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

const props = defineProps<{
  /**
   * Group code
   */
  code: string,
  /**
   * Whether the payer is configurable. 
   * If false, the payer needs to be provided or defauls to the current member.
   */
  direction: "send" | "receive" | "transfer"
}>()

const title = computed(() => {
  if (props.direction === "send") {
    return t("sendPayment")
  } else if (props.direction === "receive") {
    return t("receivePayment")
  } else {
    return t("createTransaction")
  }
})

const { t } = useI18n()

const store = useStore()
const myMember = computed<Member>(() => store.getters.myMember)
const myMemberCode = computed<string>(() => myMember.value.attributes.code)

</script>