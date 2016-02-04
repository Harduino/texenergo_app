/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function(){

    "use strict";

    angular.module('app.outgoing_transfers').controller('ViewOutgoingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.outgoingTransfer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files', callback:showFileModal}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.OutgoingTransfer.objectTitle + ' #'
        };

        serverApi.getOutgoingTransferDetails($stateParams.id, function(result){
            console.log(result.data);

            var transfer = sc.outgoingTransfer = result.data;
            sc.fileModalOptions={
                url:'/api/outgoing_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'outgoing_transfers',
                id: transfer.id
            };
        });

        function returnBack(){
            $state.go('app.outgoing_transfers',{});
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());