angular.module('roadWarrior.services', [])


.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})


