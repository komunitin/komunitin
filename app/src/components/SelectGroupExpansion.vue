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
          include="currency"
          :cache="1000*60*5"
        >
          <q-list
            v-if="slotProps.resources"
          >
            <template v-for="option in slotProps.resources">
              <group-header
                v-if="showGroup(option)"
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
export default defineComponent({
  inheritAttrs: false,
})
</script>
<script setup lang="ts">
import { Currency, Group } from "src/store/model";
import ResourceCards from "../pages/ResourceCards.vue";
import GroupHeader from "./GroupHeader.vue";
import { computed, ref, ComputedRef } from "vue";

const props = defineProps<{
  modelValue?: Group,
  payer?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: Group): void
}>()

const dialog = ref(false)

const onClick = () => {
  dialog.value = !dialog.value
}

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

const showGroups : Record<string, ComputedRef<boolean>> = {}

const showGroup = (group: Group & {currency: Currency}) => {
  if (!(group.id in showGroups)) {
    showGroups[group.id] = computed(() => {
      // Always show selected group
      if (group.id === props.modelValue?.id || group.id === myGroup.value.id) {
        return true
      }
      const currency = store.getters["currency/one"](group.relationships.currency.data.id)
      // Only show groups that allow external payments / requests.
      if (props.payer) {
        return currency?.attributes.settings.enableExternalPaymentRequests ?? false
      } else {
        return currency?.attributes.settings.enableExternalPayments ?? false
      }
    })
  }
  return showGroups[group.id]
}

</script>
<style lang="scss" scoped>
#select-group-header {
  height: $header-height;
}
</style>