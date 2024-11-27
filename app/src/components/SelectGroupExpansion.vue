<template>
  <group-header
    v-if="modelValue"  
    id="select-group-header"
    class="bg-light"
    :group="modelValue"
    clickable
    @click="onClick"
  >
    <template #side>
      <q-icon name="expand_more" />
    </template>
  </group-header>
  <div style="overflow: hidden;">
    <transition
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeOutUp"
      :duration="150"
    >
      <div 
        v-show="dialog" 
        class="q-py-sm"
      >
        <resource-cards
          v-slot="slotProps"
          code=""
          module-name="groups"
          :cache="1000*60*5"
        >
          <q-list
            v-if="slotProps.resources"
            @vue:mounted="checkShowGroups(slotProps.resources)"
          >
            <template v-for="option in slotProps.resources">
              <group-header
                v-if="showGroup(option.id)"
                :key="option.id"
                :group="option"
                clickable
                @click="select(option)"
              />
            </template>
          </q-list>    
        </resource-cards>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { handleError } from "src/boot/errors";
import KError from "src/KError";
export default defineComponent({
  inheritAttrs: false,
})
</script>
<script setup lang="ts">
import { Currency, CurrencySettings, Group } from "src/store/model";
import ResourceCards from "../pages/ResourceCards.vue";
import GroupHeader from "./GroupHeader.vue";
import { computed, ref, Ref } from "vue";

const props = defineProps<{
  modelValue: Group,
  payer?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Group): void
}>()

const dialog = ref(false)



const group = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const store = useStore()

const select = (value: Group) => {
  group.value = value
  dialog.value = false
}

const myGroup = computed<Group>(() => store.getters.myMember.group)

const showGroups : Record<string, Ref<boolean>> = {}

const showGroup = (id: string) => showGroups[id]?.value ?? false

const onClick = () => {
  dialog.value = !dialog.value
}

const checkShowGroup = (group: Group) => {
  if (!(group.id in showGroups)) {
    // Always show selected group and own group. Otherwise check the currency settings to 
    // see if they allow external payments.
    const isSelected = group.id === props.modelValue?.id || group.id === myGroup.value.id
    showGroups[group.id] = ref(isSelected)
    if (!isSelected) {
      // Load currency and settings. We don't do it using the include prop
      // of resource-cards because we need to check also the related settings 
      // object and it is not possible to fetch related of external related objects.
      const checkSetting = async () => {
        const url = (group.relationships.currency.data.meta && group.relationships.currency.data.meta.external) 
          ? group.relationships.currency.data.meta.href
          : group.relationships.currency.links.related
        
        await store.dispatch("currencies/load", {
          url,
          include: "settings"
        })
        
        const settings = (group as Group & {currency: Currency & {settings: CurrencySettings}}).currency.settings
        showGroups[group.id].value = props.payer
          ? settings.attributes.enableExternalPaymentRequests
          : settings.attributes.enableExternalPayments
      }
      checkSetting().catch((e) => {
        // Avoid unhandled promise rejection.
        handleError(KError.getKError(e))
      })
    }
  }
  return showGroups[group.id]
}

const checkShowGroups = (groups: Group[]) => {
  groups.forEach(group => checkShowGroup(group))
}

</script>
<style lang="scss" scoped>
#select-group-header {
  height: $header-height;
}
</style>