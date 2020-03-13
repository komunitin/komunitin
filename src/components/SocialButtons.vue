<script>
import VueYandexShare from '@alexlit/vue-yandex-share';

export default {
  name: 'SocialButtons',
  components: { VueYandexShare },

  data() {
    return {
      /**
       * Options for social networks
       */
      options: {
        accessToken: null,
        bare: false,
        counter: false,
        copy: 'last',
        description: null,
        direction: 'horizontal',
        hashtags: null,
        image: null,
        lang: 'en',
        limit: 24,
        popupDirection: 'bottom',
        popupPosition: 'inner',
        size: 'm',
        title: null,
        url: null,
        services: [
          'facebook',
          'twitter',
          'whatsapp',
          'linkedin',
          'telegram'
          // 'blogger',
          // 'delicious',
          // 'digg',
          // 'evernote',
          // 'gplus',
          // 'lj',
          // 'moimir',
          // 'odnoklassniki',
          // 'pinterest',
          // 'pocket',
          // 'qzone',
          // 'reddit',
          // 'renren',
          // 'sinaWeibo',
          // 'skype',
          // 'surfingbird',
          // 'tencentWeibo',
          // 'tumblr',
          // 'viber',
          // 'vkontakte',
        ]
      }
    };
  },
  props: ['url', 'title'],
  mounted: function() {
    this.options.url = this.url;
    this.options.title = this.title;
  }
};
</script>

<template>
  <vue-yandex-share v-bind="options"></vue-yandex-share>
</template>
