class ProfileShortcutCtrl {
    constructor($state, $timeout, authService, Observer) {
        this.$state = $state;
        this.$timeout = $timeout;
        this.authService = authService;

        this.shortcutBlock = $('#shortcut');
        let vm = this;
        Observer.subscribe('SHOW_PROFILE_SHORTCUT', this.showShortcutBlock.bind(this));

        $(document).mouseup(e => {
            if (vm.shortcutBlock && !vm.shortcutBlock.is(e.target) && vm.shortcutBlock.has(e.target).length === 0) {
                vm.hideShortcutBlock();
            }
        });
    }

    navigateToProfilePage () {
        let authProfile = this.authService.profile;
        this.$state.go('app.contacts.view', authProfile ? {id: authProfile.user_metadata.contact_id} : null);
        this.$timeout(this.hideShortcutBlock.bind(this), 300);
    }

    hideShortcutBlock() {
        this.shortcutBlock.animate({height: 'hide'}, 300, 'easeOutCirc');
        $('body').removeClass('shortcut-on');
    }

    showShortcutBlock() {
        this.shortcutBlock.animate({height: 'show'}, 200, 'easeOutCirc');
        $('body').addClass('shortcut-on');
    }
}

ProfileShortcutCtrl.$inject = ['$state', '$timeout', 'authService', 'Observer'];

angular.module('app.layout').component('profileShortcut', {
    controller: ProfileShortcutCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/profile-shortcut/profile-shortcut.html'
});
