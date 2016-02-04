/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.receive_orders').controller('ViewReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.receiveOrder = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files', callback:showFileModal}, {type:'edit', callback: goEditReceiveOrder}],
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

        serverApi.getReceiveOrderDetails($stateParams.id, function(result){
            console.log(result.data);
            var receiveOrder = sc.receiveOrder = result.data;
            funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);
            sc.amontPercent = funcFactory.getPercent(receiveOrder.paid_amount, receiveOrder.total);
            sc.receivedPercent = funcFactory.getPercent(receiveOrder.receivedPercent, receiveOrder.total);

            sc.fileModalOptions={
                url:'/api/receive_orders/'+ receiveOrder.id +'/documents',
                files: receiveOrder.documents,
                r_delete: serverApi.deleteFile,
                view: 'receive_orders',
                id: receiveOrder.id
            };
        });

        function returnBack(){
            $state.go('app.receive_orders',{});
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function goEditReceiveOrder(){
            $state.go('app.receive_orders.view.edit', $stateParams)
        }
    }]);
}());