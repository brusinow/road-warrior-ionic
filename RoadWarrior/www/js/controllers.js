angular.module('roadWarrior.controllers', [])


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
        console.log("current user is: ",$scope.currentUser);
          if ($scope.currentUser.groups){
            console.log("going to today page");
            $state.transitionTo('tab.today', null, {reload: true, notify:true});
          } else {
            $state.go("groups");
            }
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
    console.log("current auth is: ",currentAuth);
    usersRef.authWithPassword({
      email: $scope.user.email,
      password: $scope.user.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Login Successful!", authData);
      
      }
    });
  };
  $scope.logout = function(){
    usersRef.unauth();
  };
}])




.controller('TodayCtrl', ['$scope', 'currentAuth', '$state','moment', function($scope, currentAuth, $state, moment){
    // $scope.currentGroup = {};
    $scope.event = {}
    $scope.result = false;
    $scope.todayDate = new moment().format('MM-DD-YYYY');
    $scope.now_formatted_date = moment().format('MMMM Do, YYYY');
    $scope.day_of_week = moment().format('dddd');
    console.log("date is: ",$scope.date);
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
  console.log("current Auth is: ",currentAuth);
    usersRef.child(currentAuth.uid).child("groups").on("child_added", function(group){
    $scope.currentGroup = group.val();
    var groupKey = group.key();
    console.log("What is access? ",$scope.currentGroup.access);
    console.log("current group is: ",$scope.currentGroup);
    console.log("current group key is: ",groupKey);
      if ($scope.currentGroup.access !== "pending"){
       

        console.log("show stuff");
        eventsRef.orderByChild('groupId').startAt(groupKey).endAt(groupKey).on("value", function(event){
          console.log("event response is: ",event.val());
          event.forEach(function(childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var key = childSnapshot.key();
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();

          // console.log("child data: ",childData.date);
          // console.log("current date is: ",$scope.todayDate);
            if ($scope.todayDate === childData.date){
              $scope.result = true;
              console.log("found one");
              console.log("actual today event is: ",childData);
              $scope.event = childData;
              
              return true;
            } 
          });
        })
      } else 
        console.log("don't show stuff");
        }, function (errorObject) {
          alert("Sorry! There was an error getting your data:" + errorObject.code);
          });
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
  $scope.noResults = {};
  $scope.admin = { email: ""};

   console.log("initial load: ",$scope);
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  var adminsRef = new Firebase("https://roadwarrior.firebaseio.com/admins");
  var groupsRef = new Firebase("https://roadwarrior.firebaseio.com/groups");
  var currentRef = usersRef.child(currentAuth.uid);
  var userGroupRef = currentRef.child("groups");
   usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
    })
    $scope.joinGroup = function(){
     $scope.noResults = {}; 
     console.log("inside function: ",$scope);
    var searchEmail = $scope.admin.email;
    adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).once('value', function(snapshot) {
      console.log("snapshot is: ",snapshot.val());
      
      $scope.results = snapshot.val();
      if ($scope.results !== null){
        console.log("response is not null");
        adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).on('child_added', function(snap){
          console.log("entering callback");
          var foundAdmin = snap.val();
          var foundKey = snap.key();
          var groupId = foundAdmin.groupId;  
          console.log("found admin is: ",foundAdmin) // output is correct now
          // console.log("found email is: ",foundAdmin.email);
          console.log("found group is: ",foundAdmin.groupName);
          console.log("key is: ",foundKey);
          if (foundAdmin.groupName === $scope.admin.groupName ){
            console.log("Yaaaaas! "+foundAdmin.groupName+" is a go!");
            var memberEntry = {};
            memberEntry[currentAuth.uid] = {
            "name": $scope.currentUser.name,
            "email": $scope.currentUser.email,
            "userType": "pending"
            };
            console.log(memberEntry);
            groupsRef.child(groupId+"/members").update(memberEntry);
            var userGroupEntry = {};
            userGroupEntry[groupId] = {
              "name": foundAdmin.groupName,
              "access": "pending"
            }
            userGroupRef.update(userGroupEntry);  
            $state.go("tab.today");
          } else {
            $scope.$apply(function() {
            $scope.noResults = {"bool": true};
            console.log("Mwah mwah. Email found but group name didn't match.");
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

.controller('NewGroupsCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  $scope.group = {};

  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  var adminsRef = new Firebase("https://roadwarrior.firebaseio.com/admins");
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
      var groupId = newGroupRef.key();
      var memberEntry = {};
      var adminEntry = {};
      var searchGroup = $scope.group.name;
      memberEntry[currentAuth.uid] = {
        "name": $scope.currentUser.name,
        "email": $scope.currentUser.email,
        "userType": "admin"
      };
      adminEntry[currentAuth.uid] = {
        "name": $scope.currentUser.name,
        "email": $scope.currentUser.email,
        "groupName": searchGroup,
        "groupId": groupId
      }
      groupsRef.child(groupId).set({
        "name": searchGroup,
        "members": memberEntry
      })
      var userGroupEntry = {};
      userGroupEntry[groupId] = {
        "name": searchGroup,
        "access": "admin"
      }
      adminsRef.update(adminEntry);
      currentUserGroupsRef.update(userGroupEntry);
      $state.go("tab.today");
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

.controller('AccountCtrl', ['$scope', '$http','currentAuth', '$state','$ionicModal','$ionicPopover','ionicDatePicker', function($scope, $http, currentAuth, $state, $ionicModal, $ionicPopover, ionicDatePicker){
    // get current user info
    $scope.event = {};
    $scope.save = {};
    var geocoder = new google.maps.Geocoder();
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
    $scope.currentAuth = currentAuth;
    usersRef.child(currentAuth.uid).child("groups").on("child_added", function(group){
           if (currentAuth.facebook){
            console.log("facebook",currentAuth);
        $scope.user = currentAuth.facebook.displayName;
      } else {
            console.log("not facebook",currentAuth);
            console.log("current group: ",group.val());
            var currentGroup = group.val();
            $scope.accountType = currentGroup.access;
            $scope.save.groupId = group.key();
            $scope.save.groupName = currentGroup.name;
        $scope.user = currentAuth.auth.token.email;
      }
    }, function (errorObject) {
      console.log("Sorry! There was an error getting your data:" + errorObject.code);
    });
    $scope.logout = function(){
      usersRef.unauth();
      $state.go("login");
    };

    // New Event Modal
     $ionicModal.fromTemplateUrl('templates/newEventModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.newEventModal = modal;
   
    
  });
  $scope.openNewEventModal = function() {
    $scope.event = {};
    $scope.newEventModal.show();
  };
  $scope.closeNewEventModal = function() {
    $scope.newEventModal.hide();
  };
  $scope.submitNewEventModal = function() {
    console.log("event to be submitted is: ",$scope.event);
        if ($scope.event.address && $scope.event.address.length > 0) {
            if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({ 'address': $scope.event.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  console.log("results are: ",results)
                  $scope.event.lat = results[0].geometry.location.lat();
                  $scope.event.lng = results[0].geometry.location.lng();
                  $scope.event.address = results[0].formatted_address;
                  var latlng = {lat: $scope.event.lat, lng: $scope.event.lng};
                  console.log("lat/lng is: ",latlng);
                  this.geocoder = new google.maps.Geocoder();
                  this.geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                          for (var ac = 0; ac < results[0].address_components.length; ac++) {
                                    var component = results[0].address_components[ac];
                                    switch(component.types[0]) {
                                        case 'locality':
                                            $scope.event.city = component.long_name;
                                            break;
                                        case 'administrative_area_level_1':
                                            $scope.event.state = component.short_name;
                                            break;
                                    }
                                };
                                $scope.event.cityState = $scope.event.city+", "+$scope.event.state; 
                                $scope.event.groupId = $scope.save.groupId;
                                $scope.event.groupName = $scope.save.groupName;
                                console.log("The show is in ",$scope.event.cityState);
                                var newEventEntry = {};
                                var newEventRef = eventsRef.push();
                                var eventId = newEventRef.key();
                                newEventEntry[eventId] = $scope.event;
                                eventsRef.update(newEventEntry);
                                
                                $scope.newEventModal.hide();
                    } else {
                      window.alert('No first geocode results.');
                      }
                  });

                } else {
                    alert("Sorry, this search produced no results.");
                }
            });
        }
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.newEventModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('newEventModal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('newEventModal.removed', function() {
    // Execute action
  });

   var ipObj1 = {
      callback: function (val) {  //Mandatory
        console.log('Return value from the datepicker popup is : ',val);
        $scope.event.date = moment(val).format('MM-DD-YYYY');
        console.log("day is: ",$scope.event.date);
      },
      disabledDates: [            //Optional
        new Date(2016, 2, 16),
        new Date(2015, 3, 16),
        new Date(2015, 4, 16),
        new Date(2015, 5, 16),
        new Date('Wednesday, August 12, 2015'),
        new Date("08-16-2016"),
        new Date(1439676000000)
      ],
      from: new Date(2012, 1, 1), //Optional
      to: new Date(2016, 10, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
           //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(ipObj1);
    };







  //Popover for New Event Address Suggestions
  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event) {
    var fullQuery = '/api/place/textsearch/json?query=' + $scope.event.venue +" "+ $scope.event.cityState + '&key=AIzaSyCJpKi0u-5QY2pbNgURwwbJLTQ-rXRkEv8';
    console.log(fullQuery);
    var req = {
      url: fullQuery,
      method: 'GET',
    }

    $http(req).then(function success(res) {
      console.log(res)
      $scope.results = res.data.results;
      console.log($scope.results);
      $scope.popover.show($event);
    }, function error(res) {
    //do something if the response has an error
        console.log(res);
      }); 
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  $scope.selectAddress = function(result){
    console.log("result of click is: ",result);
    $scope.event.address = result.formatted_address;
    $scope.event.venue = result.name;
    $scope.popover.hide();
  }
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  
}])

