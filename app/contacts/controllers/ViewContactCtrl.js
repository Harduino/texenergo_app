/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    "use strict";

    angular.module('app.contacts').controller('ViewContactCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.contact = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback: goToEdit}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Contact.objectTitle + ': '
        };

        serverApi.getContactDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.contact = result.data;
        });

        function returnBack(){
            $state.go('app.contacts',{});
        }
        
        function goToEdit(){
            $state.go('app.contacts.view.edit',{});
        }
    }]);
}());