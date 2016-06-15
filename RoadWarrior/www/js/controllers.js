angular.module('starter.controllers', ['starter.services','ui.bootstrap'])

.controller('TodayCtrl', ['$scope', function($scope) {
$scope.dayName = "Tuesday";
$scope.date = "June 14th, 2016";
$scope.event = {
  venue: "Paramount Theater",
  city: "Seattle, WA",
}

// $scope.login = function() {
//     Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
//       // User successfully logged in
//     }).catch(function(error) {
//       if (error.code === "TRANSPORT_UNAVAILABLE") {
//         Auth.$authWithOAuthPopup("facebook").then(function(authData) {
//           // User successfully logged in. We can log to the console
//           // since we’re using a popup here
//           console.log(authData);
//         });
//       } else {
//         // Another error occurred
//         console.log(error);
//       }
//     });
// };

// Auth.$onAuth(function(authData) {
//   if (authData === null) {
//     console.log("Not logged in yet");
//   } else {
//     console.log("Logged in as", authData.uid);
//   }
//   $scope.authData = authData; // This will display the user's name in our view
// });




}])




.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
