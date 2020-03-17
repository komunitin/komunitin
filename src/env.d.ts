import { QVueGlobals } from 'quasar';

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

/**
 * It does not take the extensions that we have added to quasar.
 */
declare module 'vue/types/vue' {
  interface Vue {
    $q: QVueGlobals;
    $errorsManagement: {
      getErrors: Function;
      newError: Function;
    };
    $Koptions: {
      langs: [];
    };
  }
}
