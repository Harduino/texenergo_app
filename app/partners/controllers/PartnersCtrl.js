/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    'use strict';

    angular.module('app.partners').controller('PartnersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: createPartner}],
            navTableButts:[{type:'view', callback:viewPartner}, {type:'table_edit', callback:editPartner}, {type:'remove'}],
            titles:[window.gon.index.Partner.indexTitle]
        };
        
        sc.data = {
            partnersList:[],
            searchQuery:$stateParams.q
        };
        
        sc.newPartnerData = {
            inn: '',
            name: '',
            delivery_address: '',
            phone: ''
        };
        
        sc.addNewPartner = function(){
            serverApi.createPartner(sc.newPartnerData, function(result){
                if(!result.data.errors){
                    sc.data.partnersList.unshift(result.data);
                    funcFactory.showNotification('Партнёр успешно добавлен', '', true);
                    sc.clearNewPartnerData();
                } else {
                    funcFactory.showNotification('Не удалось создать партнёра', result.data.errors);
                };
            });
        };

        sc.clearNewPartnerData = function(){
            sc.newPartnerData = {
                inn: '',
                name: '',
                delivery_address: '',
                phone: ''
            };
        };
        
        sc.onAddFile = function(){
            //this.parentNode.nextSibling.value = this.value;
        };

        function viewPartner(data){
            $state.go('app.partners.view', {id:data.id || data._id});
        }

        function editPartner(data){
            $state.go('app.partners.view.edit', {id:data.id || data._id});
        }

        function createPartner(){
            $('#createPartnerModal').modal('show');
        }
    }]);
}());