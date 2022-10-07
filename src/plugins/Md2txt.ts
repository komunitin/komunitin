import markdownToTxt from "markdown-to-txt";
import { DirectiveBinding } from "vue";

export default function(el: HTMLElement, binding: DirectiveBinding<string> ): void {
  el.innerHTML = markdownToTxt(binding.value, {escapeHtml: false});
}
