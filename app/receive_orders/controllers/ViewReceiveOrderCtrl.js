/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.receive_orders').controller('ViewReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'FileUploader', function($scope, $state, $stateParams, serverApi, funcFactory, FileUploader){
        var sc = $scope;
        sc.receiveOrder = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback: goEditReceiveOrder}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.ReceiveOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;
        sc.receivedPercent = 0;
        
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
        
        function setFileUploadOptions(receive_order){
            sc.uploader.url = 'http://www.texenergo.com/api/receive_orders/'+ receive_order.id +'/documents';
        }

        serverApi.getReceiveOrderDetails($stateParams.id, function(result){
            var receiveOrder = sc.receiveOrder = result.data;
            funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);
            sc.amontPercent = funcFactory.getPercent(receiveOrder.paid_amount, receiveOrder.total);
            sc.receivedPercent = funcFactory.getPercent(receiveOrder.receivedPercent, receiveOrder.total);
            setFileUploadOptions(receiveOrder);
            
        });

        function returnBack(){
            $state.go('app.receive_orders',{});
        }
        
        function goEditReceiveOrder(){
            $state.go('app.receive_orders.view.edit', $stateParams)
        }
    }]);
}());