(function () {

    "use strict";

    angular.module('app.layout').directive('fullScreen', function(){
        return {
            restrict: 'E',
            link: function(scope, element){
                var $body = $('body');

                element.on('click', function () {
                    if ($body.hasClass("full-screen")) {
                        $body.removeClass("full-screen");

                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                    } else {
                        $body.addClass("full-screen");

                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        }
                    }
                });
            }
        }
    });
}());
