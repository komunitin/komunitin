<template>
  <q-list>
    <member-header
      id="my-member" 
      :member="myMember" 
      :to="`/groups/${myMember.group.attributes.code}/members/${myMember.attributes.code}`"
      active-class="bg-active"
    >
      <template #caption>
        {{ myAccount.attributes.code }}
      </template>
      <template #side>
        <q-btn
          flat
          round
          color="icon-dark"
          icon="expand_more"
          @click.stop
        >
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
          >
            <q-list>
              <menu-item
                icon="edit"
                :title="$t('editProfile')"
                :disable="true"
              />
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

    <!--menu-item icon="home" :title="$t('home')"  /-->
    <menu-item 
      id="menu-transactions" 
      icon="account_balance_wallet"
      :title="$t('transactions')" 
      :to="`/groups/${myMember.group.attributes.code}/members/${myMember.attributes.code}/transactions`"
    />

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
        <avatar
          :img-src="myMember.group.attributes.image"
          :text="myMember.group.attributes.code"
        />
      </q-item-section>
      <q-item-section>
        <div class="text-subtitle2">
          {{ myMember.group.attributes.name }}
        </div>
        <q-item-label caption>
          {{
            myMember.group.attributes.code
          }}
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />
    
    <menu-item
      id="menu-needs"
      icon="loyalty"
      :title="$t('needs')"
      :to="`/groups/${myMember.group.attributes.code}/needs`"
    />
    <menu-item
      id="menu-offers"
      icon="local_offer"
      :title="$t('offers')"
      :to="`/groups/${myMember.group.attributes.code}/offers`"
    />
    <menu-item
      id="menu-members"
      icon="people"
      :title="$t('members')"
      :to="`/groups/${myMember.group.attributes.code}/members`"
    />

    <q-separator />

    <menu-item
      icon="group_work"
      :title="$t('otherGroups')"
      to="/groups"
    />
    <menu-item
      icon="info"
      :title="$t('komunitinProject')"
      href="https://github.com/komunitin/komunitin"
    />
  </q-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import Avatar from "./Avatar.vue";
import MemberHeader from "./MemberHeader.vue";
import MenuItem from "./MenuItem.vue";


export default defineComponent({
  name: "MenuDrawer",
  components: {
    MenuItem,
    MemberHeader,
    Avatar
  },
  computed: {
    ...mapGetters(["myMember", "myAccount"]),
    groupActive(): boolean {
      return (
        this.$route.fullPath ==
        `/groups/${this.myMember.group.attributes.code}`
      );
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch("logout")
      await this.$router.push("/")
      this.$q.notify({ type: "positive", message: "Successfully logged out!" })
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
