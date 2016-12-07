/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function(){

        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', 'CanCan', '$uibModal', '$filter', '$localStorage', function(sc, $stateParams, $location, $state, serverApi, CanCan, $uibModal, $filter, $localStorage){

            sc.data = {
                searchText: decodeURIComponent($stateParams.searchString), //содержимое сроки поиска в топ меню
                searchList: [], // массив с результатами поиска
                subSearch: {}
            };
            sc.visual = {
                //контролы таблицы
                navButtsOptions:[
                    {type:'add', callback: addProductToCustomerOrderModal},
                    {type:'view', callback: viewProduct }
                ],
                role:{
                    can_destroy: CanCan.can('Product', 'destroy')
                }
            };

            sc.selectedRowIndex = -1;

            //add keydown listener to handle navigation inside results table
            angular.element(window).on('keydown', navigateInTable);

            sc.searchProduct = function(pageNumber, query, options, callback){
                serverApi.getSearch(pageNumber, query, options, callback);
                serverApi.getSubSearch(query, options, function(result){
                    sc.data.subSearch = result.data;
                    var s = sc.data.subSearch;
                    s.hasOwnProperty('properties') && angular.forEach(s.properties, function(item){
                        if(item.hasOwnProperty('min') && item.hasOwnProperty('max')) {
                            item.from = item.min * 1.2;
                            item.to = item.max * 0.8;
                            item.uiElement = {
                                type: "double",
                                min: item.min,
                                max: item.max,
                                from: item.from,
                                to: item.to,
                                grid: true,
                                step:1,
                                onFinish: function(data){
                                    item.from = data.from;
                                    item.to = data.to;
                                },
                                prettify: function (num){
                                    return $filter('number')(num, 2);
                                }
                            };
                        }
                    });
                });
            };

            sc.searchByFunctor = function(){
                var s = sc.data.subSearch;

                if (yaCounter7987369 != undefined){
                    yaParams = {};
                    if ($localStorage && $localStorage.profile && $localStorage.profile.user_metadata) {
                        yaParams.user_email = $localStorage.profile.user_metadata.email;
                        yaParams.user_id = $localStorage.profile.user_metadata.contact_id;
                    }
                    yaCounter7987369.reachGoal("FunctorUsed", yaParams)
                }

                if(s.hasOwnProperty('properties')){

                    var props= '';

                    sc.searchProduct = null;

                    angular.forEach(s.properties, function(item){
                        var t = '&properties['+item.name+']';
                        if(item.hasOwnProperty('max') && item.hasOwnProperty('min')){
                            props += t + '[min]=' + item.from.toFixed(2) + t + '[max]=' + item.to.toFixed(2);
                        }
                        if(item.hasOwnProperty('options')){
                            if(item.val !== undefined)
                            props += t + '=' + item.val;
                        }
                    });

                    serverApi.getSearchFunctor(s.name, props, function(result){
                        if(result.status === 200){
                            sc.data.searchList = result.data;
                        }
                    });
                }
            };

            sc.selectRow = function(index){
                sc.selectedRowIndex = index;
            };

            /**
             * Открываем модальное окно, чтобы открыть список заказов и добавить товар
             * @param p - product
             */
            function addProductToCustomerOrderModal(product_id){
                $uibModal.open({
                    templateUrl: 'app/layout/partials/productToCustomerOrder.html',
                    controller: 'productToCustomerOrderModalCtrl',
                    windowClass: 'eqo-centred-modal',
                    resolve: {
                        product : {id: product_id}
                    }
                });
            }

            /**
             * Открывает view с просмотром информации о продукте
             * @param id - id продукта информацию по которому необходимо посмотреть
             */
            function viewProduct(id){
                $state.go('app.product', {id: id});
            }

            /**
             * Navigate inside the table via arrows.
             * Handler of keydown event.
             * If Enter pressed, then open product view
             * @param event
             */
            function navigateInTable (event){

                const up = 38;
                const enter = 13;
                const escape = 27;
                const down = 40;
                var key = event.keyCode,
                    list = sc.data.searchList,
                    _window = angular.element(window),
                    scrollTop = _window.scrollTop(),
                    outerHeight = _window.outerHeight() + scrollTop;


                if((key === up || key === down) && list.length>0){
                    //select row first time
                    if(sc.selectedRowIndex<0){
                        sc.selectedRowIndex = 0;
                    }else{
                        var step = key === up ? -1 : 1,
                            newIndex = sc.selectedRowIndex + step;

                        if(newIndex >-1 && newIndex<sc.data.searchList.length){
                            sc.selectedRowIndex = newIndex;

                            const selectedIndexPosition = angular.element('#top_search_table_body>tr').eq(sc.selectedRowIndex).offset();

                            if(selectedIndexPosition.top > outerHeight){
                                _window.scrollTop(_window.scrollTop() + 200, 1000);
                            }

                            if(selectedIndexPosition.top < scrollTop){
                                _window.scrollTop(_window.scrollTop() - 200, 1000);
                            }
                        }
                    }
                    //on hit Enter
                }else if(key === enter && list.length>0 && sc.selectedRowIndex > -1){

                    var selectedRow = list[sc.selectedRowIndex];
                    viewProduct(selectedRow._id || selectedRow.id);

                    // on Escape blur input
                } else if(key === escape && event.target.localName === 'input'){
                    event.target.blur();
                }
            }

            //clear resources before scope will be destroyed
            sc.$on('$destroy', function(){
                angular.element(window).off('keydown', navigateInTable);
            });
        }]);
}());
