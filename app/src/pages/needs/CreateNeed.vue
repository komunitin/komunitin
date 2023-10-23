<template>
  <page-header 
    :title="$t('createNeed')" 
    balance 
    :back="`/groups/${code}/needs`"
  />
  <page-container class="row justify-center">
    <q-page 
      padding 
      class="q-py-lg col-12 col-sm-8 col-md-6"
    >
      <q-form @submit="onSubmit">
        <div class="q-gutter-y-lg">
          <div>
            <div class="text-subtitle1">
              {{ $t('enterNeedData') }}
            </div>
            <div class="text-onsurface-m">
              {{ $t('needFormHelpText') }}
            </div>
          </div>
          <image-field
            v-model="images"
            :label="$t('uploadImages')" 
            :hint="$t('uploadNeedImagesHint')"
          />
          <q-input 
            v-model="description"
            type="textarea"
            name="description"  
            :label="$t('description')" 
            :hint="$t('needDescriptionHint')" 
            outlined 
            autogrow 
            required
            input-style="min-height: 100px;"
            :rules="[() => !v$.description.$invalid || $t('needDescriptionRequired')]"
          >
            <template #append>
              <q-icon name="notes" />
            </template>
          </q-input>
          <select-category
            v-model="category" 
            :code="code"
            :label="$t('category')"
            :hint="$t('needCategoryHint')"
            required
          />
          <date-field
            v-model="expiration"
            :label="$t('expirationDate')"
            :hint="$t('needExpirationDateHint')"
          />
          <q-btn
            :label="$t('preview')"
            type="submit"
            color="primary"
            unelevated
            class="full-width"
            :disabled="v$.$invalid"
          />
        </div>
      </q-form>
    </q-page>
  </page-container>
</template>
<script setup lang="ts">
import PageHeader from "../../layouts/PageHeader.vue"
import PageContainer from "../../layouts/PageContainer.vue"
import ImageField from "../../components/ImageField.vue"
import SelectCategory from "../../components/SelectCategory.vue"
import DateField from "../../components/DateField.vue"
import { computed, ref } from "vue"
import useVuelidate from "@vuelidate/core"
import { minLength, required } from "@vuelidate/validators"
import { Category, Need } from "src/store/model"
import { DeepPartial } from "quasar"
import { useStore } from "vuex"
import { useRouter } from "vue-router"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  code: string
}>()

const images = ref([])
const description = ref("")
const category = ref<Category|null>(null)

// Set expiry date in one week by default
const date = new Date()
date.setDate(date.getDate() + 7)
const expiration = ref(date)

const rules = {
  description: { required, minLength: minLength(10) },
  category: { required },
  expiration: { required }
}
const v$ = useVuelidate(rules, {images, description, category, expiration})
const store = useStore()
const myMember = computed(() => store.getters.myMember)
const router = useRouter()

const onSubmit = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) {
    return
  }

  // Post hidden need object.
  const resource : DeepPartial<Need> = {
    type: "needs",
    attributes: {
      content: description.value,
      expires: expiration.value.toISOString(),
      access: "group",
      images: images.value,
      state: "hidden"
    },
    relationships: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      category: { data: { type: "categories", id: category.value!.id } },
      member: { data: { type: "members", id: myMember.value.id}}
    }
  }
  
  await store.dispatch("needs/create", {
    group: props.code,
    resource
  })

  const need = store.getters["needs/current"]
  // Go to needs page.
  router.push({
    name: "PreviewNeed",
    params: {
      code: props.code,
      needCode: need.attributes.code
    }
  })
}
</script>