angular.module('starter.controllers', [])

.controller('DashCtrl', ['$scope', '$ionicPopup', '$localstorage', '$cordovaBarcodeScanner', 'ProductFactory', 'LocationFactory', function($scope, $ionicPopup, $localstorage, $cordovaBarcodeScanner, ProductFactory, LocationFactory) {
  var self = $scope;
  self.$on('$ionicView.enter', function (e) {
    self.settings = $localstorage.getObject('settings', {});
    self.clean();
  });

  self.step = 0;
  self.mode = 'scan';
  self.titles = ['Select product', 'Select origin', 'Select destination'];
  self.scannedProduct = {};

  self.clean = function () {
    self.step = 0;
    self.selected = {};
    self.products = [];
    self.origins = [];
    self.destinations = [];
    self.inputProduct = '';
    self.inputOrigin = '';
    self.inputDestination = '';
    self.scannedProduct = {};
  };

  self.scan = function () {
    $cordovaBarcodeScanner.scan().then(function (data) {
      ProductFactory.searchByCode(data.text).then(function (response) {
        if (response.data.length) {
          self.scannedProduct = response.data[0];
        }
      }, function (error) {
        $ionicPopup.alert({
          title: 'Error',
          template: 'Product not found'
        });
      });
      var code = data.text;
    }, function (error) {
      console.error(error);
    });
  }

  self.goStep2 = function () {
    if (typeof self.scannedProduct.id !== 'undefined') {
      self.step = 1;
      self.selected.product = self.scannedProduct;
    } else {
      $ionicPopup.alert({
        title: 'Error',
        template: 'Select product before continue'
      });
    }
  };

  self.searchProduct = function (inputProduct) {
    ProductFactory.search(inputProduct).then(function (response) {
      self.products = response.data;
    }, function (error) {
      console.error(error);
    });
  };
  self.selectProduct = function (product) {
    self.selected.product = product;
    self.products = [];
    self.step = 1;
  };
  self.searchOrigin = function (inputOrigin) {
    LocationFactory.search(inputOrigin).then(function (response) {
      self.origins = response.data;
    });
  };
  self.selectOrigin = function (origin) {
    console.log('select origin');
    self.selected.origin = origin;
    self.step = 2;
  };
  self.searchDestination = function (inputDestination) {
    LocationFactory.search(inputDestination).then(function (response) {
      self.destinations = response.data;
    });
  };
  self.selectDestination = function (destination) {
    self.selected.destination = destination;
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm transfer',
      template: 'Transfer <b>#product</b> from <b>#origin</b> to <b>#destination</b>'
        .replace(/#product/g, self.selected.product.name)
        .replace(/#origin/g, self.selected.origin.name)
        .replace(/#destination/g, self.selected.destination.name)
    });
    confirmPopup.then(function(res) {
      if(res) {
        LocationFactory.transfer(self.selected).then(function (response) {
          if (response.data.status === 'ok') {
            $ionicPopup.alert({
              title: 'Transfer complete',
              template: ''
            });
            self.clean();
          } else {

          }
        });
      } else {
        console.log('You are not sure');
      }
    });
  };
}])

.controller('HistoryCtrl', ['$scope', '$localstorage', '$ionicPopup', 'HistoryFactory', function($scope, $localstorage, $ionicPopup, HistoryFactory) {
  var self = $scope;
  self.$on('$ionicView.enter', function (e) {
    self.settings = $localstorage.getObject('settings', {});
    HistoryFactory.all().then(function (response) {
      self.items = response.data;
    });
  });
}])

.controller('SettingsCtrl', ['$scope', '$ionicPopup', '$localstorage', 'AuthFactory', function ($scope, $ionicPopup, $localstorage, AuthFactory) {
  var self = $scope;
  self.$on('$ionicView.enter', function (e) {
    self.settings = $localstorage.getObject('settings', {});
  });
  self.$on('$ionicView.leave', function (e) {
    $localstorage.setObject('settings', self.settings);
  });
  self.login = function () {
    AuthFactory.login(self.settings.api, self.settings.host, self.settings.database, self.settings.email, self.settings.password)
    .then(function (response) {
      var title = '';
      var template = '';
      if (response.data.status === 'ok') {
        self.settings.credentials = response.data.credentials;
        title = 'Login successful';
        $localstorage.setObject('settings', self.settings);
      } else {
        title = 'Error';
        template = 'Wrong credentials'
      }
      $ionicPopup.alert({
        title: title,
        template: template
      });
    }, function (error) {
      console.error(error);
    });
  };
}]);
