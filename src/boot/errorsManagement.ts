import Vue from 'vue';
import ErrorsManagement from '../services/errorsManagement';

const errorsManagement = new ErrorsManagement();

Vue.prototype.$errorsManagement = errorsManagement;

Vue.config.errorHandler = function(err, vm, info) {
  errorsManagement.newError(err, vm, info);
};
