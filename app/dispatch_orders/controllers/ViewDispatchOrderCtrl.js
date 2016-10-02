/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.dispatch_orders').controller('ViewDispatchOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'FileUploader', function($scope, $state, $stateParams, serverApi, funcFactory, FileUploader){
        var _pattern = /\/?#/;

        var sc = $scope;
        sc.dispatchOrder = {};
        sc.visual = {
            navButtsOptions:[
                { type: 'back', callback: returnBack },
                { type: 'upd_form_pdf', callback: openDispatchOrderPdf },
                { type: 'label_pdf', callback: openLabelPdf },
                { type: 'packing_list_pdf', callback: openPackingListPdf },
                { type: 'confirm_order', callback: updateStatusDispatchOrder },
                { type: 'refresh', callback: getDispatchOrderDetails },
                { type: 'logs', callback: goToLogs }
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: 'Списание: №'
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;

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
        
        function setFileUploadOptions(dispatch_order){
            sc.uploader.url = 'http://www.texenergo.com/api/dispatch_order/'+ dispatch_order.id +'/documents';
        }

        getDispatchOrderDetails();

        function getDispatchOrderDetails(){
            serverApi.getDispatchOrderDetails($stateParams.id, function(result){
                console.log(result.data);

                var dispatchOrder = sc.dispatchOrder = result.data;
                sc.amontPercent = funcFactory.getPercent(dispatchOrder.paid_amount, dispatchOrder.total);
                sc.dispatchedPercent = funcFactory.getPercent(dispatchOrder.dispatched_amount, dispatchOrder.total);

                setFileUploadOptions(dispatchOrder);
            });
        }

        function returnBack(){
            $state.go('app.dispatch_orders',{});
        }
        
        function openDispatchOrderPdf(){
            var pdfUrl = "http://www.texenergo.com/api/dispatch_orders/" + sc.dispatchOrder.id + ".pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function openLabelPdf(){
            var pdfUrl = "http://www.texenergo.com/api/dispatch_orders/" + sc.dispatchOrder.id + "/label.pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function openPackingListPdf(){
            var pdfUrl = "http://www.texenergo.com/api/dispatch_orders/" + sc.dispatchOrder.id + "/packing_list.pdf";
            window.open(pdfUrl, '_blank');
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

        function goToLogs(){
            $state.go('app.dispatch_orders.view.logs', {});
        }
    }]);
}());