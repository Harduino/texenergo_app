/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){
    'use strict';

    angular.module('app.partners').controller('PartnersCtrl', ['$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', '$parse', function($state, $stateParams, serverApi, $filter, funcFactory, $parse){
        var self = this;

        this.visual = {
            navButtsOptions: [
                {
                    type: 'new',
                    callback: function() {
                        $('#createPartnerModal').modal('show');
                    }
                }
            ],
            navTableButts: [
                {
                    type: 'view',
                    callback: function(data) {
                        $state.go('app.partners.view', {id: data.id || data._id});
                    }
                },
                { type: 'remove' }
            ],
            titles: ['Партнёры']
        };
        
        this.data = {partnersList: [], searchQuery: $stateParams.q};
        this.newPartnerData = {inn: '', name: '', delivery_address: '', phone: '', email: ''};
        
        this.addNewPartner = function(){
            serverApi.createPartner(self.newPartnerData, function(result){
                if(!result.data.errors){
                    self.data.partnersList.unshift(result.data);
                    funcFactory.showNotification('Партнёр успешно добавлен', '', true);
                    self.clearNewPartnerData();
                } else {
                    funcFactory.showNotification('Не удалось создать партнёра', result.data.errors);
                }
            });
        };

        this.clearNewPartnerData = function(){
            self.newPartnerData = {inn: '', name: '', delivery_address: '', phone: ''};
        };

        this.getDaDataSuggestions = function(type,val, field_name){
            return serverApi.validateViaDaData(type, {"query": val}).then(function(result){
                return result.data.suggestions.map(function(item){
                    return {label: $parse(field_name)(item) || val, item: item, field: field_name};
                });
            });
        };

        this.fillBySuggestion = function($item, prop){
            var data = $item.item.data,
                addr = self.newPartnerData[prop];

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
                    self.newPartnerData.inn = data.inn;
                    self.newPartnerData.kpp = (data.kpp || "0");
                    self.newPartnerData.legal_name = data.name.short_with_opf;
                    self.newPartnerData.name = (data.name.short || data.name.short);

                    if(data.management !== undefined) {
                        self.newPartnerData.ceo_name = data.management.name;
                        self.newPartnerData.ceo_title = data.management.post;
                    }

                    if(data.address.data !== null && data.address.data !== undefined) {
                        var address = {
                            postal_index: data.address.data.postal_code,
                            region: data.address.data.region_with_type,
                            city: (data.address.data.city || data.address.data.settlement_with_type),
                            street: data.address.data.street_with_type,
                            house: data.address.data.house
                        };

                        self.newPartnerData.legal_address = address;
                        self.newPartnerData.delivery_address = address;
                    }
                    break;
                }
                default :  break;
            }
        };
        
        this.onAddFile = function(){
            //this.parentNode.nextSibling.value = this.value;
        };
    }]);
}());