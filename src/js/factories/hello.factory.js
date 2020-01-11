(function () {
    'use strict';

    angular
        .module('app')
        .factory('helloFactory', helloFactory);

    helloFactory.$inject = ['$q'];
    function helloFactory($q) {
        var factory = {
            getHelloData: getHelloData
        };

        return factory;

        ////////////////
        function getHelloData() {
            var defer = $q.defer();
            setTimeout(() => {
                defer.resolve({
                    'messages': [`Message 1`, 'Message 2']
                });
            }, 3000);
            return defer.promise;
        }
    }
})();