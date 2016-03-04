/**
 * Created by Egor Lobanov on 23.11.15.
 */
(function(){
    angular.module('app.quotation_orders').run(['editableOptions', function(editableOptions) {
        editableOptions.theme = 'bs3';

    }]).controller('EditQuotationOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', '$uibModal', '$parse', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, $uibModal, $parse){
        var sc = $scope;
        sc.data ={
            quotationOrder:{},
            productsList: [],//селект выбора продукта
            selectedProduct: null, //выбранный продукт
            total:0
        };
        sc.visual = {
            title: "Рассчет"//window.gon.index.QuotationOrders.indexTitle
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
            if((e.keyCode==13 && e.target.nodeName !== "BUTTON") || e.type == "click"){
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
                        console.log(result.data);
                        data.quotation_order_element.id = new Date().toISOString() + "_el";
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
                var el = {
                    description: p.name,
                    schema_code: '',
                    comment: '',
                    id: (p.id || p._id) + "_el",
                    product:{
                        id: (p.id || p._id),
                        product: p
                    }
                };
                sc.data.quotationOrder.products.push({id: (p.id || p._id), product: p, quantity: 1, element:el});
                sc.data.quotationOrder.elements.push(el);
                sc.data.selectedProduct = null;
            }
        };

        sc.saveElementChange = function(element){
//            console.log(element);
            // send changes on server
        };

        sc.saveProductChange = function(item){
//            console.log(item);
            // send changes on server
        };

        sc.removeElement = function(item, index){
            sc.data.quotationOrder.elements.splice(index, 1);
            findDependencies(sc.data.quotationOrder.products, "element.id", item.id, null, removeDeletedDeps, 'element');
            // send changes on server
        };

        sc.removeProduct = function(item, index){
            sc.data.quotationOrder.products.splice(index, 1);
            findDependencies(sc.data.quotationOrder.elements, "product.id", item.id, null, removeDeletedDeps, "product");
            // send changes on server
        };

        sc.changeProductModal = function(p){
            var modalInstance = $uibModal.open({
                templateUrl: 'eqoModal.tmpl.html',
                controller: 'EqoModalInstanceCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product : p.product
                }
            });

            modalInstance.result.then(function (selectedProduct) {
                findDependencies(sc.data.quotationOrder.elements, "product.id", p.id, null, removeDeletedDeps, "product");
                p.product = selectedProduct;
            });
        };

        /**
         * Will find dependencies into collection by property
         * @param collection - collection where to search
         * @param byProp - String: path of properties for $parser
         * @param propValue - Object: value to compare with
         * @param compareFunc - function that calls to compare values of properties should return Bool
         * @param resultFunc - function that calls every time when, equal values are found
         * @param resultFuncConfig - Object: configuration that will be passed into resultFunc
         */
        function findDependencies(collection, byProp, propValue, compareFunc, resultFunc, resultFuncConfig){
            var propParser = $parse(byProp),
                cfunc = compareFunc || function(a,b){
                    return a == b;
                };
            collection.map(function(item){
                var p;
                try{
                    p = propParser(item);
                }catch(err){
                    console.warn(err.message);
                }
                cfunc(p, propValue, item) && resultFunc(item, resultFuncConfig);
            });
        }

        /**
         * Remove deleted dependencies if they selected into <select>
         * @param item - Object: item of collection
         * @param config - Object
         */
        function removeDeletedDeps(item, config){
            item[config] = null;
        }

        sc.highlight = function(dataProp, byProp, propValue){
            var highlight = (byProp && propValue) != undefined,
                c = highlight ? [byProp, propValue] : ["highlight", true];

            findDependencies(sc.data.quotationOrder[dataProp], c[0], c[1], null, function(row){
                row.highlight = highlight;
            });
        };

        sc.hideIndependentRows = function(item, dataProp, byProp, propValue, collectionProp){
            var hide = !item.hideIndependentRows,
                c = hide ? [byProp, propValue] : ["hidden", false];

            hide && sc.data.quotationOrder[collectionProp].map(function(item){
                 if(item.hideIndependentRows) item.hideIndependentRows = false;
            });

            item.hideIndependentRows = hide;

            findDependencies(sc.data.quotationOrder[dataProp], c[0], c[1], function(a, b, dep){
                var result = (a !== b);
                if(!result && hide) dep.hidden = false;
                return result;

            }, function(row){
                row.hidden = hide;
            });
        };

    }]).controller("EqoModalInstanceCtrl", ['$scope', '$uibModalInstance', 'serverApi', 'product', function($scope, $uibModalInstance, serverApi, product){
        var sc = $scope;

        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.data = {
            selectedProduct: product,
            productsList: []
        };

        sc.ok = function () {
            $uibModalInstance.close(sc.data.selectedProduct);
        };

        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);
}());
