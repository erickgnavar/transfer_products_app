'use strict'

angular.module('starter.services', [])
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])
.factory('AuthFactory', ['$http', function ($http) {
  return {
    login: function (api, host, database, username, password) {
      return $http.post(api + '/auth/login', {
        host: host,
        database: database,
        email: username,
        password: password
      });
    }
  };
}])
.factory('myInterceptor', ['$q', '$localstorage', function ($q, $localstorage) {
  var settings = $localstorage.getObject('settings', {});
  return {
    request: function (config) {
      if (config.url.replace(settings.api, '').substring(0, 5) === '/api/') {
        config.headers['access-control-allow-origin'] = '*';
        if (typeof settings.api === 'undefined' || typeof settings.credentials === 'undefined') {
          return $q.reject('settings incomplete');
        }
        config.headers['credentials'] = settings.credentials;
      }
      return config;
    }
  };
}])
.factory('ProductFactory', ['$http', '$localstorage', function ($http, $localstorage) {
  var host = $localstorage.getObject('settings', {}).api;
  return {
    searchByCode: function (code) {
      return $http.get(host + '/api/products/?code=' + code);
    },
    search: function (q) {
      return $http.get(host + '/api/products/?q=' + q);
    }
  }
}])
.factory('LocationFactory', ['$http', '$localstorage', function ($http, $localstorage) {
  var host = $localstorage.getObject('settings', {}).api;
  return {
    search: function (q) {
      return $http.get(host + '/api/locations/?q=' + q);
    },
    transfer: function (item) {
      return $http.post(host + '/api/locations/transfer/', {
        'product_id': item.product.id,
        'origin_id': item.origin.id,
        'destination_id': item.destination.id
      });
    }
  }
}])
.factory('HistoryFactory', ['$http', '$localstorage', function ($http, $localstorage) {
  var host = $localstorage.getObject('settings', {}).api;
  return {
    all: function() {
      return $http.get(host + '/api/history/');
    }
  };
}]);
