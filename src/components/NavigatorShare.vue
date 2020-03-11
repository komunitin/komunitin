<template>
  <div @click="share()">
    <slot v-if="hasSlot()" name="clickable"></slot>
    <p v-else>Share</p>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    text: String,
    url: {
      type: String,
      required: true
    },
    onError: Function,
    onSuccess: Function
  },
  methods: {
    hasSlot() {
      return !!this.$slots['clickable'];
    },
    share() {
      const data = {
        title: this.title,
        text: this.text,
        url: this.url
      };

      if (navigator.share) {
        navigator
          .share(data)
          .then(succ => {
            if (succ) {
              this.onSuccess(succ);
            }
          })
          .catch(err => {
            if (this.onError) {
              this.onError(err);
            }
          });
      } else {
        if (this.onError) {
          this.onError('method not supported');
        }
      }
    }
  }
};
</script>
