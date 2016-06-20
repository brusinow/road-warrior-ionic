angular.module('roadWarrior.controllers', [])

.controller('TodayCtrl', ['$scope', function($scope) {
$scope.dayName = "Tuesday";
$scope.date = "June 14th, 2016";
$scope.event = {
  venue: "Paramount Theater",
  city: "Seattle, WA",
}


}])

.controller('GroupsCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
   var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
   console.log("made it to groups");
   console.log("current Auth is: ",currentAuth);
   usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
        console.log("current user is: ",$scope.currentUser);
  }, function (errorObject) {
    alert("Sorry! There was an error getting your data:" + errorObject.code);
  });

   $scope.toJoinGroup = function(){
    $state.go("joinGroup");
   }
    $scope.toNewGroup = function(){
    $state.go("newGroup");
   }
}])

.controller('JoinGroupsCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  $scope.group = {};

  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  var currentRef = usersRef.child(currentAuth.uid);
  var groupRef = currentRef.child("groups");
   // usersRef.child(currentAuth.uid).on("value", function(user){
   //  $scope.currentUser = user.val();
   //  })
    $scope.joinGroup = function(){
      console.log("scope.groupName is: ",$scope.group.name);
    var searchGroup = $scope.group.name;
    var groupNumber = "2896395735";
    var groupEntry = {};
    groupEntry[groupNumber] = {
      "name": searchGroup,
      "access": false
    };
    console.log("searchGroup is: ",searchGroup);
    groupRef.update(groupEntry);
    };   
}])

.controller('NewGroupsCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  $scope.group = {};

  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  var groupsRef = new Firebase("https://roadwarrior.firebaseio.com/groups");
  var currentUserRef = usersRef.child(currentAuth.uid);
  var currentUserGroupsRef = currentUserRef.child("groups");
  console.log("current auth is: ",currentAuth);
   usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
    console.log("current user is: ",$scope.currentUser);
    })
    $scope.newGroup = function(){
    var newGroupRef = groupsRef.push();
    var groupID = newGroupRef.key();
    var memberEntry = {}
    memberEntry[currentAuth.uid] = {
      "name": $scope.currentUser.name,
      "email": $scope.currentUser.email,
      "userType": "admin"
    };

    console.log("groupID is: ",groupID);
    var searchGroup = $scope.group.name;
    groupsRef.child(groupID).set({
      "name": searchGroup,
      "members": memberEntry
    })
    };
    // var groupEntry = {};
    // groupEntry[groupNumber] = {
    //   "name": searchGroup,
    //   "access": false
    // };
    // console.log("searchGroup is: ",searchGroup);
    // groupRef.update(groupEntry);
    // };   
}])

 // usersRef.child(authData.uid).set({
 //                provider: authData.provider,
 //                groups: {},
 //                email: $scope.user.email,
 //                name: $scope.user.name
                
 //              });
// var usersRef = new Firebase('https://samplechat.firebaseio-demo.com/users');
// var fredRef = usersRef.child('fred');
// var fredFirstNameRef = fredRef.child('name/first');

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
  
 
    
  });
}])

.controller('SignupCtrl', ['$scope', 'Auth', 'currentAuth', '$state', function($scope, Auth, currentAuth, $state){
var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");

Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log("Not logged in yet");
    } else {
      console.log("Logged in as", authData.uid);
      // get current user info
      usersRef.child(authData.uid).on("value", function(user){
        $scope.currentUser = user.val();
      }, function (errorObject) {
        alert("Sorry! There was an error getting your data:" + errorObject.code);
      });
    }
    $scope.authData = authData;
  });



 $scope.user = {
    name: '',
    email: '',
    password: ''
  }

$scope.signup = function(){
usersRef.createUser({
      name: $scope.user.name,
      email: $scope.user.email,
      password: $scope.user.password,
}, function(error, userData) {
  if (error) {
    console.log("Error creating user:", error);
  } else {
    console.log("Successfully created user account with uid:", userData.uid);
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
                groups: {},
                email: $scope.user.email,
                name: $scope.user.name
                
              });
            };
           console.log("should redirect to groups state");
            $state.go("groups");
          }
        });
    } 
});
}
}])

.controller('LoginCtrl', ['$scope', 'Auth', 'currentAuth', '$state', function($scope, Auth, currentAuth, $state){
var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");

Auth.$onAuth(function(authData){
    if (authData === null) {
      console.log("Not logged in yet.");
    } else {
      console.log("Logged in as", authData.uid);
      // get current user info
      usersRef.child(authData.uid).on("value", function(user){
        $scope.currentUser = user.val();
      }, function (errorObject){
        alert("Sorry! There was an error getting your data:" + errorObject.code);
      });
    }
    $scope.authData = authData;
  });
  // bind form data to user model
  $scope.user = {
    email: '',
    password: ''
  }
  $scope.login = function(){
    usersRef.authWithPassword({
      email: $scope.user.email,
      password: $scope.user.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Login Successful!", authData);
        if (authData.auth.token.group){
        $state.go("tab.today");
      } else {
        $state.go("groups");
      }
      }
    });
  };
  $scope.logout = function(){
    usersRef.unauth();
  };
}])