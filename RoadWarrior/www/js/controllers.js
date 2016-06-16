angular.module('roadWarrior.controllers', [])

.controller('TodayCtrl', ['$scope', function($scope) {
$scope.dayName = "Tuesday";
$scope.date = "June 14th, 2016";
$scope.event = {
  venue: "Paramount Theater",
  city: "Seattle, WA",
}


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

.controller('AccountCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  $scope.$on('$ionicView.beforeEnter', function(){
    // get current user info
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    $scope.currentAuth = currentAuth;
    usersRef.child(currentAuth.uid).on("value", function(user){
           if (currentAuth.facebook){
            console.log("facebook",currentAuth);
        $scope.user = currentAuth.facebook.displayName;
      } else {
            console.log("not facebook",currentAuth);
        $scope.user = currentAuth.auth.token.email;
      }
      $scope.currentUser = user.val();
     
    }, function (errorObject) {
      console.log("Sorry! There was an error getting your data:" + errorObject.code);
    });
    $scope.logout = function(){
      usersRef.unauth();
      $state.go("login");
    };
    $scope.create = function(){
      $state.go("create");
    };
  
 
    
  });
}])

.controller('SignupCtrl', ['$scope', 'Auth', 'currentAuth', '$state', function($scope, Auth, currentAuth, $state){
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  // check if user is logged in
  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet");
    } else {
      console.log("Logged in as", authData.uid);
      // get current user info
      usersRef.child(authData.uid).on("value", function(user){
        $scope.currentUser = user.val();
      }, function (errorObject) {
        console.log("Sorry! There was an error getting your data:" + errorObject.code);
      });
    }
    $scope.authData = authData;
  });
  // bind form data to user model
  $scope.user = {
    name: '',
    email: '',
    password: ''
  }
  // create a new user from form data
  $scope.signup = function(){
    usersRef.createUser({
      name: $scope.user.name,
      email: $scope.user.email,
      password: $scope.user.password,
    }, function(error, userData) {
      if (error) {
        alert("Error creating user:", error);
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        // log in the new user
        usersRef.authWithPassword({
          email: $scope.user.email,
          password: $scope.user.password
        }, function(error, authData) {
          if (error) {
            alert("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
            if (authData) {
              // save the user's profile into Firebase
              usersRef.child(authData.uid).set({
                provider: authData.provider,
                name: $scope.user.name
              });
            };
            // redirect user to select state
            $state.go("groups");
          }
        });
      }
    });
  };
  $scope.logout = function(){
    usersRef.unauth();
  };
}])

.controller('LoginCtrl', ['$scope', 'Auth', 'currentAuth', '$state', function($scope, Auth, currentAuth, $state){
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  // check if user is logged in
  Auth.$onAuth(function(authData){
    if (authData === null) {
      console.log("Not logged in yet.");
    } else {
      console.log("Logged in as", authData);
      // get current user info
      usersRef.child(authData.uid).on("value", function(user){
        $scope.currentUser = user.val();
        console.log($scope.currentUser);
      }, function (errorObject){
        console.log("Sorry! There was an error getting your data:" + errorObject.code);
      });
    }
    $scope.authData = authData;
    $state.go("tab.today");
  });
  // bind form data to user model
  $scope.user = {
    email: '',
    password: ''
  }
  $scope.fbLogin = function() {
    console.log("entering fb login route");
    Auth.$authWithOAuthRedirect("facebook").then(function(authData){
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData){
          console.log("Login Successful!", authData);
          $state.go("tab.today");
        });
      } else {
        console.log(error);
      }
    });
  };
  $scope.login = function(){
    usersRef.authWithPassword({
      email: $scope.user.email,
      password: $scope.user.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Login Successful!", authData);
        $state.go("tab.today");
      }
    });
  };
  $scope.logout = function(){
    usersRef.unauth();
  };
}])