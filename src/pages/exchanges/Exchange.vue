<template>
  <div class="row">
    <q-card class="my-card">
      <q-card-section>
        <q-img :src="exchange['attributes']['image']" style="max-width: 400px; height: 200px;">
          <div
            class="absolute-bottom text-subtitle1 text-center"
          >{{ exchange['attributes']['name'] }}</div>
        </q-img>
        <h6>{{ exchange['attributes']['code'] }}</h6>
        <div>{{ exchange['attributes']['description']}}</div>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section>
        <p>
          Accounts:
          <b>{{ exchange['relatinships']['members']['meta']['count'] }}</b>
        </p>
        <p>
          Location:
          <b>{{ exchange['attributes']['localtion']}}</b>
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

export default Vue.extend({
  name: 'ExchangePage',
  data() {
    return {
      // name: '',
      // code: '',
      // image: '',
      // description: '',
      // accountCount: '',
      // localtion: [],
      // link: '',
      // offersCount: 0 as number,
      // wantsCount: 0 as number,
      // offersCategiries: [],
      // wantsCategories: []
    };
  },
  props: {
    id: String
  },
  created: function() {
    if (process.env.DEV) {
      console.log("I'm on a development build");
    }
    this.getExchange(this.id);
  },
  // created: function() {
  //   this.name = exchange['attributes']['name']
  //   this.code = exchange['attributes']['code']
  //   this.image = exchange['attributes']['imgage']
  //   this.description = exchange['attributes']['description']
  //   this.accountCount = exchange['relatinships']['members']['meta']['count']
  //   this.localtion = exchange['attributes']['location']
  //   this.link = ''
  //   this.offersCount = 0
  //   this.wantsCount = 0
  //   this.offersCategiries = []
  //   this.wantsCategories = [];
  // },
  computed: {
    ...mapState('exchanges', ['exchange'])
  },
  methods: {
    ...mapActions('exchanges', ['getExchange'])
  }
});
</script>
<style>
.q-card {
  width: 300px;
  box-shadow: none;
}
</style>
