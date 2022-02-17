import Vue, { ComponentOptions } from 'vue';
import {VueClass, createLocalVue, mount, ThisTypedMountOptions } from '@vue/test-utils'

import Vuex from 'vuex';
import VueRouter, { RawLocation } from 'vue-router';
import createStore from 'src/store/index';
import createRouter from 'src/router/index';

import * as quasar from 'quasar';

// Boot files.
import bootKomunitin from '../../../src/boot/komunitin';
import bootErrors from '../../../src/boot/errors';
import bootI18n from '../../../src/boot/i18n';
import bootVuelidate from '../../../src/boot/vuelidate';
import bootMirage from '../../../src/boot/mirage';
import bootAuth from '../../../src/boot/auth';
import { Auth } from '../../../src/plugins/Auth';
import { auth } from '../../../src/store/me';
import { mockToken } from 'src/server/AuthServer';

const boots = [bootKomunitin,bootErrors,bootI18n,bootVuelidate,bootMirage,bootAuth];

// Get the Quasar plugins to be used.
const {Quasar, LocalStorage} = quasar;


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
export async function mountComponent<V extends Vue>(component: VueClass<V>, options?: ThisTypedMountOptions<V> & {login?: true}) {
  // Use a local Vue instance.
  const localVue = createLocalVue();

  // Vuex and router plugins.
  localVue.use(Vuex)
  localVue.use(VueRouter)
  
  // Quasar and Quasar components.
  localVue.use(Quasar, {
    components: QComponents,
    plugins: { LocalStorage },
  });

  LocalStorage.clear();
  
  // Login state. We must do that before createStore().
  if (options?.login) {
    // This call actually saves the mocked token in LocalStorage.
    auth.processTokenResponse(mockToken(Auth.SCOPES));
  }

  const store = createStore();

  // Set the router mode to "history", as we have in our Quasar config file.
  process.env.VUE_ROUTER_MODE = "history";
  const router = createRouter();

  localVue.directive("ripple", jest.fn());

  // Call boot files with localVue.
  const redirect = (url:RawLocation) => {window.location.href = url.toString()};
  const app = {} as ComponentOptions<Vue>;
  const bootParams = {app, router, store, Vue: localVue, redirect, urlPath: "", publicPath: ""};
  for (const boot of boots) {
    await boot(bootParams);
  }

  // Merge options injected by boot functions.
  const mountOptions: ThisTypedMountOptions<V> = {
    ...app,
    localVue,
    store,
    router,
    attachTo: document.body,
    stubs: {
      // stub map components since they throw errors in test environment.
      LMap: true,
      LTileLayer: true,
      LMarker: true
    },
    ...options,
  };

  const wrapper = mount(component, mountOptions);

  // Mock $q.notify since it throws an errors in testing environment if we use the actual module.
  wrapper.vm.$q.notify = jest.fn();
  quasar.Notify.create = jest.fn();

  // Set a value on scrollHeight property so QInfiniteScrolling don't load all resources.
  Object.defineProperty(HTMLDivElement.prototype, "scrollHeight", {configurable: true, value: 1500});

  return wrapper;
}

// Add more testing features to Vue.

Vue.prototype.$nextTicks = async function() {
  await this.$nextTick();
  await this.$nextTick();
  await this.$nextTick();
  await this.$nextTick();
}

Vue.prototype.$wait = async function(time?: number) {
  await this.$nextTicks();
  await new Promise((r) => setTimeout(r, time ?? 200));
}

declare module "vue/types/vue" {
  interface Vue {
    /**
     * Sometimes the Vue.$nextTick() or Vue.$nextTicks() function is not enough for the content to be completely updated.
     * Known use cases:
     *  - Content needing to reach data from a mocked HTTP request.
     *  - Interact with router.back() feature.
     * This method waits for two ticks and then for 200 ms or the given time.
     */
    $wait(time?: number) : Promise<void>;

    /**
     * Sometimes the Vue.$nextTick() function is not enough, and you need to wait for more ticks.
     * 
     * Known use cases:
     *  - Wait for rendering the content after triggering an action that changes the current route.
     */
    $nextTicks(): Promise<void>;
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

Object.defineProperty(global.navigator, 'geolocation', {value: mockGeolocation});

// Mock Notification.
const mockNotification = {
  requestPermission: jest.fn().mockImplementation((success) => Promise.resolve(success(false))),
  permission: "default"
}
Object.defineProperty(global, 'Notification', {value: mockNotification})
