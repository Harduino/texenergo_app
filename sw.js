CACHE_NAME = "texenergo-sw-v";
CACHE_VERSION = 1;
var urlsToCache = [
  '/app/auth/components/login/login.html',
  '/app/auth/components/login-info/login-info.html',
  '/app/catalogues/components/catalogues/catalogues.html',
  '/app/catalogues/components/edit-catalogue/edit-catalogue.html',
  '/app/catalogues/components/view-catalogue/view-catalogue.html',
  '/app/components/projects/recent-projects.tpl.html',
  '/app/components/shortcut/shortcut.tpl.html',
  '/app/contacts/components/contacts/contacts.html',
  '/app/contacts/components/view-contact/view-contact.html',
  '/app/customer_orders/components/command-customer-order-modal/command-customer-order-modal.html',
  '/app/customer_orders/components/customer-orders/customer-orders.html',
  '/app/customer_orders/components/eco-product-details-modal/eco-product-details-modal.html',
  '/app/customer_orders/components/eqo-change-customer-order-product-modal/eqo-change-customer-order-product-modal.html',
  '/app/customer_orders/components/logs-customer-order/logs-customer-order.html',
  '/app/customer_orders/components/view-customer-order/view-customer-order.html',
  '/app/dashboard/components/dashboard/dashboard.html',
  '/app/dispatch_orders/components/dispatch-orders/dispatch-orders.html',
  '/app/dispatch_orders/components/logs-dispatch-order/logs-dispatch-order.html',
  '/app/dispatch_orders/components/view-dispatch-order/view-dispatch-order.html',
  '/app/incoming_transfers/components/incoming-transfers/incoming-transfers.html',
  '/app/incoming_transfers/components/logs-incoming-transfer/logs-incoming-transfer.html',
  '/app/incoming_transfers/components/view-incoming-transfer/view-incoming-transfer.html',
  '/app/layout/components/big-breadcrumbs/big-breadcrumbs.html',
  '/app/layout/components/full-screen/full-screen.html',
  '/app/layout/components/layout/layout.html',
  '/app/layout/components/layout/partials/footer.html',
  '/app/layout/components/layout/partials/header.html',
  '/app/layout/components/layout/partials/navigation.html',
  '/app/layout/components/minimize-menu/minimize-menu.html',
  '/app/layout/components/orders-filter/orders-filter.html',
  '/app/layout/components/product-to-customer-orer-modal/product-to-customer-orer-modal.html',
  '/app/layout/components/state-breadcrumbs/state-breadcrumbs.html',
  '/app/layout/components/te-copy-to-buffer/te-copy-to-buffer.html',
  '/app/layout/components/te-scroll-top/te-scroll-top.html',
  '/app/layout/components/toggle-menu/toggle-menu.html',
  '/app/layout/components/transfer-builder/transfer-builder.html',
  '/app/layout/partials/fileWorker.html',
  '/app/layout/partials/notifications.tpl.html',
  '/app/layout/partials/sub-header.tpl.html',
  '/app/layout/partials/voice-commands.tpl.html',
  '/app/manufacturers/components/edit-manufacturer/edit-manufacturer.html',
  '/app/manufacturers/components/manufacturers/manufacturers.html',
  '/app/manufacturers/components/view-manufacturer/view-manufacturer.html',
  '/app/outgoing_transfers/components/outgoing-transfers/outgoing-transfers.html',
  '/app/outgoing_transfers/components/view-outgoing-transfer/view-outgoing-transfer.html',
  '/app/partners/components/logs-partner/logs-partner.html',
  '/app/partners/components/partners/partners.html',
  '/app/partners/components/view-partner/view-partner.html',
  '/app/pdf_catalogues/components/pdf-catalogues/pdf-catalogues.html',
  '/app/pdf_catalogues/components/view-pdf-catalogue/view-pdf-catalogue.html',
  '/app/products/components/logs-product/logs-product.html',
  '/app/products/components/replacement-product-modal/replacement-product-modal.html',
  '/app/products/components/view-product/view-product.html',
  '/app/quotation_orders/views/editQuotationOrder.html',
  '/app/quotation_orders/views/quotationOrders.html',
  '/app/receive_orders/components/logs-receive-order/logs-receive-order.html',
  '/app/receive_orders/components/receive-orders/receive-orders.html',
  '/app/receive_orders/components/view-receive-order/view-receive-order.html',
  '/app/search/components/top-search/top-search.html',
  '/app/supplier_orders/components/supplier-orders/supplier-orders.html',
  '/app/supplier_orders/components/view-supplier-order/view-supplier-order.html'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME + CACHE_VERSION)
      .then(function(cache) {
        self.skipWaiting();
        cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  caches.delete(CACHE_NAME + (CACHE_VERSION - 1));
  caches.keys().then(function(xs){
    for (var i = 0; i < xs.length; i++) {
      caches.delete(xs[i]);
    }
  });
  event.waitUntil(self.clients.claim());
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if(serveFromCache(event.request, response)) return response;
      if(avoidCache(event.request, response)) {
        return fetch(event.request).then(function(r){
          return r;
        })
      }
      return fetch(event.request).then(function(r) {
        return caches.open(CACHE_NAME + CACHE_VERSION).then(function(cache){
          cacheIt(cache, event.request, r);
          return r;
        })
      }).catch(function(err){
        console.log("Catching fetch exception: " + err);
        if (event.request.url.indexOf("http://cdn.texenergo.com/products/" === 0)) {
          // Fetches only at HTTPS.
          return fetch("https://s3-eu-west-1.amazonaws.com/texenergo-production-v3/site/images/texenergo_logo_high.png").then(function(blank_image){
            return blank_image;
          })
        }
        if(response) return response;
      });
    }).catch(function(err){
      console.log("Catching cache exception: " + err);
    })
  )
});

// Если это обращение не к API и есть кеш, то вернуть кеш
function serveFromCache(request, response) {
  return request.url.indexOf("/api/") < 0 && request.method === "GET" && response;
}

// Избегаем кеширования инфы из Auth0.
function avoidCache(request, response) {
  return request.url.indexOf("auth0") >= 0
}

function cacheIt(cache, request, server_response) {
  if(request.method === "GET") {
    var cloned = server_response.clone();
    cloned.ttl_timestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // 3 Days.
    cache.put(request, cloned);
  };
}