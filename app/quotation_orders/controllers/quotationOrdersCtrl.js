/**
 * Created by Mikhail on 24.02.16.
 */
(function(){

    'use strict';

    angular.module('app.quotation_orders').controller('QuotationOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[
                { type: 'new', callback: createNewQuotationOrderModal },
                { type: 'refresh', callback: refresh }
            ],
            navTableButts: [
                { type: 'table_edit', callback: editQuotationOrder }
            ],
            titles: ["Производственные ордера"]
        };
        
        sc.data = {
            ordersList:[],
            partnersList:[],
            searchQuery:$stateParams.q,
            newQuotationOrderData: {}
        };

        function refresh (){
            $state.go('app.quotation_orders', {}, {reload:true});
        }
        
        sc.clearNewQuotationOrder = function(){
            sc.data.newQuotationOrderData = {};
        };
        
        sc.addNewQuotationOrder = function(){
            var data = {
                quotation_order: {
                    title: sc.data.newQuotationOrderData.title
                }
            };
            serverApi.createQuotationOrder(data, function(result){
                if(!result.data.errors){
                    sc.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Рассчёт успешно добавлен', '', true);
                    sc.clearNewQuotationOrder();
                    $state.go('app.quotation_orders.edit', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать рассчёт', result.data.errors);
                }
            });
        };
        
        function viewQuotationOrder(item){
            $state.go('app.quotation_orders.view', {id:item.data.id || item.data._id});
        }

        function editQuotationOrder(item){
            $state.go('app.quotation_orders.edit', {id:item.data.id || item.data._id});
        }
        

        function createNewQuotationOrderModal(){
            $('#createNewQuotationModal').modal('show');
        }
    }]);
}());