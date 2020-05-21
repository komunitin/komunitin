<template>
  <q-list>
    <q-item id="my-member" clickable>
      <q-item-section avatar>
        <q-avatar>
          <img :src="myMember.attributes.image" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label lines="1" class="text-subtitle2 text-onsurface-m">
          {{ myMember.attributes.name }}
        </q-item-label>
        <!-- This is a placeholder -->
        <q-item-label caption>{{
          myMember.group.attributes.code + "1234"
        }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round color="icon-dark" icon="expand_more">
          <q-menu auto-close anchor="bottom right" self="top right">
            <q-list>
              <menu-item icon="edit" :title="$t('editProfile')" />
              <menu-item
                ref="logout"
                icon="logout"
                :title="$t('logout')"
                @click="logout"
              />
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>

    <q-separator />

    <menu-item icon="home" :title="$t('home')"  />
    <menu-item icon="account_balance_wallet" :title="$t('statement')" />
    <menu-item icon="loyalty" :title="$t('myNeeds')" />
    <menu-item icon="local_offer" :title="$t('myOffers')" />

    <q-separator />

    <!-- Group -->
    <q-item
      id="my-group"
      :clickable="!groupActive"
      :active="groupActive"
      class="text-onsurface-m"
      active-class="bg-active text-primary"
      @click="$router.push(`/groups/${myMember.group.attributes.code}`)"
    >
      <q-item-section avatar>
        <q-avatar>
          <img :src="myMember.group.attributes.image" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <div class="text-subtitle2">
          {{ myMember.group.attributes.name }}
        </div>
        <q-item-label caption>{{
          myMember.group.attributes.code
        }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />

    <menu-item icon="info" :title="$t('news')" />
    <menu-item icon="loyalty" :title="$t('needs')" />
    <menu-item icon="local_offer" :title="$t('offers')" />
    <menu-item icon="people" :title="$t('accounts')" />
    <menu-item icon="bar_chart" :title="$t('statistics')" />

    <q-separator />

    <menu-item icon="group_work" :title="$t('otherGroups')" to="/groups" />
    <menu-item icon="settings" :title="$t('settings')" />
    <menu-item icon="help" :title="$t('help')" />
  </q-list>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import MenuItem from "./MenuItem.vue";

export default Vue.extend({
  name: "MenuDrawer",
  components: {
    MenuItem
  },
  computed: {
    ...mapGetters(["myMember"]),
    groupActive(): boolean {
      return (
        this.$router.currentRoute.path ==
        `/groups/${this.myMember.group.attributes.code}`
      );
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch("logout");
      this.$q.notify({ type: "positive", message: "Successfully logged out!" });
      this.$router.push("/");
    }
  }
});
</script>

<style lang="scss" scoped>
#my-member,
#my-group {
  height: $header-height;
}
</style>
