<template>
  <q-list>
    <member-header id="my-member" :member="myMember">
      <template #caption>
        {{ myMember.group.attributes.code + "1234" }}
      </template>
      <template #side>
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
      </template>
    </member-header>

    <q-separator />

    <menu-item icon="home" :title="$t('home')"  />
    <menu-item icon="account_balance_wallet" :title="$t('statement')" />

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
    <menu-item icon="loyalty" :title="$t('needs')" :to="`/groups/${myMember.group.attributes.code}/needs`"/>
    <menu-item icon="local_offer" :title="$t('offers')" :to="`/groups/${myMember.group.attributes.code}/offers`" />
    <menu-item icon="people" :title="$t('accounts')" />
    <menu-item icon="bar_chart" :title="$t('statistics')" />

    <q-separator />

    <menu-item icon="group_work" :title="$t('otherGroups')" to="/groups" />
    <menu-item icon="help" :title="$t('help')" />
  </q-list>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import MenuItem from "./MenuItem.vue";
import MemberHeader from "./MemberHeader.vue";

export default Vue.extend({
  name: "MenuDrawer",
  components: {
    MenuItem,
    MemberHeader
  },
  computed: {
    ...mapGetters(["myMember"]),
    groupActive(): boolean {
      return (
        this.$route.fullPath ==
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
