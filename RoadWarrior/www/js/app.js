// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var authWait = ["Auth", function(Auth) { return Auth.$waitForAuth(); }]
var authRequire = ["Auth", function(Auth) { return Auth.$requireAuth(); }]

angular.module('roadWarrior', ['ionic', 'firebase','roadWarrior.controllers','roadWarrior.services','ui.bootstrap',])



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
      console.log("state change error");
      $state.go("login");
    }
  });
}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
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

    .state('pending', {
    cache: false,
    url: '/pending',
    templateUrl: 'templates/pending.html',
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
  .state('tab.list', {
      url: '/list',
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
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    },
    resolve: {
      "currentAuth": authRequire
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/today');

});
