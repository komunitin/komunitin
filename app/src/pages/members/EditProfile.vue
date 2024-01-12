<template>
  <page-header 
    :title="$t('editProfile')" 
    balance 
    :back="`/groups/${code}/members/${memberCode}`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6 q-mb-xl"
    >
      <profile-form 
        v-if="member" 
        :member="member"
        :contacts="member.contacts"
        :user="user"
        @update:member="saveMember"
        @update:contacts="saveContacts"
      />
    </q-page>
  </page-container>
</template>
<script setup lang="ts">
import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import ProfileForm from "./ProfileForm.vue"

import { useStore } from "vuex"
import { computed, ref } from "vue"
import { DeepPartial } from "quasar"

import { Contact, Member } from "../../store/model"

const store = useStore()

const myMember = computed(() => store.getters.myMember)
const code = computed(() => myMember.value.group.attributes.code)
const memberCode = computed(() => myMember.value.attributes.code)

const member = ref()
const user = ref()

const loadMember = async () => {
  await store.dispatch("members/load", {
    code: myMember.value.id,
    group: code.value,
    include: "contacts,group"
  })
  user.value = store.getters.myUser
  member.value = myMember.value
}

const saveMember = async (resource: DeepPartial<Member>) => {
  await store.dispatch("members/update", {
    code: myMember.value.id,
    group: code.value,
    resource : {
      attributes: resource.attributes
    }
  })
}

const saveContacts = async (resources: DeepPartial<Contact>[]) => {
  await store.dispatch("members/update", {
    code: myMember.value.id,
    group: code.value,
    resource: {
      relationships: {
        contacts: {
          data: resources.map(r => ({id: r.id, type: "contacts"}))
        }
      }
    },
    included: resources
  })
}

loadMember()
// TODO: Update email and password.

</script>