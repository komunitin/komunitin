<template>
  <q-card flat bordered>
    <q-card-section>
      <!-- payer -->
      <div class="text-overline text-uppercase text-onsurface-d q-pl-md">
        {{ $t("payer") }}
      </div>
      <member-header
        :member="transfer.payer.member"
        :to="`/groups/${code}/members/${transfer.payer.member.attributes.code}`"
      />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <!-- payee -->
      <div class="text-overline text-uppercase text-onsurface-d q-pl-md">
        {{ $t("payee") }}
      </div>
      <member-header
        :member="transfer.payee.member"
        :to="`/groups/${code}/members/${transfer.payee.member.attributes.code}`"
      />
    </q-card-section>
    <q-separator />
    <q-card-section class="text-center">
      <!-- main section -->
      <div
        class="text-h4"
        :class="positive ? 'positive-amount' : 'negative-amount'"
      >
        {{ FormatCurrency((positive ? 1 : -1) * transfer.attributes.amount, transfer.currency) }}
      </div>
      <div class="text-subtitle1 text-onsurface-d">
        {{ $formatDate(transfer.attributes.updated) }}
      </div>
      <div class="text-body1">
        {{ transfer.attributes.meta }}
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section class="text-body2">
      <!-- details -->
      <div><span class="text-onsurface-d">{{ $t("state") }}</span><span class="q-pl-sm">{{ state }}</span></div>
      <div><span class="text-onsurface-d">{{ $t("group") }}</span><span class="q-pl-sm">{{ transfer.currency.group.attributes.name }}</span></div>
    </q-card-section>
    <slot />
  </q-card>
</template>
<script lang="ts">
import KError, { KErrorCode } from "src/KError";
import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import MemberHeader from "./MemberHeader.vue"
import FormatCurrency from "../plugins/FormatCurrency"
export default defineComponent({
  components: {
    MemberHeader
  },
  props: {
    transfer: {
      type: Object,
      required: true,
    }
  },
  setup(props) {
    // Store
    const store = useStore()
    const myAccount = store.getters.myAccount

    // Note that when the current account is neither the payer nor the payee,
    // the amount is considered as positive.
    const positive = computed(() => {
      return props.transfer.payer.id != myAccount.id;
    });

    const { t } = useI18n()

    const state = computed(() => {
      const state = props.transfer.attributes.state
      switch(state) {
        case "new":
          return t("new").toString();
        case "pending":
          return t("pending").toString();
        case "accepted":
          return t("accepted").toString();
        case "committed":
          return t("committed").toString();
        case "rejected":
          return t("rejected").toString();
        case "deleted":
          return t("deleted").toString();
      }
      throw new KError(KErrorCode.InvalidTransferState);
    })

    // We are using this code to build the member links. Not really sure if this 
    // is reliable. Otherways we could load the group from the member and get the code.
    const code = computed(() => props.transfer.currency.group.attributes.code)

    return {FormatCurrency, positive, state, code}
  }
})
</script>