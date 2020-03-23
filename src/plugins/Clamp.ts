import clamp from 'clamp-js';
import _Vue from 'vue';

export default function(Vue: typeof _Vue): void  {
  // Add the global directive v-clamp and bind the passed attribute value 
  // to the clamp option of Clamp.js library.
  Vue.directive('clamp', (el, binding) => clamp(el, {clamp : binding.value}));
}