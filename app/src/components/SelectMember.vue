<template>
  <q-field outlined :label="label" :hint="hint" class="cursor-pointer" @click="onClick" ref="fieldRef">
    <template v-slot:control>
      <member-header v-if="member" :member="member"/>
    </template>
    <template v-slot:append>
      <q-icon name="arrow_drop_down"/>
    </template>
  </q-field>
  <q-dialog v-model="dialog">
    <q-card>
      <q-toolbar class="text-onsurface-m">
        <q-btn flat round dense icon="back" />
        <q-input
          v-model="searchText"
          dense
          outlined
          class="q-mr-xs full-width q-mx-md"
          type="search"
          debounce="250"
          autofocus
        >
          <template #append>
            <q-icon v-if="searchText === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="searchText = ''"/>
          </template>
        </q-input>
        <q-card-section>
          <resource-cards
            ref="memberItems"
            v-slot="slotProps"
            :code="code"
            module-name="members"
            include="contacts,account"
          >
            <q-list v-if="slotProps.resources" padding>
              <member-header v-for="member of slotProps.resources" :key="member.id" :member="member" @click="select(member)"/>
            </q-list>
          </resource-cards>
        </q-card-section>
      </q-toolbar>
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
  props: {
    label: {
      type: String,
      required: true
    },
    hint: {
      type: String,
      default: ''
    },
    code: {
      type: String,
      required: true
    }
  },
  inheritAttrs: false,
  setup(props, { emit }) {
    const member = ref<Member>()

    const dialog = ref(false)

    const onClick = () => { 
      dialog.value = true
      console.log("Click!")
    }
    const select = (selectedMember: Member) => {
      member.value = selectedMember;
    }
    
    const searchText = ref('')

    //https://github.com/quasarframework/quasar/issues/8956
    const fieldRef = ref<QField>();
    onMounted(() => { (fieldRef.value as QField).$el.onclick = () => (fieldRef.value as QField).$emit('click'); });
    
    return {
      member,
      onClick,
      dialog,
      searchText,
      select,
      fieldRef
    }
  }
})
</script>