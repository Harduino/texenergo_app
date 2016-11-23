/**
 * Created by Egor Lobanov on 08.11.15.
 * Директива создающая кнопки навигации на основе прав пользователя и наличия тех или иных кнопок на странице
 */
(function(){

    'use strict';

    angular.module('app.layout').directive('formNavButtons', ['$templateCache', function($templateCache){
        return {
            restrict: 'E',
            scope:{
                role: '=',
                options:'=',//список кнопок которые необходимо отобразить
                subdata: '=', // модель или данные которые необходимо вернуть в хендлер клика
                template: '@'
            },
            link: function(scope, element, attrs){
                var temp = [];
                var options = scope.options;
                var roles = scope.role || {};
                var buttons = {
                    new:{name: 'Новый', ico: 'plus'},
                    show: {name:'Смотреть', ico:'search'},
                    edit:{name:'Изменить',ico:'pencil'},
                    files:{name:'Файлы', ico:'file'},
                    recalculate:{name:'Пересчитать', ico:'repeat', role:'can_edit'},
                    send_email:{name:'Отправить', ico:'envelope'},
                    logs:{name:'История', ico:'book'},
                    confirm_order:{ico:'check'/*, role:'can_confirm'*/},
                    view: {ico:'eye', class:'btn-info', disabled:false},
                    remove:{ico:'trash-o', class: 'btn-danger', role:'can_destroy', disabled:true},
                    table_edit:{ico:'pencil', class:'btn-default', role:'can_edit', disabled:true},
                    back:{name:'К списку', ico:'arrow-left'},
                    upd_form_pdf:{name:'УПД', ico:'file-pdf-o'},
                    txt_export: {name: "Текст", ico: 'file-text'},
                    label_pdf:{name:'Бирка', ico:'truck'},
                    packing_list_pdf:{name:'Упаковочный лист', ico:'list-ol'},
                    at_partners:{name:'У партнёров', ico:'exchange'},
                    automatically: {name: 'Автоматически', ico: 'rocket'},
                    add: {ico: "plus", class: 'btn-success', name: "В заказ"},
                    refresh: {ico: "refresh", name: "Обновить"},
                    command: {ico: "keyboard-o", name: "Комманды"}
                };

                var btnClass = attrs.contentClass || 'btn btn-success';

                buildButtons();

                if(attrs.subdata ){
                    scope.$watch('subdata', function(value){
                        value && Object.keys(Object(value)).length>0 && buildButtons();
                    });
                } else buttons = roles = null;

                function buildButtons(){
                    temp = [];
                    //пробегаемся по списку кнопок и проверяем существуют ли настроки для кнопки
                    if(angular.isArray(options) && options.length>0) {
                        options.map(function(item){
                            var btn = buttons[item.type],
                                role = btn.role;
                            if(btn){
                                btn.callback = item.callback;
                                btn.class = btnClass + ' ' + (btn.class || '');
                                if(btn.hasOwnProperty('disabled') && role && roles[role]){
                                    btn.disabled = !roles[role];
                                }

                                if(item.type === 'confirm_order') {
                                    createConfirmOrderControls(scope.subdata, btn, temp);
                                    return 0;
                                }

                                temp.push(btn);
                            }
                        });
                    }
                    scope.buttons = temp;
                }

                function createConfirmOrderControls(data, button, btnList){
                    var events = data ? data.events : null;
                    events && angular.isArray(events) && events.map(function(item){
                        var btn= angular.extend(item, button);
                        btnList.push(btn);
                    });
                }

                scope.buttonClick = function(item){
                    //вызываем callback кнопки
                    !item.disabled && item.callback && item.callback(scope.subdata, item);
                }
                
                scope.showText = function(){
                    return (scope.template === undefined) || (scope.template !== "table");
                    
                }
                
            },
            template: $templateCache.get('formNavButtons.tmpl.html')
        }
    }]);
}());
