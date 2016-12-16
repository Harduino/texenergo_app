/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){
    "use strict";

    angular.module('app.manufacturers').controller('ViewManufacturerCtrl', ['$state', '$stateParams', 'serverApi', '$sce', function($state, $stateParams, serverApi, $sce){
        var self = this;
        this.manufacturer = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.manufacturers', {});
                    }
                },
                {
                    type: 'edit',
                    callback: function() {
                        $state.go('app.manufacturers.view.edit', $stateParams);
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getManufacturerDetails($stateParams.id, function(result){
            self.manufacturer = result.data;
            self.manufacturer.description = $sce.trustAsHtml(result.data.description);
        });
    }]);
}());
