<template>
  <page-header
    :title="$t('signup')"
  />
  <q-page-container class="row justify-center">
    <q-page 
      id="page-signup"
      padding 
      class="q-py-lg q-px-md col-12 col-sm-8 col-md-6 q-mb-xl"
    >
      <div v-if="page=='profile'">
        <q-form 
          v-if="myMember && myMember.contacts && myUser"
          @submit="saveMember"
        >
          <profile-form 
            :change-credentials="false"
            :member="myMember"
            :contacts="myMember.contacts"
            :user="myUser"
            @update:member="updateMember"
            @update:contacts="updateContacts"
          />
          <q-btn
            class="full-width q-my-lg"
            color="primary"
            type="submit"
            :label="$t('saveProfile')"
            unelevated
            :loading="loadingSaveMember"     
          />
        </q-form>
      </div>
      <div v-else-if="page=='offer'">
        <offer-form 
          :code="code"
          :show-state="false"
          :model-value="offer"
          :submit-label="$t('submit')"
          :loading="loadingSaveOffer"
          @submit="createOffer"
        />
      </div>
      <div v-else-if="page=='complete'">
        <div class="text-h6">
          {{ $t('signupComplete') }}
        </div>
        <div>
          <div class="float-left q-mr-md">
            <q-icon 
              name="verified_user" 
              size="100px" 
              color="icon-dark"
            />
          </div>
          <div class="text-body1 text-onsurface-m q-my-md">
            {{ $t('signupCompleteText', {
              group: group.attributes.name
            }) }}
          </div>
          <div class="text-body1 text-onsurface-m q-my-md">
            {{ $t('signupCompleteText2') }}
          </div>
          <div>
            <q-btn
              class="full-width q-my-lg"
              color="primary"
              :label="$t('goToMyAccount')"
              flat
              to="/"
            />
          </div>
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>
<script setup lang="ts">
import PageHeader from "../../layouts/PageHeader.vue"
import ProfileForm from "./ProfileForm.vue"
import OfferForm from "../offers/OfferForm.vue"
import { computed, ref } from "vue"
import { useStore } from "vuex"
import { Contact, Member, Offer } from "src/store/model"
import { DeepPartial } from "quasar"
import { scroll } from "quasar";
const { getScrollTarget } = scroll

const props = defineProps<{
  code: string
}>()

const store = useStore()
// Loaded member & user objects
const myMember = computed(() => store.getters.myMember)
const myUser = computed(() => store.getters.myUser)

// Fetch group
store.dispatch("groups/load", {
  id: props.code,
  include: "settings"
})
// Load member
const member = ref(myMember.value)
store.dispatch("members/load", {
  id: myMember.value.id,
  group: props.code,
  include: "contacts"
}).then(() => {
  member.value = myMember.value
  updateContacts(myMember.value.contacts)
})

const group = computed(() => store.getters["groups/current"])
const settings = computed(() => group.value?.settings?.attributes)

const loadingSaveMember = ref(false)

const updateMember = (resource: DeepPartial<Member>) => {
  member.value = {
    ...(member.value),
    attributes: resource.attributes
  }
}
const updateContacts = (contacts: DeepPartial<Contact>[]) => {
  member.value = {
    ...(member.value),
    contacts,
    relationships: {
      contacts: {
        data: contacts.map(c => ({ type: "contacts", id: c.id }))
      }
    }
  }
}
const saveMember = async () => {
  loadingSaveMember.value = true
  try {
    await store.dispatch("members/update", {
      id: member.value.id,
      group: props.code,
      resource: {
        id: member.value.id,
        type: "members",
        attributes: member.value.attributes,
        relationships: member.value.relationships
      },
      included: member.value.contacts
    })
    nextPage()
  } finally {
    loadingSaveMember.value = false
  }
}

const offer = ref()
const loadingSaveOffer = ref(false)
const createOffer = async (resource: DeepPartial<Offer>) => {
  loadingSaveOffer.value = true
  try {
    await store.dispatch("offers/create", {
      group: props.code,
      resource
    })
    nextPage()
  } finally {
    loadingSaveOffer.value = false
  }
}

const nextPage = () => {
  if (page.value === "profile" && settings.value?.minOffers > 0) {
    page.value = "offer"
  } else {
    page.value = "complete"
  }
  const el = document.getElementById("page-signup") as Element
  getScrollTarget(el).scrollTo(0, 0)
}

const page = ref("profile")
</script>