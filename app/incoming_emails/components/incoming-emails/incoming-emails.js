class IncomingEmailsCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.state = $state;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;
        this.incomplete = $state.params.status === 'incomplete';
        this.accomplished = $state.params.status === 'accomplished';

        this.visual = {
            navButtsOptions:[
                {type: 'refresh', callback: () => $state.go('app.incoming_emails', {}, {reload: true})}
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.incoming_emails.view', { id: item.data.id })
                },
                {
                    type: 'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить входящее письмо?',
                            content: 'Вы действительно хотите удалить входящее письма ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);

                                serverApi.deleteIncomingEmail(item.data.id, result => {
                                    if(!result.data.errors) {
                                        self.data.incomingEmailsList.splice(item.index, 1);
                                        funcFactory.showNotification('Письмо от ' + item.data.from + ' успешно удалено.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить письмо ' + item.data.from,
                                            result.data.errors);
                                    }

                                    button.disableOnLoad(false, $event);
                                }, () => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Входящие письма']
        };

        this.data = { incomingEmailsList:[], searchQuery: $stateParams.q };
        this.funcFactory.setPageTitle("Входящие письма");

        /**
        * @description Возвращает данные для листа.
        * @param {Int} pageNumber номер страницы
        * @param {String} searchQuery поисковый запрос
        * @param {Object} options опции запроса к серверу
        * @param {Function} callback вернуть в нем данные для последующего отображения
        */
        this.fetch = (pageNumber, searchQuery, options, callback) => {

          // Добавляем статус к запросу
          if(this.state.params.status){
            options.additionalParams = {
              status: this.state.params.status
            };
          }

          self.serverApi.getIncomingEmails(pageNumber, searchQuery, options, (result) => {
            let emails = result.data;

            // Проверяем есть ли отправитель письма в контактах
            if(emails && emails.length){
              for(let item of emails){
                // Помечаем как внутренний если from объект
                item.internalEmail = angular.isObject(item.from);
              }
            }

            callback(result);
          });
        }
    }

    /**
    * @description reload state passing filtering parameters
    * @param {String} on - filter that should be on
    * @param {String} off - filter that should be off
    */
    reloadState(on, off){
      if(this.incomplete || this.accomplished){

        this.state.params.status = on;
        this[off] = false;

      }else this.state.params.status = undefined;

      this.state.go('app.incoming_emails', this.state.params, {reload:true});
    }

}

IncomingEmailsCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.incoming_emails').component('incomingEmails', {
    controller: IncomingEmailsCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/incoming_emails/components/incoming-emails/incoming-emails.html'
});
