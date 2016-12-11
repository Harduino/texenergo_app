/**
 * Created by Egor Lobanov on 11.12.16.
 * Handler for Barcode Scanner.
 * Usage:
 * 1) inject teBarcodeScanner;
 * 2) create listener teBarcodeScanner.createScannerListener(<callback>, <timeout>)
 */
(function(){
    "use strict";

    angular.module('app.layout').service('teBarcodeScanner', teBarcodeScanner);

    function teBarcodeScanner(){

        /**
         * Create Barcode Scanner handler.
         * @param callback
         * @param timeout - optional
         * @returns {teBarcodeScanner.ScanerListener} - instance with destroy method
         */
        this.createScannerListener = function(callback, timeout){
            return new ScanerListener(callback, timeout)
        };

        function ScanerListener(callback, timeout){
            var body = angular.element('body'),
                buffer = '',
                bufferValueLength = 0,
                timeoutId,
                t = timeout || 500;

            body.on('keydown', keydownHandler);

            function keydownHandler(event){
                buffer += event.key;
                bufferValueLength = buffer.length - 3;

                //reset interval
                if(timeoutId) window.clearTimeout(timeoutId);
                timeoutId = window.setTimeout(clearBuffer, t);

                if(bufferValueLength>0 && buffer.lastIndexOf('===') === bufferValueLength){
                    callback(buffer);
                    clearBuffer();
                }
            }

            function clearBuffer(){
                buffer = '';
                timeoutId = null;
            }

            this.destroy = function(){
                if(timeoutId) window.clearTimeout(timeoutId);
                body.off('keydown', keydownHandler);
            }
        }
    }
}());
