import { marked } from "marked";
import { DirectiveBinding } from "vue";

export default function(el: HTMLElement, binding: DirectiveBinding<string> ): void {
  el.innerHTML = marked(binding.value, {
    gfm: true,
    breaks: true
  });
}
