      <template>
  <q-card v-if="waysContact.length">
    <q-item v-for="(contactGroup) in waysContact" :key="contactGroup.data.id ">
      <q-item-section avatar>
        <q-avatar>
          <q-icon :name="typeBringIcon(contactGroup.data.attributes.type)" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label v-if="contactGroup.data.attributes.type === 'phone'">
          <a
            :href="`tel:${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else-if="contactGroup.data.attributes.type === 'email'">
          <a
            :href="`mailto:${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else-if="contactGroup.data.attributes.type === 'telegram'">
          <a
            :href="`tg://user?id=${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else-if="contactGroup.data.attributes.type === 'whatsapp'">
          <a
            :href="`https://api.whatsapp.com/send?phone=${contactGroup.data.attributes.name}`"
          >{{contactGroup.data.attributes.name}}</a>
        </q-item-label>
        <q-item-label v-else>{{contactGroup.data.attributes.name}}</q-item-label>
        <q-item-label caption>{{ contactGroup.data.attributes.type }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'contact-card',
  props: ['waysContact'],
  methods: {
    typeBringIcon(typeContact: string): string {
      const icons = {
        email: 'mail' as string,
        whatsapp: 'whatsapp' as string,
        telegram: 'telegram' as string,
        phone: 'call' as string
      };
      // @ts-ignore
      return icons[typeContact];
    }
  }
});
</script>