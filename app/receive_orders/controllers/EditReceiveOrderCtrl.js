/**
 * Created by Egor Lobanov on 09.12.15.
 */
(function(){
    angular.module('app.receive_orders').controller('EditReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.receiveOrder = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type:'refresh', callback:refresh}],
            navTableButts:[{type:'table_edit', callback:updateContentsProduct}, {type:'remove', callback:deleteContentsProduct}],
            roles:{
                can_edit:true,
                can_destroy: true
            },
            showFileModal: angular.noop,
            titles: 'Редактировать ' + window.gon.index.ReceiveOrder.objectTitle.toLowerCase()
        };
        sc.data = {};
        sc.productSelectConf = {
            dataMethod: function(page, query, config, success){
                if(page>1) success({data:[]});
                else serverApi.getUnreceivedProducts($stateParams.id, query, config, success);
            }
        };

        function clearProductForAppend (){
            sc.data.productForAppend={country:'',gtd:'', quantity:0, total:0}
        }
        clearProductForAppend();

        function refresh(){
            serverApi.getReceiveOrderDetails($stateParams.id, function(result){
                if(!result.data.errors){
                    var receiveOrder = sc.receiveOrder = result.data;
                    funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);
                }else funcFactory.showNotification('Ошибка загрузки данных', result.data.errors);
            });

        }

        serverApi.getReceiveOrderDetails($stateParams.id, function(result){
            if(!result.data.errors){
                var receiveOrder = sc.receiveOrder = result.data;
                funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);

                sc.fileModalOptions={
                    url:'/api/receive_orders/'+ receiveOrder.id +'/documents',
                    files: receiveOrder.documents,
                    r_delete: serverApi.deleteFile,
                    view: 'receive_orders',
                    id: receiveOrder.id
                };
            }else funcFactory.showNotification('Ошибка загрузки данных', result.data.errors);
        });

        sc.appendOrder = function(event){
            var append = function(){
                var data = sc.data.productForAppend,
                    post = {
                        product_id: data.product.id,
                        quantity: data.quantity,
                        country: data.country || '',
                        gtd: data.gtd || '',
                        total_w_vat: data.total,
                        supplier_order_id: data.supplier_order.id
                    };
                serverApi.createReceiveOrderContents(sc.receiveOrder.id, post, function(result){
                    if(!result.data.errors){
                        funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно добвален', true);
                        sc.receiveOrder.product_order_contents.push(angular.extend(data, result.data));
                        clearProductForAppend();
                        angular.element('#ero_prod_select').data().$uiSelectController.open=true;
                    }else funcFactory.showNotification('Не удалось добавить продукт ' + data.product.name, result.data.errors);
                });
            };
            var p = sc.data.productForAppend.product;
            if(p && p.id) if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        sc.updateContentsProduct = updateContentsProduct;
        function updateContentsProduct(row, item, event){
            var updateFunc = function(){
                var data = row.data;
                var put = {
                    quantity: data.quantity,
                    country: data.country || '',
                    gtd: data.gtd || '',
                    total_w_vat: data.total
                };
                serverApi.updateReceiveOrderContents(sc.receiveOrder.id, data.id, put, function(result){
                    if(!result.data.errors){
                        var r = sc.receiveOrder.product_order_contents;
                        r[row.index] = angular.extend(r[row.index], result.data);
                        funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно обновлен', true);
                    }else funcFactory.showNotification('Не удалось обновить продукт ' + data.product.name, result.data.errors);
                })
            };
            if(event){
                event.keyCode == 13 && updateFunc();
            }else updateFunc()
        }

        function deleteContentsProduct(item){
            var data = item.data;
            serverApi.deleteReceiveOrderContents(sc.receiveOrder.id, data.id, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно удален', true);
                    sc.receiveOrder.product_order_contents.splice(item.index, 1);
                }else funcFactory.showNotification('Не удалось удалить продукт ' + data.product.name, result.data.errors);
            });
        }

        sc.initMaxValue = function(item, prop){
            item[prop + '_max'] = item[prop];
        };

        sc.onSelectProduct = function(item){
            item.total_max = item.total;
            item.quantity_max = item.quantity;
        };

        function goToIndex(){
            $state.go('app.receive_orders', $stateParams);
        }
        function goToShow(){
            $state.go('app.receive_orders.view', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        sc.saveReceiveOrderInfo = function(){
            var receiveOrder = sc.receiveOrder,
                data = {
                    receive_order:{
                        number: receiveOrder.number,
                        vat_code: receiveOrder.vat_code,
                        partner_id: receiveOrder.partner.id,
                        date: receiveOrder.date
                    }
                };
            serverApi.updateReceiveOrder(receiveOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+receiveOrder.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+receiveOrder.number,true);
            });
        }
    }]);
}());
