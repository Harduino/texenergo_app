/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.customer_orders').controller('CustomerOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', 'authService', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory, authService){
        var sc = $scope;

        sc.visual = {
            navButtsOptions: [
                { type: 'new', callback: createNewOrder },
                { type: 'refresh', callback: refresh }
            ],
            navTableButts:[
                { type:'view', callback: viewCustomerOrder },
                { type:'remove', callback: removeCustomerOrder }
            ],
            titles: ["Заказы клиентов"]
        };
        sc.data = {
            ordersList:[],
            partnersList:[],
            searchQuery:$stateParams.q
        };
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        sc.addNewOrder = function(){
            if(sc.newOrderData.partner && sc.newOrderData.partner)
                sc.newOrderData.partner_id = sc.newOrderData.partner.id;
            delete sc.newOrderData.date;// delete forbidden property
            delete sc.newOrderData.partner;
            serverApi.createCustomerOrder(sc.newOrderData, function(result){
                if(!result.data.errors){
                    sc.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Заказ успешно добавлен', '', true);
                    sc.clearCreateOrder();
                    $state.go('app.customer_orders.view', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать заказ', result.data.errors);
                }
            });
        };

        sc.clearCreateOrder = function(){
            sc.newOrderData = {
                date: null,
                title:'',
                description:'',
                partner_id: '',
                request_original:''
            };
        };

        sc.clearCreateOrder();

        function refresh(){
            $state.go('app.customer_orders', {}, {reload: true});
        }

        function viewCustomerOrder(item){
            $state.go('app.customer_orders.view', {id:item.data.id || item.data._id});
        }

        function createNewOrder(){
            sc.newOrderData.date = new Date();
            sc.newOrderData.partner = authService.profile.user_metadata.partner || null;
            $('#createNewOrderModal').modal('show');
        }

        function removeCustomerOrder(item){
            $.SmartMessageBox({
                title: "Удалить заказ?",
                content: "Вы действительно хотите удалить заказ " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteCustomerOrder(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.ordersList.splice(item.index,1);
                            funcFactory.showNotification('Заказ ' + item.data.number + ' успешно удален.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить заказ ' + item.data.number, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());