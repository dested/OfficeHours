var module = angular.module('OfficeHours.client', [
  'ui.router',
  'angular-jwt',
  'ui.bootstrap',
  'ngFileUpload'
]);

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
});

module.config(function ($httpProvider,$stateProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];




  $stateProvider
    .state('inner', {
      abstract: true,
      templateUrl: 'components/inner.tpl.html'
    });

});



$(document).ready(function() {

  var $window = $(window);
  $windowheight = $window.height();
  $pageHalfHeight = ($windowheight/2)
  $elementHeight = $(".banner-text").height()
  $imageHalfHeight = ($elementHeight/2)
  $newHeight = ($pageHalfHeight - $imageHalfHeight)

  $(".banner-text").css({"margin-top":$newHeight+"px"});

});