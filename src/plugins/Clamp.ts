import clamp from 'clamp-js';
import { DirectiveBinding } from 'vue';

// Directive v-clamp to be declared in directives element property.
export default function(el: HTMLElement, binding: DirectiveBinding<string> ) {
  // bind the passed attribute value to the clamp option of Clamp.js library.
  return clamp(el, {clamp : binding.value})
}