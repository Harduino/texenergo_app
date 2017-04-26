class JarvisWidgetGridCtrl {
    static getWidgetId (widget) {
        return widget.attr('id');
    }

    constructor(Observer) {
        this.element = $('#' + this.for);
        this.widgetIds = [];
        Observer.subscribe('jarvisWidgetAdded', this.addWidget.bind(this));
        this.$onDestroy = this.destroyWidgets.bind(this);
    }

    addWidget (widget) {
        let widgetId = JarvisWidgetGridCtrl.getWidgetId(widget);

        if($('#' + JarvisWidgetGridCtrl.getWidgetId(this.element)).length && this.widgetIds.indexOf(widgetId) === -1) {
            this.destroyWidgets();
            this.widgetIds.push(widgetId);
            this.element.jarvisWidgets({
                grid: 'article',
                widgets: '.jarviswidget',
                localStorage: true,
                deleteSettingsKey: '#deletesettingskey-options',
                settingsKeyLabel: 'Reset settings?',
                deletePositionKey: '#deletepositionkey-options',
                positionKeyLabel: 'Reset position?',
                sortable: true,
                buttonsHidden: false,
                // toggle button
                toggleButton: true,
                toggleClass: 'fa fa-minus | fa fa-plus',
                toggleSpeed: 200,
                onToggle: function () {},
                // delete btn
                deleteButton: true,
                deleteMsg: 'Warning: This action cannot be undone!',
                deleteClass: 'fa fa-times',
                deleteSpeed: 200,
                onDelete: function () {},
                // edit btn
                editButton: true,
                editPlaceholder: '.jarviswidget-editbox',
                editClass: 'fa fa-cog | fa fa-save',
                editSpeed: 200,
                onEdit: function () {},
                // color button
                colorButton: true,
                // full screen
                fullscreenButton: true,
                fullscreenClass: 'fa fa-expand | fa fa-compress',
                fullscreenDiff: 3,
                onFullscreen: function () {},
                // custom btn
                customButton: false,
                customClass: 'folder-10 | next-10',
                customStart: function () {
                    alert('Hello you, this is a custom button...');
                },
                customEnd: function () {
                    alert('bye, till next time...');
                },
                // order
                buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
                opacity: 1.0,
                dragHandle: '> header',
                placeholderClass: 'jarviswidget-placeholder',
                indicator: true,
                indicatorTime: 600,
                ajax: true,
                timestampPlaceholder: '.jarviswidget-timestamp',
                timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
                refreshButton: true,
                refreshButtonClass: 'fa fa-refresh',
                labelError: 'Sorry but there was a error:',
                labelUpdated: 'Last Update:',
                labelRefresh: 'Refresh',
                labelDelete: 'Delete widget:',
                afterLoad: function () {},
                rtl: false, // best not to toggle this!
                onChange: function () {},
                onSave: function () {},
                ajaxnav: true
            });
        }
    }

    destroyWidgets () {
        this.element.data('jarvisWidgets') && this.element.data('jarvisWidgets').destroy();
    }
}

JarvisWidgetGridCtrl.$inject = ['Observer'];

angular.module('app.layout').component('jarvisWidgetGrid', {
    bindings: {for: '@'},
    controller: JarvisWidgetGridCtrl
});
