/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    'use strict';

    angular.module('app.partners').controller('PartnersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', '$parse', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, $parse){
        var sc = $scope;

        sc.visual = {
            navButtsOptions: [
                { type: 'new', callback: createPartner }
            ],
            navTableButts: [
                { type: 'view', callback: viewPartner },
                { type: 'remove' }
            ],
            titles: ["Партнёры"]
        };
        
        sc.data = {
            partnersList:[],
            searchQuery:$stateParams.q
        };
        
        sc.newPartnerData = {
            inn: '',
            name: '',
            delivery_address: '',
            phone: '',
            email: ''
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
                    addr.postal_index =  data.postal_code;
                    addr.region = data.region_with_type;
                    addr.city = (data.city || data.settlement_with_type);
                    addr.street = data.street;
                    addr.house = data.house;
                    break;
                }
                case 'data.city' : {
                    addr.postal_index =  data.postal_code;
                    addr.region =  data.region_with_type;
                    addr.city = (data.city || data.settlement_with_type);
                    addr.street = data.street;
                    addr.house = data.house;
                    break;
                }
                case 'data.street' : {
                    addr.postal_index =  data.postal_code;
                    addr.region =  data.region_with_type;
                    addr.city = (data.city || data.settlement_with_type);
                    addr.street = data.street;
                    addr.house = data.house;
                    break;
                }
                case 'data.inn' : {
                    sc.newPartnerData.inn = data.inn;
                    sc.newPartnerData.kpp = (data.kpp || "0");
                    sc.newPartnerData.legal_name = data.name.short_with_opf;
                    sc.newPartnerData.name = (data.name.short || data.name.short);
                    if(data.management !== undefined) {
                        sc.newPartnerData.ceo_name = data.management.name;
                        sc.newPartnerData.ceo_title = data.management.post;
                    }
                    if(data.address.data !== null && data.address.data !== undefined) {
                        var address = {
                            postal_index: data.address.data.postal_code,
                            region: data.address.data.region_with_type,
                            city: (data.address.data.city || data.address.data.settlement_with_type),
                            street: data.address.data.street_with_type,
                            house: data.address.data.house
                        }
                        sc.newPartnerData.legal_address = address;
                        sc.newPartnerData.delivery_address = address;
                    }
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