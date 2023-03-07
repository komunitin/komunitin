<template>
  <q-field
    ref="fieldRef"
    v-model="value"
    v-bind="$attrs"
    outlined
    class="cursor-pointer"
    @click="onClick"
  >
    <template #control>
      <member-header
        v-if="modelValue"
        :member="modelValue"
        clickable
      />
      <div
        v-else 
        tabindex="0" 
        @keydown.enter="onClick"
      />
    </template>
    <template #append>
      <q-icon name="arrow_drop_down" />
    </template>
  </q-field>
  <q-dialog 
    v-model="dialog" 
    :maximized="$q.screen.lt.sm"
    @hide="closeDialog()"
  >
    <q-card>
      <q-card-section class="q-px-none">
        <q-toolbar class="text-onsurface-m">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            @click="dialog = false"
          />
          <q-input
            v-model="searchText"
            dense
            outlined
            class="q-mx-md searchbar"
            type="search"
            debounce="250"
            autofocus
          >
            <template #append>
              <q-icon
                v-if="searchText === ''"
                name="search"
              />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="searchText = ''"
              />
            </template>
          </q-input>
        </q-toolbar>
      </q-card-section>
      <q-separator />
      <q-card-section class="members-list scroll">
        <resource-cards
          ref="memberItems"
          v-slot="slotProps"
          :code="code"
          module-name="members"
          include="contacts,account"
          :query="searchText"
        >
          <q-list
            v-if="slotProps.resources"
            padding
          >
            <member-header
              v-for="candidate of slotProps.resources"
              :key="candidate.id"
              :member="candidate"
              @click="select(candidate)"
            />
          </q-list>
        </resource-cards>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import MemberHeader from "./MemberHeader.vue"
import ResourceCards from "../pages/ResourceCards.vue"
import { Member } from 'src/store/model';
import { QField } from 'quasar';

export default defineComponent({
  components: {
    MemberHeader,
    ResourceCards
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Object,
      required: false,
      default: undefined
    },
    code: {
      type: String,
      required: true
    }
  },
  emits: ["update:modelValue", "close-dialog"],
  setup(props, {emit}) {
    const dialog = ref(false)

    const onClick = () => { 
      dialog.value = true
    }

    const value = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })
    const select = (selectedMember: Member) => {
      value.value = selectedMember
      dialog.value = false
    }
    
    const searchText = ref('')

    //https://github.com/quasarframework/quasar/issues/8956
    const fieldRef = ref<QField>();
    onMounted(() => { (fieldRef.value as QField).$el.onclick = () => (fieldRef.value as QField).$emit('click'); });
    const closeDialog = () => {
      // Set value so the validation refreshes cache.
      if (!value.value) {
        value.value = undefined;
      }
      emit("close-dialog");
    }
    return {
      onClick,
      dialog,
      searchText,
      select,
      fieldRef,
      value,
      closeDialog,
    }
  }
})
</script>
<style lang="scss" scoped>
@media (min-width: $breakpoint-sm-min) {
  .members-list {
    height: 75vh;
    width: 50vw;
  }
}
.searchbar {
  width: 100%;
}
</style>