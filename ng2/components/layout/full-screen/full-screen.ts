import { Component } from '@angular/core';

@Component({
    selector: 'full-screen',
    templateUrl: '/ng2/components/layout/full-screen/full-screen.html'
})

export class FullScreenComponent {
    $body: any;

    constructor() {
        this.$body = document.getElementsByTagName('body')[0];
    }

    toggleFullScreen() {
        if (this.$body.classList.contains('full-screen')) {
            this.$body.classList.remove('full-screen');
            FullScreenComponent.disableFullScreen();
        } else {
            this.$body.classList.add('full-screen');
            FullScreenComponent.enableFullScreen();
        }
    }

    static enableFullScreen() {
        [
            'requestFullscreen',
            'mozRequestFullScreen',
            'webkitRequestFullscreen',
            'msRequestFullscreen'
        ].forEach(enableFullScreenMode => {
            if (document.documentElement[enableFullScreenMode]) {
                return document.documentElement[enableFullScreenMode]();
            }
        });
    }

    static disableFullScreen() {
        ['exitFullscreen', 'mozCancelFullScreen', 'webkitExitFullscreen'].forEach(disableFullScreenMode => {
            if (document[disableFullScreenMode]) {
                return document[disableFullScreenMode]();
            }
        });
    }
}
