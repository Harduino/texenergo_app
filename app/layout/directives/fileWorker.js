/**
 * Created by Egor Lobanov on 11.12.15.
 * UI that give user ability to work with attached files
 * trigger - function that will be called when user click button to show worker modal
 * config - fileWorker options object, include dropzoneConfig property
 * dropzoneConfig - object with dropzone options that should overwrite fileWorker standard options
 */
(function(){
    angular.module('app.layout').directive('fileWorker', ['funcFactory', 'CanCan', function(funcFactory, CanCan){
        return {
            restrict:'E',
            scope:{
                trigger: '=',
                config: '='
            },
            link: function(scope, element){
                var modal = element.find('.modal'),
                    _drop = modal.find('div[smart-dropzone]')[0],//dropzone element
                    _value, //config value
                    _isConfigured = false;
                var canDestroy = CanCan.can('destroy', 'Attachments::Document'); // check, can user remove file

                scope.fullQueue = false; // show upload button or not

                /**
                 * Load list of files from server
                 * @param config - value of config
                 * @param dropzone - dropzone object
                 */
                function loadFilesList(config){
                    //get files list
                    config.hasOwnProperty('r_get') ?
                    config.r_get(config.view, config.id, function(result){
                        !result.data.errors && addFilesToList(result.data)
                    }) : addFilesToList(config.files);
                }

                function addFilesToList (files){
                    var dropzone = _drop.dropzone;
                    dropzone.removeAllFiles(true);//clear files list
                    if(angular.isArray(files)){
                        var serverFiles = files.map(function(item){
                            if(item !== null && typeof item === 'object'){
                                var mockFile = { name: item.title, size: item.file_size, id:item.id};
                                dropzone.emit("addedfile", mockFile);
                                dropzone.emit("thumbnail", mockFile, appConfig.serverUrl + '/uploads/'+ item.id + '/preview' + cutExtension(item.title).extension);
                                return mockFile;
                            }
                        });
                        dropzone.serverFiles = serverFiles;
                    }
                }

                /**
                 * create custom controls for  previewElement
                 * @param file
                 */
                function createControls(file){
                    var template = $(file.previewElement);
                    var titleSpan = template.find('span[data-dz-name]')[file.id ? 'show' : 'hide'](); // get name span and check display it or not

                    if(file.id){//if file uploaded
                        var dLink = appConfig.serverUrl + '/uploads/'+ file.id + '/original' + cutExtension(file.name).extension; // create download link
                        var button =$('<a/>', {class:'dz-download', href:dLink, text:'Скачать', download:file.name});
                        template.find('.dz-filename-input').remove();
                        template.find('.dz-error-message').after(button);
                        template.find('[data-dz-name]').attr('title', file.name);
                    }else{// if file not yet uploaded
                        var filename = template.find('.dz-filename'),
                            f = cutExtension(file.title = titleSpan.text()); // split file name and extension, set file name to file.title
                        //text area to give user ability change file name
                        var input = $('<textarea>', {type:'text', placeholder:'Имя файла', class:'form-control dz-filename-input', val: f.name}).on('change', function(){
                            titleSpan.text(file.title = (input.val() + f.extension));// set file title on change
                        });
                        filename.append(input);
                        scope.fullQueue = true; // show upload button
                        !scope.$$phase && scope.$apply(angular.noop);
                    }
                }

                /**
                 * split - fileName on name and extension
                 * @param fileName - file name with extension
                 * @returns {{name: (string|*), extension: (string|*)}}
                 */
                function cutExtension(fileName){
                    var index = fileName.lastIndexOf('.'),
                        e = index>-1 ? fileName.substring(index, fileName.length) : '',
                        n = fileName.substring(0, index);
                    return {name: n, extension: e};
                }

                /**
                 * check if QueuedFiles && UploadingFiles queues are empty
                 */
                function checkUploadQueue(){
                    var d= _drop.dropzone;
                    if(d.getQueuedFiles().length ==0 && d.getUploadingFiles().length == 0){
                        scope.fullQueue = false;
                        !scope.$$phase && scope.$apply(angular.noop);
                    }
                }

                /**
                 *  click on upload button
                 */
                scope.uploadFiles = function(){
                    _drop.dropzone.processQueue();
                };

                /**
                 * show fileWorker modal && start initial load of file list
                 */
                scope.trigger = function(){
                    modal.modal('show');
                    //first time when user opens modal window and dropzone options are seted, load file list;
                    if(_isConfigured) {
                        loadFilesList(_value, _drop.dropzone);
                        _isConfigured = false;
                    }
                };



                /**
                 * watch config changes and create option object for dropzone
                 */
                scope.$watch('config', function(value){
                    if(value){
                        _value = value;
                        _isConfigured = true;

                        var config = {
                            url: appConfig.serverUrl + value.url,
                            addRemoveLinks: canDestroy,
                            autoProcessQueue:false,
                            acceptedFiles: '.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.odt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.odp',
                            init : d_init,
                            complete : d_complete,
                            sending : d_sending,
                            accept: d_accept,
                            withCredentials: true
                        };

                        var dc = value.dropzoneConfig;
                        if(dc && typeof dc === 'object') config = angular.extend(config, dc);
                        scope.options = config;//set option property
                    }
                });

                /**
                 * dropzone custom init
                 * @param value - user config
                 */
                function d_init (){
                    var dropzone = this;

                    dropzone.cutExtension = cutExtension;

                    canDestroy && dropzone.on('removedfile', function(file){
                        file.id && _value.r_delete(_value.view, _value.id, file.id, function(result){
                            result.data.errors && funcFactory.showNotification('Не удалось удалить файл ' + file.name, result.data.errors);
                        });
                        checkUploadQueue();
                    });

                    dropzone.on('addedfile', createControls);

                    dropzone.on('queuecomplete', checkUploadQueue);

                    _value.hasOwnProperty('init') && _value.init.bind(this)();
                }

                function d_complete(file){
                    if(file.xhr){
                        var data;
                        try{
                            data = JSON.parse(file.xhr.response); // parse response string
                        }catch(e){
                            data = {};
                        }finally{
                            if(data.id && !data.errors){
                                file.id = data.id; // append id to file
                                createControls(file);
                            }else {
                                this.removeFile(file); // remove file from list if error
                                funcFactory.showNotification('Не удалось загрузить файл: ' + file.title, (data.errors || {}));
                            }

                            _value.hasOwnProperty('complete') && _value.complete.bind(this)(file);
                        }
                    }
                }

                function d_sending(file, xhr, formData){
                    //append title to formData before send
                    formData.append("title", file.title);
                    _value.hasOwnProperty('sending') && _value.sending.bind(this)(file, xhr, formData);
                }

                function d_accept(file, done){
                    var c = _value.filesCount;

                    if(c){
                        if(this.getQueuedFiles().length<c){
                            done()
                        }else {
                            done('Можно добавить только один файл');
                            this.removeFile(file);
                        }
                    }else done();
                }
            },
            templateUrl: '/app/layout/partials/fileWorker.html'
        }
    }]);
}());
