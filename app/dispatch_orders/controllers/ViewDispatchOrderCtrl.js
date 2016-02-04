/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.dispatch_orders').controller('ViewDispatchOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var _pattern = /\/?#/;

        var sc = $scope;
        sc.dispatchOrder = {};
        sc.visual = {
            navButtsOptions:[
                { type: 'back', callback: returnBack },
                { type: 'files', callback:showFileModal},
                { type: 'upd_form_pdf', callback: openDispatchOrderPdf },
                { type: 'label_pdf', callback: openLabelPdf },
                { type: 'packing_list_pdf', callback: openPackingListPdf },
                { type:'confirm_order', callback: updateStatusDispatchOrder}
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.DispatchOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;

        serverApi.getDispatchOrderDetails($stateParams.id, function(result){
            console.log(result.data);

            var dispatchOrder = sc.dispatchOrder = result.data;
            sc.amontPercent = funcFactory.getPercent(dispatchOrder.paid_amount, dispatchOrder.total);
            sc.dispatchedPercent = funcFactory.getPercent(dispatchOrder.dispatched_amount, dispatchOrder.total);

            sc.fileModalOptions={
                url:'/api/dispatch_orders/'+ dispatchOrder.id +'/documents',
                r_get: serverApi.getDocuments,
                r_delete: serverApi.deleteFile,
                view: 'dispatch_orders',
                id: dispatchOrder.id
            };
        });

        function returnBack(){
            $state.go('app.dispatch_orders',{});
        }
        
        function openDispatchOrderPdf(){
            var pdfUrl = location.href.replace(_pattern,"")+".pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function openLabelPdf(){
            var pdfUrl = location.href.replace(_pattern,"")+"/label.pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function openPackingListPdf(){
            var pdfUrl = location.href.replace(_pattern,"")+"/packing_list.pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        sc.saveChosenPerson = function(){
            var data = {
                dispatch_order:{
                    person_id: sc.dispatchOrder.chosenPersonId
                }
            };
            serverApi.updateDispatchOrder(sc.dispatchOrder.id, data, function(result){
                if(!result.data.errors){
                    sc.dispatchOrder = result.data;
                    funcFactory.showNotification("Успешно", 'Человек выбран.',true);
                } else {
                    funcFactory.showNotification('Ошибка при выборе человека', result.data.errors);
                }
            });
        };

        function updateStatusDispatchOrder(subdata, item) {
            var data = {
                dispatch_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusDispatchOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.dispatchOrder = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
    }]);
}());