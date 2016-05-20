/**
 * Created by Egor Lobanov on 08.11.15.
 */
(function(){

    'use strict';

    angular.module('app.dispatch_orders').controller('DispatchOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[
                {type:'refresh', callback: refresh}
            ],
            navTableButts:[{type:'view', callback:viewOrder}, {type:'table_edit'}, {type:'remove'}],
            titles:[window.gon.index.DispatchOrder.indexTitle]
        };

        sc.data = {
            ordersList:[],
            searchQuery:$stateParams.q
        };

        function refresh (){
            $state.go('app.dispatch_orders', {}, {reload:true});
        }

        function viewOrder(id){
            $state.go('app.dispatch_orders.view', {id:id});
        }
    }]);
}());
