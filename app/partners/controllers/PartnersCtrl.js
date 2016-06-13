/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    'use strict';

    angular.module('app.partners').controller('PartnersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', '$parse', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, $parse){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: createPartner}],
            navTableButts:[{type:'view', callback:viewPartner}, {type:'remove'}],
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

        sc.getDaDataSuggestions = function(type,val, field_name){
            return serverApi.validateViaDaData(type, {"query": val}).then(function(result){
                return result.data.suggestions.map(function(item){
                    return {label: $parse(field_name)(item) || val, item: item, field: field_name};
                });
            });
        };

        sc.fillBySuggestion = function($item, prop){
            var data = $item.item.data,
                addr = sc.newPartnerData[prop];

            switch ($item.field){
                case 'data.postal_code': {
                    addr.region = data.region_with_type;
                    addr.city = data.city;
                    addr.street = data.street;
                    break;
                }
                case 'data.city' : {
                    addr.postal_index =  data.postal_code;
                    addr.region =  data.region_with_type;
                    break;
                }
                case 'data.street' : {
                    addr.postal_index =  data.postal_code;
                    addr.region =  data.region_with_type;
                    addr.city = data.city;
                    addr.house = data.house;
                    break;
                }
                default :  break;
            }
        };
        
        sc.onAddFile = function(){
            //this.parentNode.nextSibling.value = this.value;
        };

        function viewPartner(data){
            $state.go('app.partners.view', {id:data.id || data._id});
        }

        function createPartner(){
            $('#createPartnerModal').modal('show');
        }
    }]);
}());