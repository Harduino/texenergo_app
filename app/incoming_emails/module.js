angular.module('app.incoming_emails', ['ui.router'])
    .config($stateProvider => {
        $stateProvider.state('app.incoming_emails', {
            url: '/incoming_emails?q&status',
            data:{
                title: 'Входящие Письма',
                access:{
                    action:'index',
                    params:'IncomingEmail'
                }
            },
            params:{
                q:'',
                id:'',
                status:''
            },
            resolve: {
              profile: function(authService){
                return authService.profilePromise;
              }
            },
            views:{
                "content@app": {
                    template: '<incoming-emails></incoming-emails>'
                }
            }
        }).state('app.incoming_emails.view', {
            url: '/:id',
            data:{
                title: 'Просмотр входящего письма',
                access:{
                    action:'read',
                    params:'IncomingEmail'
                }
            },
            views:{
                "content@app":{
                    template: '<view-incoming-email></view-incoming-email>'
                }
            }
        });
    });
