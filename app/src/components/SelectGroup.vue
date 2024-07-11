<template>
  <group-header
    v-if="modelValue"  
    id="select-group-header"
    class="bg-active"
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
        >
          <q-list
            v-if="slotProps.resources"
          >
            <group-header
              v-for="option in slotProps.resources"
              :key="option.id"
              :group="option"
              clickable
              @click="select(option)"
            />
          </q-list>    
        </resource-cards>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  inheritAttrs: false,
})
</script>
<script setup lang="ts">
import { Group } from "src/store/model";
import ResourceCards from "../pages/ResourceCards.vue";
import GroupHeader from "./GroupHeader.vue";
import { defineProps, defineEmits, computed, ref } from "vue";

const props = defineProps<{
  modelValue?: Group
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

const select = (value: Group) => {
  group.value = value
  dialog.value = false
}

</script>
<style lang="scss" scoped>
#select-group-header {
  height: $header-height;
}
</style>