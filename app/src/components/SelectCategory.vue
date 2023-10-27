<template>
  <q-select
    v-model="category"
    outlined
    :options="options"
    :label="label ?? $t('category')"
    :hint="hint"
  />
</template>
<script setup lang="ts">
import { Category } from "src/store/model";
import { computed, watch } from "vue"
import { useStore } from "vuex";

const props = defineProps<{
  code: string,
  modelValue: Category | null
  label?: string,
  hint?: string
}>()
const emit = defineEmits<{
  (e: "update:modelValue", value: Category | null): void
}>()

const category = computed({
  get: () => props.modelValue ? {label: props.modelValue.attributes.name, value: props.modelValue.id} : null,
  set: (option: {label: string, value: string} | null) => emit("update:modelValue", option ? categories.value.find((c: Category) => c.id == option.value) : null)
})
const store = useStore()

watch([props], () => {
  if (props.code) {
    store.dispatch("groups/load", {
      code: props.code,
      include: "contacts,categories"
    })
  }
}, { immediate: true })

const categories = computed(() => store.getters["groups/current"]?.categories)
const options = computed(() => categories.value?.map((c: Category) => ({label: c.attributes.name, value: c.id})))

</script>