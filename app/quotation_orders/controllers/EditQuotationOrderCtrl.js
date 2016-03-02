/**
 * Created by Egor Lobanov on 23.11.15.
 */
(function(){
    angular.module('app.quotation_orders').controller('EditQuotationOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            quotationOrder:{},
            productsList: [],//селект выбора продукта
            selectedProduct: null, //выбранный продукт
            total:0
        };
        sc.newElement = {};//данные продукта, который необходимо добавить к заказу
        //config для селекта продуктов
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };

        serverApi.getQuotationOrderDetails($stateParams.id, function(result){
            sc.data.quotationOrder = result.data;
        });

        /**
         * Обновляем информацию по заказу
         */
        sc.saveQuotationOrderInfo = function(){
            var order = sc.data.quotationOrder,
                data = {
                    quotation_order:{
                        title: order.title
                    }
                };
            serverApi.updateQuotationOrder(order.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+order.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+order.number,true);
            });
        };
        
        sc.addNewElement = function(e){
            if(e.keyCode==13 || e.type == "click"){
                var newElement = sc.newElement;
                var data = {
                    quotation_order_element: {
                        description: newElement.description,
                        schema_code: newElement.schema_code,
                        comment: newElement.comment
                    }
                };
                serverApi.addQuotationOrderElement(sc.data.quotationOrder.id, data, function(result){
                    if(result.status == 200 && !result.data.errors){
                        sc.data.quotationOrder.elements.push(data.quotation_order_element);
                        sc.newElement = {};
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                    }
                });
            }
        };
        
        sc.addNewProduct = function(){
            var p = sc.data.selectedProduct;
            if(p){
                sc.data.quotationOrder.products.push({product: p, quantity: 1, element: null});
                sc.data.selectedProduct = null;
            }
        };

        sc.highlightElement = function(item){
            for(var i=0; i < sc.data.quotationOrder.elements.length; i++){
                if(sc.data.quotationOrder.elements[i].id===item.element_id){
                    sc.data.quotationOrder.elements[i].highlight = true;
                }
            }
        };
        
        sc.unhighlightElement = function(){
            for(var i=0; i < sc.data.quotationOrder.elements.length; i++){
                if(sc.data.quotationOrder.elements[i].highlight){
                    sc.data.quotationOrder.elements[i].highlight = false;
                }
            }
        };
        
        sc.highlightProduct = function(item){
            for(var i=0; i < sc.data.quotationOrder.products.length; i++){
                if(sc.data.quotationOrder.products[i].element_id===item.id){
                    sc.data.quotationOrder.products[i].highlight = true;
                }
            }
        };
        
        sc.unhighlightProduct = function(){
            for(var i=0; i < sc.data.quotationOrder.products.length; i++){
                if(sc.data.quotationOrder.products[i].highlight){
                    sc.data.quotationOrder.products[i].highlight = false;
                }
            }
        };

    }]);
}());
