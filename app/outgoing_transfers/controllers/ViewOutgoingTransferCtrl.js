/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function(){
    "use strict";

    angular.module('app.outgoing_transfers').controller('ViewOutgoingTransferCtrl', ['$state', '$stateParams', 'serverApi', function($state, $stateParams, serverApi) {
        var self = this;
        this.outgoingTransfer = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.outgoing_transfers', {});
                    }
                },
                {
                    type: 'refresh',
                    callback: function() {
                        serverApi.getOutgoingTransferDetails($stateParams.id, function(result) {
                            self.outgoingTransfer = result.data;
                        })
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            showFileModal: angular.noop,
            titles: 'Исходящий платёж: '
        };

        serverApi.getOutgoingTransferDetails($stateParams.id, function(result) {
            var transfer = self.outgoingTransfer = result.data;

            self.fileModalOptions = {
                url:'/api/outgoing_transfers/' + transfer.id + '/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'outgoing_transfers',
                id: transfer.id
            };
        });
    }]);
}());
