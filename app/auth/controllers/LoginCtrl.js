/**
 * Created by Egor Lobanov on 31.01.16.
 * Controller of Sign in page
 */
(function(){
    angular.module('login').controller('loginCtrl', ['authService', function(authService){

        authService.login();

//        sc.loginData = {
//            user: {email:  '', password: ''}
//        };
//        sc.restoreData = {
//            user: {email: ''}
//        };
//        sc.forgotPass = false;
//        sc.authError=false;
//        sc.passRestored = false;
//
//        sc.flipForm = function(flip){
//            sc.forgotPass = flip;
//            sc.authError = false;
//            sc.passRestored = false;
//        };
//
//        sc.restorePass = function(){
//            serverApi.resetPassword(sc.restoreData, function(result){
//                sc.authError = false;
//                sc.passRestored = true;
//            }, function(error){
//                funcFactory.showNotification('Не удалось восстановить пароль', 'Пользователь не существует!');
//            });
//        };
//
//        sc.submit = function(){
//            sc.authError = false;
//            serverApi.signIn(sc.loginData, function(result){
//                window.authorized = result.data.id;
//                $state.go('app.dashboard');
//            }, function(error){
//                sc.authError = true;
//            });
//        };
    }]);
}());