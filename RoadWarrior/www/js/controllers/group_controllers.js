angular.module('roadWarrior.controllers')

.controller('GroupsCtrl', ['$scope', '$ionicLoading','Profile','currentAuth', '$state', function($scope, $ionicLoading, Profile, currentAuth, $state){
   Profile(currentAuth.uid).$bindTo($scope,"profile").then(function(){
   });


    $scope.toJoinGroup = function(){
    $state.go("joinGroup");
    }
    $scope.toNewGroup = function(){
    $state.go("newGroup");
    }
}])




.controller('JoinGroupsCtrl', ['$scope', '$http', '$ionicHistory', 'FirebaseEnv', 'Profile', 'GetSetActiveGroup','currentAuth', '$state', function($scope, $http, $ionicHistory, FirebaseEnv, Profile, GetSetActiveGroup, currentAuth, $state){
  var ENV = FirebaseEnv();

  var mailgunUrl = "sandbox244b4a8817e84888a7a999503925c789.mailgun.org";
    var mailgunApiKey = window.btoa(ENV.MAILGUN)
    
 
    $scope.send = function() {
      var message = "Your request to join a group has been sent to the group administrator. If approved, you will receive email confirmation. Thanks for using Road Warrior!  -The Road Warrior Team";
        $http(
            {
                "method": "POST",
                "url": "https://api.mailgun.net/v3/sandbox244b4a8817e84888a7a999503925c789.mailgun.org/messages",
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + mailgunApiKey
                },
                data: "from=" + "brusinow@gmail.com" + "&to=" + "brusinow@gmail.com" + "&subject=" + "MailgunTest" + "&text=" + "blah blah"
            }
        ).then(function(success) {
            console.log("SUCCESS " + JSON.stringify(success));
        }, function(error) {
            console.log("ERROR " + JSON.stringify(error));
        });
    }


  $scope.noResults = {};
  $scope.admin = {email: ""};
  var usersRef = firebase.database().ref('users');
  var adminsRef = firebase.database().ref('admins');
  var groupsRef = firebase.database().ref('groups');
  var currentUserRef = usersRef.child(currentAuth.uid);
  var currentUserGroupRef = currentUserRef.child("groups");

  Profile(currentAuth.uid).$bindTo($scope, "profile");
   // usersRef.child(currentAuth.uid).on("value", function(user){
   //  $scope.currentUser = user.val();
   //  })


 

    $scope.joinGroup = function(){
       
    $scope.noResults = {}; 
    var searchEmail = $scope.admin.email;
    adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).once('value', function(snapshot) {
      console.log("snapshot is: ",snapshot.val());
      $scope.results = snapshot.val();
      if ($scope.results !== null){
        adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).on('child_added', function(snap){
          var foundAdmin = snap.val();
          var foundKey = snap.key;
          var groupId = foundAdmin.groupId;  
          if (foundAdmin.groupName === $scope.admin.groupName ){
            var memberEntry = {};
            memberEntry[currentAuth.uid] = {
            "name": $scope.profile.name,
            "email": $scope.profile.email,
            "userType": "pending"
            };
            groupsRef.child(groupId+"/members").update(memberEntry);
            var userGroupEntry = {};
            userGroupEntry[groupId] = {
              "name": foundAdmin.groupName,
              "access": false,
              "level": "pending"
            };
            activeGroupEntry = {
            "name": foundAdmin.groupName,
            "groupId": groupId,
            "access": false,
            "level": "pending"
            };
            console.log("userGroupEntry before submission is ",userGroupEntry);
            currentUserGroupRef.update(userGroupEntry); 
            GetSetActiveGroup.set(activeGroupEntry, currentAuth.uid);
           
            $ionicHistory.clearCache().then(function(){ $state.go('tab.today') })
          } else {
            $scope.$apply(function() {
            $scope.noResults = {"bool": true};
          });
          }
        });
        } else {
        console.log("No results. Search again.");
          $scope.$apply(function() {
            $scope.noResults = {"bool": true};
            console.log("after no results: ",$scope);
          })
        }
      })
    };   
}])

.controller('NewGroupsCtrl', ['$scope', '$ionicHistory', 'currentAuth', 'Profile','GetSetActiveGroup','$state', function($scope, $ionicHistory, currentAuth,Profile, GetSetActiveGroup, $state){
  $scope.group = {};

  var usersRef = firebase.database().ref('users');
  var adminsRef = firebase.database().ref('admins');
  var groupsRef = firebase.database().ref('groups');
  var currentUserRef = usersRef.child(currentAuth.uid);
  var currentUserGroupsRef = currentUserRef.child("groups");
  
  Profile(currentAuth.uid).$bindTo($scope, "profile");

    $scope.newGroup = function(){
      console.log("submitting new group");
      var newGroupRef = groupsRef.push();
      var groupId = newGroupRef.key;
      var memberEntry = {};
      var adminEntry = {};
      var defaultChats = {};
      var searchGroup = $scope.group.name;
      memberEntry[currentAuth.uid] = {
        "name": $scope.profile.name,
        "email": $scope.profile.email,
        "userType": "admin"
      };
      console.log("what is memberEntry? ",memberEntry);
      adminEntry[currentAuth.uid] = {
        "name": $scope.profile.name,
        "email": $scope.profile.email,
        "groupName": searchGroup,
        "groupId": groupId
      }
      console.log("what is adminEntry? ",adminEntry)
      var chatsRef = firebase.database().ref('groups/'+groupId+"chats");
      defaultChats[chatsRef.push().key] = {
        "title": 'Main',
        "camelCase": 'main',
        "groupId": groupId
      };
      defaultChats[chatsRef.push().key] = {
        "title": 'Show Related',
        "camelCase": 'showRelated',
        "groupId": groupId  
      };
      defaultChats[chatsRef.push().key] = {
        "title": 'Fun',
        "camelCase": 'fun',
        "groupId": groupId  
      };
      newGroupRef.set({
        "name": searchGroup,
        "members": memberEntry,
        "chats": defaultChats
      })
      var userGroupEntry = {};
      activeGroupEntry = {
        "name": searchGroup,
        "groupId": groupId,
        "access": true,
        "level": "admin"
      }
      userGroupEntry[groupId] = activeGroupEntry;
      adminsRef.update(adminEntry);
      currentUserGroupsRef.update(userGroupEntry);
      GetSetActiveGroup.set(activeGroupEntry, currentAuth.uid);
      $ionicHistory.clearCache();
      $state.go("tab.today");
    };
}])
