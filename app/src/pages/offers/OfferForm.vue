<template>
  <q-form @submit="onSubmit">
    <div class="q-gutter-y-lg">
      <div>
        <div class="text-subtitle1">
          {{ $t('enterOfferData') }}
        </div>
        <div class="text-onsurface-m">
          {{ $t('offerFormHelpText') }}
        </div>
      </div>
      <image-field
        v-model="images"
        :label="$t('uploadImages')" 
        :hint="$t('uploadOfferImagesHint')"
      />
      <select-category
        v-model="category" 
        :code="code"
        :label="$t('category')"
        :hint="$t('offerCategoryHint')"
        required
      />
      <q-input
        v-model="title"
        type="text"
        name="title"
        :label="$t('title')"
        :hint="$t('offerTitleHint')"
        outlined
        required
        :rules="[() => !v$.title.$invalid || $t('offerTitleRequired')]"
      >
        <template #append>
          <q-icon name="lightbulb" />
        </template>
      </q-input>
      <q-input 
        v-model="description"
        type="textarea"
        name="description"  
        :label="$t('description')" 
        :hint="$t('offerDescriptionHint')" 
        outlined 
        autogrow 
        required
        input-style="min-height: 100px;"
        :rules="[() => !v$.description.$invalid || $t('offerDescriptionRequired')]"
      >
        <template #append>
          <q-icon name="notes" />
        </template>
      </q-input>
      <q-input
        v-model="price"
        type="text"
        name="price"
        :label="$t('price')"
        :hint="$t('offerPriceHint')"
        outlined
        :rules="[() => !v$.price.$invalid || $t('offerPriceRequired')]"
      >
        <template #append>
          <span class="text-h6 text-onsurface-m">{{ myAccount.currency.attributes.symbol }}</span>
        </template>
      </q-input>
      <date-field
        v-model="expiration"
        :label="$t('expirationDate')"
        :hint="$t('offerExpirationDateHint')"
      />
      <toggle-item 
        v-if="showState"
        v-model="state"
        :label="$t('published')"
        :hint="$t('offerPublishedHint')"
        true-value="published"
        false-value="hidden"
      />
      <q-btn
        :label="submitLabel ?? $t('preview')"
        type="submit"
        color="primary"
        unelevated
        class="full-width"
        :disabled="v$.$invalid"
      />
    </div>
  </q-form>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import DateField from "../../components/DateField.vue"
import ImageField from "../../components/ImageField.vue"
import SelectCategory from "../../components/SelectCategory.vue"
import ToggleItem from "../../components/ToggleItem.vue"
import { Category, Offer, OfferState } from "src/store/model"
import useVuelidate from "@vuelidate/core"
import { minLength, required } from "@vuelidate/validators"
import { DeepPartial } from "quasar"
import { useStore } from "vuex"

const props = defineProps<{
  code: string
  modelValue?: DeepPartial<Offer> & {category: Category}
  showState?: boolean
  submitLabel?: string
}>()
const emit = defineEmits<{
  (e: "submit", value: DeepPartial<Offer>): void
}>()

const images = ref<string[]>(props.modelValue?.attributes?.images || [])
const title = ref(props.modelValue?.attributes?.name || "")
const description = ref(props.modelValue?.attributes?.content || "")
const category = ref<Category|null>(props.modelValue?.category || null)
const price = ref(props.modelValue?.attributes?.price || "")

let date: Date
if (props.modelValue?.attributes?.expires) {
  date = new Date(props.modelValue?.attributes?.expires)
} else {
  // Set expiry date in one year by default
  date = new Date()
  date.setFullYear(date.getFullYear() + 1)
}
const expiration = ref(date)

const state = ref<OfferState>(props.modelValue?.attributes?.state || "published")

// Validation
const rules = {
  description: { required, minLength: minLength(10) },
  category: { required },
  expiration: { required },
  title: { required },
  price: { required }
}
const v$ = useVuelidate(rules, {images, description, category, expiration, title, price})
const store = useStore()

const myAccount = computed(() => store.getters.myAccount)

const onSubmit = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (isFormCorrect) {
    emit("submit", {
      ...props.modelValue,
      type: "offers",
      attributes: {
        ...props.modelValue?.attributes,
        name: title.value,
        content: description.value,
        expires: expiration.value.toISOString(),
        images: images.value,
        price: price.value,
        state: state.value
      },
      relationships: {
        ...props.modelValue?.relationships,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        category: { data: { type: "categories", id: category.value!.id } },
        member: { data: { type: "members", id: store.getters.myMember.id} }
      }
    })
  }
}

</script>