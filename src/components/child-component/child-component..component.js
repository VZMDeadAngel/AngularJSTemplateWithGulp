(function() {
    'use strict';

    angular
        .module('app')
        .component('childComponent', {
            templateUrl: '/components/child-component/child-component.component.html',
            controller: ChildComponentController,
            controllerAs: 'vm',
            bindings: {
                Binding: '=',
            },
        });

    ChildComponentController.$inject = [];
    function ChildComponentController() {
        var vm = this;

        ////////////////

        vm.$onInit = function() {
            vm.text = `Hello from ChildComponent`;
        };
        vm.$onChanges = function(changesObj) { };
        vm.$onDestroy = function() { };
    }
})();