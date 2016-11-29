/**
 * Created by Egor Lobanov on 08.11.15.
 */
(function(){

    'use strict';

    angular.module('app.dispatch_orders').controller('DispatchOrdersCtrl', ['$state', '$stateParams', function($state, $stateParams) {
        this.visual = {
            navButtsOptions:[
                {
                    type: 'refresh',
                    callback: function() {
                        $state.go('app.dispatch_orders', {}, {reload:true});
                    }
                }
            ],
            navTableButts: [
                {
                    type: 'view',
                    callback: function(id) {
                        $state.go('app.dispatch_orders.view', {id:id});
                    }
                },
                {type: 'remove'}
            ],
            titles: ["Списания"]
        };

        this.data = {ordersList:[], searchQuery: $stateParams.q};
    }]);
}());
