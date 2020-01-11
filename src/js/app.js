angular.module('app', [
    'ngRoute'
])
    .config(routeProvider);


routeProvider.$inject = ['$routeProvider'];
function routeProvider($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'components/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'vm'
        });
}