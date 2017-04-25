class FormNavButtonsCtrl {
    constructor($parse) {
        this.showText = (this.template === undefined) || (this.template !== 'table');
        this.$parse = $parse;

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

        this.whaitForChanges = false;
        this.buttons;

        this.buildButtons = function(){

          //пробегаемся по списку кнопок и проверяем существуют ли настроки для кнопки
          if (angular.isArray(this.options) && this.options.length > 0) {
              // clear buttons
              this.buttons = [];

              this.options.map(item => {
                  let button = AVAILABLE_BUTTONS[item.type], role = button.role;

                  if (button) {
                      button.callback = item.callback;
                      button.class = (self.contentClass || 'btn btn-success') + ' ' + (button.class || '');

                      if(button.hasOwnProperty('disabled') && role && roles[role]) {
                          button.disabled = !roles[role];
                      }

                      button.disableOnLoad = function(disabled, $event){
                        var $elem = $($event.currentTarget || $event.srcElement);
                        if(disabled){
                          $elem.attr('disabled', 'disabled')
                          .addClass('no-events');
                          this.isDisabledOnLoad = true;
                        }else{
                          $elem.removeAttr('disabled')
                          .removeClass('no-events');
                          this.isDisabledOnLoad = false;
                        }
                      };

                      if(item.type === 'confirm_order') {
                          this.whaitForChanges = true;
                          return self.createConfirmOrderControls(button);
                      }

                      self.buttons.push(button);
                  }
              });
          }
        }

        this.buildButtons();
    }

    /**
    * @description Handle click on nav-button
    * @param {Object} button - data of button
    * @param {event} $event - event
    */
    handleClick (button, $event) {
        !button.disabled && !button.isDisabledOnLoad && button.callback && button.callback(this.subdata, button, $event);
    }

    createConfirmOrderControls (button) {
        if(this.subdata && this.subdata.events && angular.isArray(this.subdata.events)) {
            let self = this;
            self.subdata.events.map(event => self.buttons.push(angular.extend(event, button)));
        }
    }

    $onChanges(changes){
      // ждать изменений если нужно
      // сейчас используется только для subdata в случае ConfirmOrderControls
      // если необходимо можно отслеживать изменения любого поля модели
      if(this.whaitForChanges && this.$parse('subdata.currentValue.events')(changes)){
        this.buildButtons();
      }
    }
}

FormNavButtonsCtrl.$inject = ['$parse'];

angular.module('app.layout').component('formNavButtons', {
    bindings: {
        role: '=',
        options:'<',//список кнопок которые необходимо отобразить
        subdata: '<', // модель или данные которые необходимо вернуть в хендлер клика
        contentClass: '@',
        template: '@',
        whaitForChanges: '@'
    },
    controller: FormNavButtonsCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/form-nav-buttons/form-nav-buttons.html'
});
