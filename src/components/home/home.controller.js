(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ['helloFactory', '$scope'];
    function HomeCtrl(helloFactory, $scope) {
        var vm = this;

        init();

        ////////////////

        function init() {
            vm.message = null;
            vm.messagesCount = null;
            vm.loading = true;

            helloFactory.getHelloData()
                .then((data) => {
                    vm.messages = data.messages;
                    vm.messagesCount = vm.messages.length;
                    vm.loading = false;
                }).catch((error) => {
                    console.log(error);
                    vm.loading = false;
                });
        }
    }
})();