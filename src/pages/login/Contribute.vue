<template>
  <div>
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        color="white"
        icon="arrow_back"
        aria-label="Home"
        @click="$router.back()"
      />
      <q-toolbar-title class="text-white">Contribute</q-toolbar-title>
    </q-toolbar>
    <div class="home-body">
      <h6>Lorem ipsum dolor</h6>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aut nihil
        obcaecati et nesciunt animi assumenda deleniti excepturi alias ullam. Esse
        atque maxime hic adipisci minima nisi nihil rem voluptatum repellendus!
        Sint voluptates libero quas, eveniet molestiae cumque! Odit officiis vitae
        facere quo neque exercitationem accusantium iusto ullam animi veniam.
      </p>
      <p>
        Unde
        alias quam magni rerum eum ex, nam blanditiis. Aperiam, minus? Totam
        officiis qui dolorem vel eos incidunt nam magni rem ratione facere,
        repellendus aliquid inventore minima voluptatibus similique harum et ex,
        natus accusamus illo nihil? Beatae laudantium earum sapiente mollitia.
        Ipsa corrupti ab, iusto voluptas eius consectetur cum quasi modi omnis
        atque. Quibusdam corrupti aliquid dicta quos, perferendis fugit! Officiis
        vero vel blanditiis officia, excepturi ipsam eum deleniti cumque ipsa. In
        veniam recusandae qui, blanditiis quasi asperiores iusto atque delectus
        dolorum voluptatum, molestiae id modi reiciendis optio, placeat
        necessitatibus alias. Velit eveniet perspiciatis commodi natus consectetur
        officia voluptatum eos modi. Non
      </p>
      <p>
        commodi quia, amet, dicta odit doloremque veniam quo dolorum similique ut
        corrupti odio quaerat adipisci! Fugiat natus dignissimos quo, modi vero
        dolore totam. Aut qui corporis labore cum recusandae. Quas at libero ab
        dignissimos inventore dolorum delectus adipisci numquam. Autem alias
        consequatur dolores eligendi, suscipit nesciunt molestiae architecto
        quisquam nulla.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

// Login select.
export default Vue.extend({
  name: 'Help'
});
</script>
<style>
h6 {
  margin: 0px;
}

.home-body {
  text-align: center;
}
</style>
