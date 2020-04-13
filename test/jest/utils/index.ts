import Vue, { ComponentOptions } from 'vue';
import {VueClass, createLocalVue, mount, ThisTypedMountOptions } from '@vue/test-utils'

import Vuex from 'vuex';
import VueRouter from 'vue-router';
import createStore from 'src/store/index';
import createRouter from 'src/router/index';

import * as quasar from 'quasar';

// Enable mirage. Don't know how to do it otherwise so it works with
// inline VSCode debugging.
process.env.USE_MIRAGE = "0";

// Boot files.
import bootKomunitin from '../../../src/boot/komunitin';
import bootErrors from '../../../src/boot/errors';
import bootI18n from '../../../src/boot/i18n';
import bootVuelidate from '../../../src/boot/vuelidate';
import '../../../src/boot/mirage';
import bootAuth from '../../../src/boot/auth';

const boots = [bootKomunitin,bootErrors,bootI18n,bootVuelidate,bootAuth];

// Get the Quasar plugins to be used.
const {Quasar, Notify, LocalStorage} = quasar;

// Get an object containing all Quasar Vue components.
const QComponents = Object.keys(quasar).reduce((object, key) => {
  const val = Reflect.get(quasar, key);
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {} as {[key: string]: Vue});

/**
 * Mount a Vue component for Unit testing in a local Vue instance,
 * with full Quasar and plugins enabled.
 * @param component 
 */
export async function mountComponent<V extends Vue>(component: VueClass<V>, options?: ThisTypedMountOptions<V>) {
  // Use a local Vue instance.
  const localVue = createLocalVue();

  // Vuex and router plugins.
  localVue.use(Vuex)
  localVue.use(VueRouter)

  const store = createStore();

  // Set the router mode to "history", as we have in our Quasar config file.
  process.env.VUE_ROUTER_MODE = "history";
  const router = createRouter();

  // Quasar and Quasar components.
  localVue.use(Quasar, {
    components: QComponents,
    plugins: { Notify, LocalStorage },
  });

  localVue.directive("ripple", jest.fn());

  // Call boot files with localVue.
  const redirect = (url:string) => {window.location.href = url};
  const app = {} as ComponentOptions<Vue>;
  const bootParams = {app, router, store, Vue: localVue, redirect, urlPath: ""};
  for (const boot of boots) {
    await boot(bootParams);
  }

  // Merge options injected by boot functions.
  const mountOptions = {
    ...app,
    localVue,
    store,
    router,
    attachToDocument: true,
    stubs: {
      // stub map components since they throw errors in test environment.
      LMap: true,
      LTileLayer: true,
      LMarker: true
    },
    ...options,
  }

  const wrapper = mount(component, mountOptions);

  // Mock $q.notify since it throws an error in testing environment.
  // "Cannot read property 'iconSet' of undefined".
  wrapper.vm.$q.notify = jest.fn();
  
  return wrapper;
}

// Add more testing features to Vue.

Vue.prototype.$nextTwoTicks = async function() {
  await this.$nextTick();
  await this.$nextTick();
}

Vue.prototype.$wait = async function(time?: number) {
  await this.$nextTwoTicks();
  await new Promise((r) => setTimeout(r, time ?? 100));
}

declare module "vue/types/vue" {
  interface Vue {
    /**
     * Sometimes the Vue.$nextTick() or Vue.$nextTwoTicks() function is not enough for the content to be completely updated.
     * Known use cases:
     *  - Content needing to reach data from a mocked HTTP request.
     *  - Interact with router.back() feature.
     * This method waits for two ticks and then for 100 ms or the given time.
     */
    $wait(time?: number) : Promise<void>;

    /**
     * Sometimes tje Vue.$nextTick() function is not enough, and you need to wait for two ticks.
     * 
     * Known use cases:
     *  - Wait for rendering the content after triggering an action that changes the current route.
     */
    $nextTwoTicks(): Promise<void>;
  }
}


// Mock window.scrollTo so it doesn't throw a "Not Implemented" error (by jsdom lib).
window.scrollTo = jest.fn();

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation(success =>
    Promise.resolve(
      success({
        coords: {
          latitude: 30,
          longitude: -105,
          speed: null,
          accuracy: 1,
          altitudeAccuracy: null,
          heading: null,
          altitude: null
        },
        timestamp: Date.now()
      })
    )
  )
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      navigator: {
        geolocation: {};
      }
    }
  }
}

global.navigator.geolocation = mockGeolocation;
