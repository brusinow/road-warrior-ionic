// Ionic Starter App
var authWait = ["Auth", function(Auth) { return Auth.$waitForSignIn(); }]
var authRequire = ["Auth", function(Auth) { return Auth.$requireSignIn(); }]
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('roadWarrior', ['ionic', 'firebase','ngMessages','roadWarrior.controllers','roadWarrior.services','ui.bootstrap','angularMoment','ionic-datepicker','ionic-timepicker','angular-toArrayFilter'])



.constant('GoogleEndpoint', {
  url: 'https://maps.googleapis.com/maps/api'
})

.constant('YahooEndpoint', {
  url: 'https://query.yahooapis.com/v1'
})

.constant('YelpEndpoint', {
  url: 'https://api.yelp.com/v2/search'
})


.directive('input', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      'returnClose': '=',
      'onReturn': '&',
      'onFocus': '&',
      'onBlur': '&'
    },
    link: function(scope, element, attr) {
      element.bind('focus', function(e) {
        if (scope.onFocus) {
          $timeout(function() {
            scope.onFocus();
          });
        }
      });
      element.bind('blur', function(e) {
        if (scope.onBlur) {
          $timeout(function() {
            scope.onBlur();
          });
        }
      });
      element.bind('keydown', function(e) {
        if (e.which == 13) {
          if (scope.returnClose) element[0].blur();
          if (scope.onReturn) {
            $timeout(function() {
              scope.onReturn();
            });
          }
        }
      });
    }
  }
})


.run(['$ionicPlatform', '$rootScope', '$state', function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // catch the error thrown when the $requireAuth promise is rejected and redirect user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    }
  });
}])




.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $ionicConfigProvider.scrolling.jsScrolling(false);
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  $stateProvider

  // setup an abstract state for the tabs directive
   .state('signup', {
    cache: false,
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl',
    resolve: {
      "currentAuth": authWait
    }
  })

  .state('login', {
    cache: false,
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    resolve: {
      "currentAuth": authWait
    }
  })

  //  .state('logoLoad', {
  //   cache: false,
  //   url: '/logoLoad',
  //   templateUrl: 'templates/logoLoad.html',
  //   resolve: {
  //     "currentAuth": authWait
  //   }
  // })

  .state('groups', {
    cache: false,
    url: '/groups',
    templateUrl: 'templates/groups.html',
    controller: 'GroupsCtrl',
    resolve: {
      "currentAuth": authRequire
    }
  })
   .state('newGroup', {
    cache: false,
    url: '/groups/new',
    templateUrl: 'templates/newGroup.html',
    controller: 'NewGroupsCtrl',
    resolve: {
      "currentAuth": authRequire
    }
  })
    .state('joinGroup', {
    cache: false,
    url: '/groups/join',
    templateUrl: 'templates/joinGroup.html',
    controller: 'JoinGroupsCtrl',
    resolve: {
      "currentAuth": authRequire
    }
  })


    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    resolve: {
      "currentAuth": authRequire
    }
  })

  // Each tab has its own nav history stack:
  .state('tab.today', {
    url: '/today',
    cache: true,
    views: {
      'tab-today': {
        templateUrl: 'templates/tab-today.html',
        controller: 'TodayCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  })
     
    .state('tab.today-editItin', {
      url: '/today/editItin',
      cache: false,
      views: {
        'tab-today': {
          templateUrl: 'templates/editItin.html',
          controller: 'EditItinCtrl'
        }
      },
      resolve: {
      "currentAuth": authRequire
    }
    })

  .state('tab.list', {
      url: '/list',
      cache: false,
      views: {
        'tab-list': {
          templateUrl: 'templates/tab-list.html',
          controller: 'ListCtrl'
        }
      },
      resolve: {
      "currentAuth": authRequire
    }
    })
      .state('tab.listShow', {
      url: '/list/show',
      cache: false,
      views: {
        'tab-list': {
          templateUrl: 'templates/tab-listShow.html',
          controller: 'ListShowCtrl'
        }
      },
      resolve: {
      "currentAuth": authRequire
    }
    })

   

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      },
      resolve: {
      "currentAuth": authRequire
    }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      },
      resolve: {
      "currentAuth": authRequire
    }
    })

  .state('tab.account', {
    url: '/account',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  })

  .state('tab.account-newEvent', {
    url: '/account/newEvent',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/newEvent.html',
        controller: 'NewEventCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  })

  .state('tab.account-newItin', {
    url: '/account/newItin',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/newItin.html',
        controller: 'AccountCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  })

   .state('tab.account-pending', {
    url: '/account/pending',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/pendingUsers.html',
        controller: 'PendingUserCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  })


  .state('tab.account-editEvent', {
    url: '/account/editEvent',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/editEvent.html',
        controller: 'EditEventCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/today');

 

})

.config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel):/);
}])

.config(function (ionicTimePickerProvider) {
    var timePickerObj = {
      inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
      format: 12,
      step: 15,
      setLabel: 'Set',
      closeLabel: 'Close'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);
  })



.filter('tooOld', function() {
  return function(events) {
    var currentDay = moment().unix()
    var filtered = [];
    angular.forEach(events, function(event) {
      var thisEvent = event.unixDate/1000;
      if ((currentDay - thisEvent) <= 172800) {
        filtered.push(event);
      }
    });
    return filtered;
  };
})


.filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                  //Also remove . and , so its gives a cleaner result.
                  if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
                    lastspace = lastspace - 1;
                  }
                  value = value.substr(0, lastspace);
                }
            }

            return value + (tail || '…');
        };
    });