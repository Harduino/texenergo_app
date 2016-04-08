(function(){
    angular.module('app.quotation_orders').run(['editableOptions', function(editableOptions) {
        editableOptions.theme = 'bs3';

    }]).controller('EditQuotationOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', '$uibModal', '$parse', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, $uibModal, $parse){
        var sc = $scope;
        
        
        sc.data ={
            quotationOrder:{},
            productsList: [], // Используестя при поиске нового товара для добавления. Хранит список найденных.
            selectedProduct: null, // Используется при поиске нового товара для добавления. Хранит выбранный.
            total:0, // Считаем итого в руб по смете
            newLinkFrom: null, // Выбранный объект для связи типа От
            newLinkTo: null // Выбранный объект для связи типа К
        };
        
        
        sc.visual = {
            title: "Рассчет"//window.gon.index.QuotationOrders.indexTitle
        };
        
        
        sc.newElement = {}; // Данные нового элемента для добавления в рассчёт
        
        
        //config для селекта продуктов
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        

        // Загружаем рассчёт с сервера для начала работы
        serverApi.getQuotationOrderDetails($stateParams.id, function(result){
            sc.data.quotationOrder = result.data;
        });
        
        /**
         * Обновляем информацию по заказу
         * Простой отправляем update с новым названием. Например, обновляем название.
         */
        sc.saveQuotationOrderInfo = function(){
            var order = sc.data.quotationOrder,
                data = {
                    quotation_order:{
                        title: order.title
                    }
                };
            serverApi.updateQuotationOrder(order.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+order.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+order.number,true);
            });
        };
        
        /**
         * Следим за изменениями в выбранных товарах. Чтобы при изменении пересчитываем total.
         */
        sc.$watch('data.quotationOrder.equipment', function(values){
            if(values){
                var total = 0;

                values.map(function(item){
                    total += item.product.price * item.quantity;
                });

                sc.data.total = total;
            }
        }, true);
        
        
        
        
        // ЗДЕСЬ ФУНКЦИИ ДЛЯ ПОИСК СВЯЗЕЙ
        
        // Ищёт в Links ПЕРВЫЙ связанный элемент.
        // @param equipment - Товар/строка из комлектации для которого найти элемент.
        // Используем чтобы в таблице показывать связанный элемент. Не очень юзабельно в силу появления схемы.
        sc.findElementByEquipment = function(equipment){
            for(var i=0; i<sc.data.quotationOrder.links.length; i++){
                var q = sc.data.quotationOrder.links[i];
                if(q.from.type==="equipment" && q.from.id===equipment.id && q.to.type==="element"){
                    
                    // Нашли связь в Links. Теперь ищем нужный элемент.
                    for(var j=0; j<sc.data.quotationOrder.elements.length; j++){
                        var element = sc.data.quotationOrder.elements[j];
                        if(element.id == q.to.id){
                            return element;
                        }
                    }
                    
                }
            }
        }
        
        /**
         * Проверяет связан ли данный элемент с каким-либо товаром
         * Для этого он ищет в Links что-то из серии:
         * {from: {type: 'equipment'}, to: {type: 'element', id: 'id нашего элемента'}}
         * Отвечает булевым. Используется для подсвечивания несвязанных элементов
         **/
        sc.isElementLinked = function(element){
            for(var i=0; i<sc.data.quotationOrder.links.length; i++){
                var q = sc.data.quotationOrder.links[i];
                if(q.from.type==="equipment" && q.to.id===element.id && q.to.type==="element"){
                    return true;
                }
            }
            return false;
        };
        
        
        
        
        
        // ЗДЕСЬ ПОДСВЕЧИВАНИЯ И УБИРАНИЯ
        
        // Подсвечивает связанные элементы и товары
        // @param where - Где подсвечивать. Например, equipment или elements
        // @param source - Это элемент для которого в where надо выделить связанные
        // Параметр where может быть "equipment" или "elements". На основании этого определяется противополжный массив
        // В нём ищем связанные вещи и подсвечиваем их
        sc.highlight = function(where, source){
            switch(where){
                case "equipment":
                    for(var i=0; i < sc.data.quotationOrder.links.length; i++){
                        var link = sc.data.quotationOrder.links[i];
                        
                        if(link.from.type==="equipment" && link.to.type==="element" && link.to.id===source.id){
                            for(var j=0; j < sc.data.quotationOrder.equipment.length; j++){
                                var equipment_row = sc.data.quotationOrder.equipment[j];
                                if(equipment_row.id === link.from.id){
                                    equipment_row.highlight = true;
                                }
                            }
                        }
                    }
                    break;
                case "elements":
                    for(var i=0; i < sc.data.quotationOrder.links.length; i++){
                        var link = sc.data.quotationOrder.links[i];
                        
                        if(link.from.type==="equipment" && link.to.type==="element" && link.from.id===source.id){
                            for(var j=0; j < sc.data.quotationOrder.elements.length; j++){
                                var element = sc.data.quotationOrder.elements[j];
                                if(element.id === link.to.id){
                                    element.highlight = true;
                                }
                            }
                        }
                    }
                    break;
                default:
                    alert("Hightlight default case");
            }
        }
        
        // Снимает подсвечение
        // @param where - таблица где снять подсвеченивание. Например, 'equipment' или 'elements'
        // where используется для определения противоположного массива. Сбрасывает все записи на невыделенные. 
        sc.unhighlight = function(where){
            switch(where){
                case "equipment":
                    for(var i=0; i < sc.data.quotationOrder.equipment.length; i++){
                        sc.data.quotationOrder.equipment[i].highlight = false;
                    }
                    break;
                case "elements":
                    for(var i=0; i < sc.data.quotationOrder.elements.length; i++){
                        sc.data.quotationOrder.elements[i].highlight = false;
                    }
                    break;
                default:
                    alert("Unhighlight default case");
            }
        }
        
        // Сворачивает все несвязанные строки в обоих таблицах
        // @param initiator - На кого кликнули. Для него найти все НЕ связанные строки и их свернуть
        // @param initiator_type - Его типа equipment или element. Это удобства поиска в массивах.
        // Работает только для связей, когда товар завязан на элемент.
        // Если таблицы большие, то сложно визуально найти. Поэтому сворачиваем в обоих таблицах.
        sc.hideTableRows = function(initiator, initiator_type){
            
            // Сначала все строки разворачиваем. Если такие есть.
            for(var i=0; i < sc.data.quotationOrder.equipment.length; i++){
                sc.data.quotationOrder.equipment[i].hidden = false;
            }
            for(var i=0; i < sc.data.quotationOrder.elements.length; i++){
                sc.data.quotationOrder.elements[i].hidden = false;
            }
            
            // Если надо отменить уже существующее свертывания, тогда делаем отметку и выходим из функции.
            // Иначе, делаем пометку на будущее и поехали!
            if(initiator.hideIndependentRows){
                initiator.hideIndependentRows = false;
                return;
            } else {
                initiator.hideIndependentRows = true;
            }
            
            // А вот и сама реализация
            // Сначала делаем переменные, куда будем складывать результаты для последующего сворачивания.
            var equipment_ids = [];
            var element_ids = [];

            // Бежим по всем записям и добавляем их в список для 'важных'
            switch(initiator_type){
                case 'equipment':
                    for(var i=0; i < sc.data.quotationOrder.links.length; i++){
                        var l = sc.data.quotationOrder.links[i];
                        if(l.from.type==="equipment" && l.to.type==="element" && l.from.id===initiator.id){
                            equipment_ids.push(l.from.id);
                            element_ids.push(l.to.id);
                        }
                    }
                    break;
                case 'element':
                    for(var i=0; i < sc.data.quotationOrder.links.length; i++){
                        var l = sc.data.quotationOrder.links[i];
                        if(l.from.type==="equipment" && l.to.type==="element" && l.to.id===initiator.id){
                            equipment_ids.push(l.from.id);
                            element_ids.push(l.to.id);
                        }
                    }
                    break;
                default:
                    alert("hideTableRows default case");
            }
            
            // Бежим по всем товарам. Если товара нет в списке 'важных', то прячем его.
            for(var i=0; i < equipment_ids.length; i++){
                for(var j=0; j < sc.data.quotationOrder.equipment.length; j++){
                    if(equipment_ids[i]===sc.data.quotationOrder.equipment[j].id) {
                        sc.data.quotationOrder.equipment[j].hidden = false;
                    } else {
                        sc.data.quotationOrder.equipment[j].hidden = true;
                    }
                }
            }

            // Бежим по всем элементам. Если элемента нет в списке важных, то прячем его.
            for(var i=0; i < element_ids.length; i++){
                for(var j=0; j < sc.data.quotationOrder.elements.length; j++){
                    if(element_ids[i]===sc.data.quotationOrder.elements[j].id) {
                        sc.data.quotationOrder.elements[j].hidden = false;
                    } else {
                        sc.data.quotationOrder.elements[j].hidden = true;
                    }
                }
            }
        }
        
        
        
        
        
        // ЗДЕСЬ ДОБАВЛЕНИЕ НОВЫЙ ЭЛЕМЕНТОВ И КОМПЛЕКТАЦИЙ
        // Общий метод для создания связи
        // @param f - От from. Берёт строку комплектации или элемент и ищёт её id.
        // @param t - От to. Дальше аналогично f.
        // @param value - Не используется. В будущем здесь может быть что угодно. Например, свойство или комментарий.
        // id у всех уникальные. Поэтому сервер уже сам разбирается что к чему относится.
        sc.addNewLink = function(f, t, value) {
            var dataForNewLink = {
                add_link: {
                    from: (f.id || f._id),
                    to: (t.id || t._id)
                }
            };
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, dataForNewLink, function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.links.push(result.data);
                    return result.data;
                } else if (result.data.errors !== undefined) {
                    funcFactory.showNotification("Неудача", result.data.errors);
                    return undefined;
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить связь');
                    return undefined;
                }
            });
        }
        
        // Функция для добавления нового элемента
        // Вроде ничего хитрого.
        sc.addNewElement = function(e, invalid){
            if(e.type == "click" && !invalid){
                var data = {
                    add_element: {
                        description: sc.newElement.description,
                        schema_code: sc.newElement.schema_code,
                        comment: sc.newElement.comment
                    }
                };
                serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                    if(result.status == 200 && !result.data.errors){
                        sc.data.quotationOrder.elements.push(result.data);
                        sc.newElement = {};
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                    }
                });
            }
        }

        // Используется в двух местах ниже - есть создание товара из двух же разных мест.
        // Возвращает запрос, понятный сервер для добавления товара.
        // В будущем будем рефакторить.
        function addNewEquipmentRequest(p){
            var dataForNewEquipment = {
                add_equipment: {
                    product_id: (p.id || p._id),
                    quantity: 1
                }
            };
            return dataForNewEquipment;
        }
        
        /**
         * Добавляем новую комплектацию. Прямо подобором из обычного поиска товаров в рассчёте.
         * @param createElement - Boolean. Если истина, то кроме самого товара ещё создать и связанный с ним элемент.
         * Вроде ничего хитрого
         */
        sc.addNewEquipment = function(product){
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, addNewEquipmentRequest(product), function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.equipment.push(result.data);
                    sc.data.selectedProduct = null;
                    return result.data;
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить строку комплектации');
                    return undefined;
                }
            });
        };


        /**
         * Кликаем на плюсик элемента и создаём для него товар.
         * Добавляем новый товар, но, в отличие от addNewEquipment, из уже имеющегося элемента.
         * Отличие от обычного в том, что элемент уже есть и новый товар просто к нему привязывается.
         * Берёт элемент для которого надо создать товар. Сам товар лежит в select2-ском selectedProduct.
         * 
         * Форма для подбора открывается в модальном окне. Человек может забыть с каким элемент имеет дело. Поэтому подсвечиваем рабочий элемент.
         * При закрытии модального окна снимаем выделение элемента.
         * После добавления товара отправляется запрос на создание связи между товаром и элементом
         */
        sc.createAndAppendProductToElement = function(element){
            var modalInstance = $uibModal.open({
                templateUrl: 'eqoChangeEquipmentModal.tmpl.html',
                controller: 'EqoChangeEquipmentModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve:{
                    product: null,
                    config: {
                        title: 'Добавить товар',
                        btnOkText: 'Добавить',
                        btnCancelText: 'Отмена',
                        searchText: element.comment
                    }
                }
            });
           
            element.highlight = true;

            modalInstance.result.then(function (selectedProduct) {
                var newProduct;
                var match = (element.comment||"").match(/(\d+)\s*шт/i);
                selectedProduct.element_id = element.id;
                if(match !== null){
                    selectedProduct.quantity = parseInt(match[1]);
                }

                serverApi.updateQuotationOrder(sc.data.quotationOrder.id, addNewEquipmentRequest(selectedProduct), function(result){
                    if(result.status == 200 && !result.data.errors){
                        sc.data.quotationOrder.equipment.push(result.data);
                        sc.data.selectedProduct = null;
                        if (result.data.id !== undefined) {
                            sc.addNewLink(result.data, element, {});
                        }
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось добавить строку комплектации');
                    }
                });
            });
           
            modalInstance.closed.then(function(){
                element.highlight = !element.highlight;
            })
        };

        // Устанавливает текущей выбранный элемент или строку комплектации для создания связи.
        sc.setNewLinkFrom = function(item){
            sc.newLinkFrom = {id: item.id, name: (item.description || item.product.name)};
        }

        // Устанавливает текущей выбранный элемент или строку комплектации для создания связи.
        sc.setNewLinkTo = function(item){
            sc.newLinkTo = {id: item.id, name: (item.description || item.product.name)};
        }

        // Отправляет запрос на сервер для создания связи
        // Сбрасывает выбранные вне зависимости от ответа сервера. Это плохо?
        sc.linkItems = function(){
            sc.addNewLink(sc.newLinkFrom, sc.newLinkTo, {});
            sc.newLinkFrom = null;
            sc.newLinkTo = null;
        }
        
        
        
        // ЗДЕСЬ ОБНОВЛЕНИЕ И УДАЛЕНИЕ УЖЕ СУЩЕСТВУЮЩИХ
        
        
        /**
         * Обновляем информацию по заказу
         * Простой отправляем update с новым названием
         */
        sc.saveQuotationOrderInfo = function(){
            var order = sc.data.quotationOrder,
                data = {
                    quotation_order:{
                        title: order.title
                    }
                };
            serverApi.updateQuotationOrder(order.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Рассчёт успешно отредактирован', true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать рассчёт', true);
            });
        };
        
        /**
         * Обновляем существующий элемент. Вроде всё просто.
         */
        sc.saveElementChange = function(element){
            var data = {
                update_element: {
                    id: element.id,
                    schema_code: element.schema_code,
                    comment: element.comment,
                    description: element.description
                }
            };
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    for(var i=0; i < sc.data.quotationOrder.elements.length; i++) {
                        if (sc.data.quotationOrder.elements[i] == result.data.id) {
                            sc.data.quotationOrder.elements[i] = result.data;
                            funcFactory.showNotification("Удача", "Обновил элемент", true);
                            break;
                        }
                    }
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                }
            });
        };
        
        /**
         * Обновляем строку комплектации. Вроде всё просто.
         * Напрямую можно обновлять только количество
         */
        sc.saveEquipmentChange = function(item){
            var data = {
                update_equipment: {
                    id: item.id,
                    quantity: item.quantity
                }
            };
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    for(var i=0; i < sc.data.quotationOrder.equipment.length; i++) {
                        if (sc.data.quotationOrder.equipment[i].id == result.data.id) {
                            sc.data.quotationOrder.equipment[i] = result.data;
                            funcFactory.showNotification("Удача", "Обновил товар", true);
                            break;
                        }
                    }
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                }
            });
        };
        
        // Удаляем существующий элемент. Вроде всё просто.
        // Если сервер возвращает нам объект links, то значит, что какие-то связи были удалены.  А links содержит актуальные связи.
        sc.removeElement = function(item, index){
            var data = {
                remove_element: {
                    id: item.id
                }
            };
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.elements.splice(index, 1);
                    
                    // Сбрасываем все связи на новые если сервер и передал
                    if(result.data.links !== undefined) {
                        sc.data.quotationOrder.links = result.data.links;
                    }

                    funcFactory.showNotification("Удача", "Удалил элемент", true);
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                }
            });
        };
        
        /**
         * Удаляем строку комплектации
         * Если есть связанный по-умолчанию элемент, то и его тоже удаляем
         * Если сервер возвращает нам объект links, то значит, что какие-то связи были удалены.  А links содержит актуальные связи.
         */
        sc.removeEquipment = function(item, index){
            var data = {
                remove_equipment: {
                    id: item.id
                }
            };
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.equipment.splice(index, 1);
                    
                    /**
                     * Ищем и удаляем связанные элементы
                     */
                    for(var i=0; i<sc.data.quotationOrder.elements.length; i++){
                        if(sc.data.quotationOrder.elements[i].description===('Для '+item.product.name)) {
                            sc.removeElement(sc.data.quotationOrder.elements[i], i);
                        }
                    }

                    // Сбрасываем все связи на новые если сервер и передал
                    if(result.data.links !== undefined) {
                        sc.data.quotationOrder.links = result.data.links;
                    }
                    
                    funcFactory.showNotification("Удача", "Удалил товар", true);
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось удалить товар');
                }
            });
        };


        /**
         * Удаляем связь. Требуется только её id
         */
        sc.removeLink = function(link, index){
            var data = {
                remove_link: {
                    id: link.id
                }
            };
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.links.splice(index, 1);
                    funcFactory.showNotification("Удача", "Удалил связь", true);
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось удалить связь');
                }
            });
        }
        
        /**
         * Открываем модальное окно, чтобы заменить товар в Комплектации на другой
         * Opens modal window with ability to change product of Product item.
         * @param p - product
         */
        sc.changeEquipmentModal = function(e){
            var modalInstance = $uibModal.open({
                templateUrl: 'eqoChangeEquipmentModal.tmpl.html',
                controller: 'EqoChangeEquipmentModalCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product : e.product,
                    config: {}
                }
            });

            modalInstance.result.then(function (selectedProduct) {
                // Заменяем товар в комплектации и сохраняем на сервере.
                // Пока оставляю здесь. Когда код устаканится, тогда буду рефакторить.
                var data = {
                    update_equipment: {
                        id: e.id,
                        product_id: (selectedProduct._id || selectedProduct.id)
                    }
                };
                serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                    if(result.status == 200 && !result.data.errors){
                        for(var i=0; i < sc.data.quotationOrder.equipment.length; i++) {
                            if (sc.data.quotationOrder.equipment[i].id == result.data.id) {
                                sc.data.quotationOrder.equipment[i] = result.data;
                                funcFactory.showNotification("Удача", "Обновил товар", true);
                                break;
                            }
                        }
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                    }
                });
            });
        };
    }]).controller("EqoChangeEquipmentModalCtrl", ['$scope', '$uibModalInstance', 'serverApi', 'product', 'config', function($scope, $uibModalInstance, serverApi, product, config){
        var sc = $scope;

        /**
         * Для удобства работы подставляет в поиск товара его описание. Если такое описание есть.
         * Иногда в описании есть количество. Убираем его регексом.
         */
        sc.initProdSelect = function(){
            if(config.searchText){
                var x = config.searchText.replace(/\s*\d+\s*шт/i,"")
                angular.element('#eqo_cp_modal_p_select').data().$uiSelectController.search = x;
            }
        };

        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.data = {
            selectedProduct: product,
            productsList: []
        };
        sc.config = angular.extend({
            title: 'Изменить товар',
            btnOkText: 'Изменить',
            btnCancelText: 'Отмена'
        }, config);

        sc.ok = function () {
            $uibModalInstance.close(sc.data.selectedProduct);
        };

        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
})