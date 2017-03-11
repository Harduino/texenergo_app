/**
 * Created by Egor Lobanov on 08.11.15.
 * Директива создающая кнопки навигации на основе прав пользователя и наличия тех или иных кнопок на странице
 */
(function(){
    'use strict';

    angular.module('app.layout').component('formNavButtons', {
        bindings: {
            role: '=',
            options:'=',//список кнопок которые необходимо отобразить
            subdata: '=', // модель или данные которые необходимо вернуть в хендлер клика
            contentClass: '@',
            template: '@'
        },
        controller: function() {
            var self = this;
            var roles = this.role || {};
            this.showText = (this.template === undefined) || (this.template !== 'table');

            var AVAILABLE_BUTTONS = {
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

            this.buttons = [];
            //пробегаемся по списку кнопок и проверяем существуют ли настроки для кнопки
            if (angular.isArray(this.options) && this.options.length > 0) {
                this.options.map(function(item) {
                    var button = AVAILABLE_BUTTONS[item.type], role = button.role;

                    if (button) {
                        button.callback = item.callback;
                        button.class = (self.contentClass || 'btn btn-success') + ' ' + (button.class || '');

                        if(button.hasOwnProperty('disabled') && role && roles[role]) {
                            button.disabled = !roles[role];
                        }

                        if(item.type === 'confirm_order') {
                            createConfirmOrderControls(self.subdata, button, self.buttons);
                            return 0;
                        }

                        self.buttons.push(button);
                    }
                });
            }

            var createConfirmOrderControls = function (data, button, btnList) {
                if(data && data.events && angular.isArray(data.events)) {
                    data.events.map(function(event) {
                        btnList.push(angular.extend(event, button));
                    });
                }
            };

            this.handleClick = function (button) {
                !button.disabled && button.callback && button.callback(self.subdata, button);
            };
        },
        controllerAs: '$ctrl',
        templateUrl: 'app/layout/components/form-nav-buttons/form-nav-buttons.html'
    });
}());
