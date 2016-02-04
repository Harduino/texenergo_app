/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function(){

    "use strict";

    angular.module('app.incoming_transfers').controller('ViewIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.incomingTransfer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type: 'edit', callback: goToEditIncomingTransfer}, {type:'files', callback: showFileModal}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            navTableButts:[{type:'view', callback: viewDocument}],
            titles: window.gon.index.IncomingTransfer.objectTitle + ': # '
        };

        serverApi.getIncomingTransferDetails($stateParams.id, function(result){
            console.log(result.data);

            var transfer = sc.incomingTransfer = result.data;
            sc.fileModalOptions={
                url:'/api/incoming_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

        function returnBack(){
            $state.go('app.incoming_transfers',{});
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function goToEditIncomingTransfer(){
            $state.go('app.incoming_transfers.view.edit', $stateParams)  
        }
        
        function viewDocument(item){
            if (item.data.hasOwnProperty('customer_order')) {
                $state.go('app.customer_orders.view', {id: item.data.customer_order.id});    
            }
            if (item.data.hasOwnProperty('incoming_transfer')) {
                $state.go('app.incoming_transfer.view', {id: item.data.incoming_transfer.id});    
            }
        }
    }]);
}());