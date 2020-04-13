import marked from "marked";
import _Vue from "vue";

export default function(Vue: typeof _Vue): void {
  Vue.directive("md2html", (el, binding) => {
    el.innerHTML = marked(binding.value, {
      sanitize: true,
      gfm: true,
      breaks: true
    });
  });
}
