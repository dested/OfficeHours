var module = angular.module('OfficeHours.client', [
  'ui.router'
]);

function startApp() {

  module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  });

  module.config(function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });

}
startApp();