class FormNavButtonsCtrl {
    constructor() {
        this.showText = (this.template === undefined) || (this.template !== 'table');

        const AVAILABLE_BUTTONS = {
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
            txt_export: {name: 'Текст', ico: 'file-text'},
            label_pdf:{name:'Бирка', ico:'truck'},
            packing_list_pdf:{name:'Упаковочный лист', ico:'list-ol'},
            at_partners:{name:'У партнёров', ico:'exchange'},
            automatically: {name: 'Автоматически', ico: 'rocket'},
            add: {ico: 'plus', class: 'btn-success', name: 'В заказ'},
            refresh: {ico: 'refresh', name: 'Обновить'},
            command: {ico: 'keyboard-o', name: 'Комманды'}
        };

        let self = this;
        let roles = this.role || {};
        this.buttons = [];
        //пробегаемся по списку кнопок и проверяем существуют ли настроки для кнопки
        if (angular.isArray(this.options) && this.options.length > 0) {
            this.options.map(item => {
                let button = AVAILABLE_BUTTONS[item.type], role = button.role;

                if (button) {
                    button.callback = item.callback;
                    button.class = (self.contentClass || 'btn btn-success') + ' ' + (button.class || '');

                    if(button.hasOwnProperty('disabled') && role && roles[role]) {
                        button.disabled = !roles[role];
                    }

                    if(item.type === 'confirm_order') {
                        return self.createConfirmOrderControls(button);
                    }

                    button.prototype.disable = function(disabled, $event){
                      var $elem = $($event.currentTarget || $event.srcElement);
                      if(disabled){
                        $elem.attr('disabled', 'disabled');
                      }else{
                        $elem.removeAttr('disabled');
                      }
                    };
                    self.buttons.push(button);
                }
            });
        }
    }

    /**
    * @description Handle click on nav-button
    * @param {Object} button - data of button
    * @param {event} $event - event
    */
    handleClick (button, $event) {
        !button.disabled && button.callback && button.callback(this.subdata, button, $event);
    }

    createConfirmOrderControls (button) {
        if(this.subdata && this.subdata.events && angular.isArray(this.subdata.events)) {
            let self = this;
            self.subdata.events.map(event => self.buttons.push(angular.extend(event, button)));
        }
    }
}

angular.module('app.layout').component('formNavButtons', {
    bindings: {
        role: '=',
        options:'=',//список кнопок которые необходимо отобразить
        subdata: '=', // модель или данные которые необходимо вернуть в хендлер клика
        contentClass: '@',
        template: '@'
    },
    controller: FormNavButtonsCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/form-nav-buttons/form-nav-buttons.html'
});
