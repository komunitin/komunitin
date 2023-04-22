import { ComponentPublicInstance } from 'vue';

import KError, { KErrorCode } from '../KError';
import { Notify } from 'quasar'
import { boot } from 'quasar/wrappers';
import {i18n} from './i18n'


/**
 * Get the localized message for the error.
 * 
 * @param error The error.
 */
function getLocalizedMessage(error: KError): string {
  const {t} = i18n.global
  return t(error.getTranslationKey()).toString();
}

/**
 * Show error to the user.
 * 
 * @param error The error to be shown.
 */
function showError(error: KError) {
  Notify.create({
    color: 'negative',
    position: 'top',
    message: getLocalizedMessage(error)
  });
}

/**
 * Write an error line to the JavaScript console.
 * 
 * @param error The error to be logged.
 */
function logError(error: KError) {
  let msg = `[${error.code}] ${error.message}`;
  if (error.debugInfo) {
    msg += "\n" + JSON.stringify(error.debugInfo)
  }
  // eslint-disable-next-line no-console
  console.error(msg)
}

/**
 * Log error produced while trying to handle the error. 
 */
function logErrorHandling(error: Error) {
  // eslint-disable-next-line no-console
  console.error(`[${KErrorCode.ErrorHandling}] Error while handling another error: ${error.message}`);
}

export function handleError(error: KError): void {
  logError(error);
  showError(error);
}

function vueErrorHandler(error: unknown, instance: ComponentPublicInstance | null, info: string) {
  if (error instanceof KError) {
    handleError(error)
  } else if (error instanceof Error){
    handleError(new KError(KErrorCode.UnknownVueError, error.message, {error: error, info}))
  } else {
    handleError(new KError(KErrorCode.UnknownVueError, "Unknown error", {info}))
  }
}
function vueWarnHandler(message: string, instance: ComponentPublicInstance | null, trace: string) {
  const error = new KError(KErrorCode.VueWarning, message + trace, {message, trace, instance});
  handleError(error);
}

/**
 * Register global error handler for errors occurred outside Vue components. 
 */
if (window !== undefined) {
  window.addEventListener('error', function(event: ErrorEvent) {
    // This error is thrown but is harmless, so we can safely ignore it.
    // In fact, it is mandatory that we ignore it since otherwise we show
    // very annoying error messages to users. Note that in chrome this 
    // error is 
    // "ResizeObserver loop limit exceeded" 
    // and  in Safari it is:
    // "ResizeObserver loop completed with undelivered notifications."
    if (event.message.includes("ResizeObserver loop")) {
      // TODO: Maybe remove this warning in production.
      if (process.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(event.message);
      }
      return;
    }
    let kerror: KError;
    if (event.error instanceof KError) {
      kerror = event.error;
    }
    else {
      kerror = new KError(KErrorCode.UnknownScript, event.message, {url: event.filename , line: event.lineno, column: event.colno, error: event.error})
    }
    try {
      handleError(kerror);
    }
    catch(error) {
      logErrorHandling(kerror);
    }
  });
}

export default boot(({app}) => {
  // Add handleError() function to Vue prototype.
  app.config.globalProperties.$handleError = handleError;
  // Set Vue warning handler.
  app.config.warnHandler = vueWarnHandler;
  app.config.errorHandler = vueErrorHandler;
});

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    /**
     * Main function for error handling.
     * 
     * Use this function when you can continue the execution but you want to log the error anyway. Otherwise
     * just throw the KError.
     * 
     * @param error The error to handle
     */
    $handleError: (error: KError) => void;
  }
}