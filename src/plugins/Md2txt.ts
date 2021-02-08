import markdownToTxt from "markdown-to-txt";
import _Vue from "vue";

export default function(Vue: typeof _Vue): void {
  Vue.directive("md2txt", (el, binding) => {
    el.innerHTML = markdownToTxt(binding.value, {escapeHtml: false});
  });
}
