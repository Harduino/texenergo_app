'use strict';

window.APP_ENV = {
    APP_BASE_URL: 'http://app.texenergo.com',
    PROTOCOL: 'https',
    REMOTE_API_HTTP_BASE_URL: 'https://api.texenergo.com/v2',
    TEXENERGO_COM_API_HTTP_BASE_URL: 'https://v2.texenergo.com/api' // To query directly Ruby endpoint
};

if(window.location.host.match(/localhost|127\.0\.0\.1/) == null) {
    window.APP_ENV.API_HTTP_BASE_URL = 'https://api.texenergo.com/v2';
    window.APP_ENV.API_WS_BASE_URL = 'wss://v2.texenergo.com/ws';
} else {
    window.APP_ENV.API_HTTP_BASE_URL = 'http://localhost:3000/api';
    window.APP_ENV.API_WS_BASE_URL = 'ws://localhost:3000/ws';
}
