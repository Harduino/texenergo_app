/**
 * Created by Sergey Baev on 02.12.15.
 * Load notifications and subscribe to its websocket channels
 */
(function() {
    angular.module('app.layout').directive('notifications', ['CableApi', function(CableApi) {
        return {
            restrict: 'E',
            
            link: function(sc, element, attrs) {
                sc.notifications = window.gon.notifications;
                sc.hidden = true;
                
                // Deal with a private channel
                sc.channel = CableApi.subscribe('NotificationsChannel', {
                    connected: function(data) {
                        console.info("Канал получения уведомлений настроен!")
                    },
                    rejected: function(data) {
                        console.info("Канал получения уведомлений. Не удалось установить соединение!")
                    },
                    received: function(data) {
                        sc.notifications.unshift(data);
                        sc.$apply();
                        $.smallBox({
                            title: "Уведомление",
                            content: "Вам пришло новое уведомление",
                            color: "#739E73",
                            iconSmall: "fa fa-check fadeInRight animated",
                            timeout: 4000
                        });
                    }
                });
                
                // Trigger named events on a server through the private channel
                sc.markAsSeen = function(item) {
                    if (item.seen) return;
                    sc.channel.perform('see', {id: item.id});
                    item.seen = true;
                };
                sc.markAsDeleted = function(item) {
                    if (!item.seen) return;
                    sc.channel.perform('delete', {id: item.id})
                    sc.notifications = _.without(sc.notifications, item);
                };

                sc.goToNotification = function(obj, id) {
                    window.location = ("/#/" + obj + "/" + id);
                    // $state.go('app.'+obj+'.view', id);
                }
                
                // DOM
                sc.hide = function() { sc.hidden = true  };
                sc.show = function() { sc.hidden = false };
                sc.toggle = function() { sc.hidden = !sc.hidden };
            },
            
            templateUrl: '/app/layout/partials/notifications.tpl.html'
        };
    }]);
}());
