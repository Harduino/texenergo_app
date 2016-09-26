/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.receive_orders').controller('ViewReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'FileUploader', 'CanCan', function($scope, $state, $stateParams, serverApi, funcFactory, FileUploader, CanCan){
        var sc = $scope;
        sc.receiveOrder = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'refresh', callback:getReceiveOrderDetails}],
            navTableButts:[{type:'remove', callback:deleteContentsProduct}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.ReceiveOrder.objectTitle + ': #',
            roles: {
                can_destroy: CanCan.can('edit', 'ReceiveOrder')
            }
        };

        sc.amontPercent = 0;
        sc.receivedPercent = 0;

        sc.productSelectConf = {
            dataMethod: function(page, query, config, success){
                if(page>1) success({data:[]});
                else serverApi.getUnreceivedProducts($stateParams.id, query, config, success);
            }
        };

        sc.ordersList = [];
        sc.data = {};
        
        sc.uploader = new FileUploader({
            withCredentials: true,
            queueLimit: 5,
            onCompleteItem: function(fileItem, response, status, headers) {
                if(status===200){
                    sc.receiveOrder.documents.push(response);
                    sc.uploader.clearQueue();
                    funcFactory.showNotification("Успешно", 'Приложил документ.',true);
                } else {
                    funcFactory.showNotification('Не удалось приложить документ', response.errors);   
                }
            }
        });

        sc.onSelectProduct = function(item){
            item.total_max = item.total;
            item.quantity_max = item.quantity;
        };

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
                        angular.element('#vro_prod_select').data().$uiSelectController.open=true;
                    }else funcFactory.showNotification('Не удалось добавить продукт ' + data.product.name, result.data.errors);
                });
            };
            var p = sc.data.productForAppend.product;
            if(p && p.id) if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        sc.updateContentsProduct = function(row){
            var data = row.data;
            var put = {
                quantity: data.quantity || 0,
                country: data.country || '',
                gtd: data.gtd || '',
                total_w_vat: data.total || 0
            };
            serverApi.updateReceiveOrderContents(sc.receiveOrder.id, data.id, put, function(result){
                if(!result.data.errors){
                    var r = sc.receiveOrder.product_order_contents;
                    r[row.index] = angular.extend(r[row.index], result.data);
                    funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно обновлен', true);
                }else funcFactory.showNotification('Не удалось обновить продукт ' + data.product.name, result.data.errors);
            })
        };

        sc.goToPartner = function() {
            $state.go('app.partners.view', {id: (sc.receiveOrder.partner.id || sc.receiveOrder.partner._id)})
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

        function setFileUploadOptions(receive_order){
            sc.uploader.url = 'http://www.texenergo.com/api/receive_orders/'+ receive_order.id +'/documents';
        }

        getReceiveOrderDetails();
        function getReceiveOrderDetails(){
            serverApi.getReceiveOrderDetails($stateParams.id, function(result){
                var receiveOrder = sc.receiveOrder = result.data;
                funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);
                sc.amontPercent = funcFactory.getPercent(receiveOrder.paid_amount, receiveOrder.total);
                sc.receivedPercent = funcFactory.getPercent(receiveOrder.receivedPercent, receiveOrder.total);
                setFileUploadOptions(receiveOrder);

            });
        }

        function clearProductForAppend (){
            sc.data.productForAppend={country:'',gtd:'', quantity:0, total:0}
        }
        clearProductForAppend();

        function returnBack(){
            $state.go('app.receive_orders',{});
        }
        
        function goEditReceiveOrder(){
            $state.go('app.receive_orders.view.edit', $stateParams)
        }
    }]);
}());