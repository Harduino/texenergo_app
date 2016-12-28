class FullScreenCtrl {
    constructor() {
        this.$body = $('body');
    }

    toggleFullScreen() {
        if (this.$body.hasClass('full-screen')) {
            this.$body.removeClass('full-screen');
            FullScreenCtrl.disableFullScreen();
        } else {
            this.$body.addClass('full-screen');
            FullScreenCtrl.enableFullScreen();
        }
    }

    static enableFullScreen() {
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

    static disableFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

angular.module('app.layout').component('fullScreen', {
    controller: FullScreenCtrl,
    controllerAs: 'fullScreenCtrl',
    templateUrl: '/app/layout/components/full-screen/full-screen.html'
});
