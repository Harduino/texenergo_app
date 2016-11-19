/**
 * Created by Egor Lobanov on 17.01.16.
 */
(function(){
    /**
     * Build notification service for module
     */
    var module = angular.module('services.notifications', []);

    module.service('notificationServiceBuilder', notificationServiceBuilder);

    notificationServiceBuilder.$inject = ['CableApi', 'funcFactory'];

    function notificationServiceBuilder (CableApi, funcFactory){

        this.build = function(serviceModule, name, actions, mixins){

            return new function(){

                this.subscribe = function(params, scopeObject){

                    var s = scopeObject;// property of controller scope, that waiting for changes

                    var m = {
                        rejected: function(){
                            funcFactory.showNotification('Канал получения уведомлений', 'Не удалось установить соединение!');
                        },
                        received: function(data) {
                            syncChanges(data, s);
                        }
                    };
                    if(typeof mixins === 'object' && mixins) m = angular.extend(m, mixins);

                    return CableApi.subscribe(params, m);
                };

                function syncChanges(data, scopeObject){
                    actions[data.action] && actions[data.action](scopeObject, data);
                }

            };
        };

        this.getIndexByProperty = function(list, item, prop){
            var ind = -1;
            for(var i=list.length; i--;){
                if(list[i][prop] === item[prop]){
                    ind = i;
                    break;
                }
            }
            return ind;
        };
    }
}());