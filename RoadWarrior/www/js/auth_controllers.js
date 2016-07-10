angular.module('roadWarrior.controllers')


.controller('SignupCtrl', ['$scope', '$ionicLoading', 'Auth', 'currentAuth','$firebaseAuth','$firebaseObject', '$state', function($scope, $ionicLoading, Auth, currentAuth, $firebaseAuth, $firebaseObject, $state){
$scope.user = {}


$scope.signup = function() {
  // Create a new user
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    width: 100,
    showDelay: 100
  }).then(function(){
        console.log("The loading indicator is now displayed");
      Auth.$createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
      .then(function(firebaseUser) {
        console.log("User " + firebaseUser.uid + " created successfully!");
        firebaseUser.updateProfile({
        displayName: $scope.user.name
      }).then(function() {
        console.log("added displayName");
        var thisUserRef = firebase.database().ref('users/'+firebaseUser.uid);
        var obj = $firebaseObject(thisUserRef);
        obj.provider = firebaseUser.providerId;
        console.log("obj.provider: ",firebaseUser.providerId);
        obj.email = $scope.user.email;
        console.log("email: ",$scope.user.email);
        obj.name = $scope.user.name;
        console.log("name: ",$scope.user.name);
        obj.$save().then(function(ref) {
          $ionicLoading.hide().then(function(){
            $state.go("groups");
              console.log("The loading indicator is now hidden");
          });
        }, function(error) {
          console.log("Error:", error);
        });
          
      }, function(error) {
        console.log("displayName didn't work: ",error);
      });
    }).catch(function(error) {
        console.error("Error: ", error);
    });
  })
};
}])

.controller('LoginCtrl', ['$scope', '$ionicHistory', 'Auth', 'currentAuth', '$state', function($scope, $ionicHistory, Auth, currentAuth, $state){




Auth.$onAuthStateChanged(function(firebaseUser) {
  if (firebaseUser) {
    console.log("Signed in as:", firebaseUser.uid);
    var thisUserRef = firebase.database().ref('users/'+firebaseUser.uid);
    thisUserRef.on("value", function(user){
        $scope.currentUser = user.val();
        console.log("current user is: ",$scope.currentUser);
          if ($scope.currentUser.groups){
            console.log("going to today page");
            $ionicHistory.clearCache().then(function(){ $state.go('tab.today') });
          } else {
            $state.go("groups");
            }
      }, function (errorObject){
          alert("Sorry! There was an error getting your data:" + errorObject.code);
        });
  } else {
    console.log("Not logged in.");
  }
});


  // bind form data to user model
  $scope.user = {}


  $scope.login = function() {
  $scope.firebaseUser = null;
  $scope.error = null;

  Auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(firebaseUser) {
  console.log("Signed in as:", firebaseUser.uid);
  $scope.firebaseUser = firebaseUser;
  }).catch(function(error) {
  console.error("Authentication failed:", error);
  })
  };

  $scope.logout = function(){
    Auth.$signOut();
  };
}])


