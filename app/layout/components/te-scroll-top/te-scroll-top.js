class ScrollTopCtrl {
    constructor() {
        this.block = $(this.selector || window);
        let self = this;
        let visibilityHandler = this.setVisibility.bind(this);

        this.block.scroll(visibilityHandler);
        this.$onDestroy = () => self.block.off('scroll', visibilityHandler);
    }

    scrollTop () {
        this.block.scrollTop(0);
    }

    setVisibility () {
        this.visible = this.block.scrollTop() >= 2 * this.block.outerHeight();
    }
}

angular.module('app.layout').component('teScrollTop', {
    bindings: {selector: '@', buttonClass: '@'},
    controller: ScrollTopCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-scroll-top/te-scroll-top.html'
});
