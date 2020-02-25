import { createLocalVue, shallowMount } from '@vue/test-utils'
import Error404 from '../Error404.vue'
import {Quasar, QBtn} from 'quasar'

describe('Error404.vue', () => {
  // We use createLocalVue in order not to pollute the global scope.
  const localVue = createLocalVue()
    
  // We need to explicitely include the components to be used.
  localVue.use(Quasar, {components: {QBtn}})

  // Shallow Mount means that the child components are not mounted,
  // but placeholder components are used instead.
  const wrapper = shallowMount(Error404, {localVue})

  test('Renders message', () => {
    expect(wrapper.text()).toContain('Sorry, nothing here...')
  })

})