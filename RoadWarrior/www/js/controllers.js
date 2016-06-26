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




.controller('TodayCtrl', ['$scope', 'currentAuth','itineraryService','userService', '$state','moment', function($scope, currentAuth, itineraryService, userService, $state, moment){
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");


    // if(lng && lat){
    //     // **********open weather api*******
    //   var api = 'http://api.openweathermap.org/data/2.5/weather?'; 
   
    // var key = process.env.WEATHER_KEY; 
    // var lat = 'lat=' + lat;
    // var lng = '&lon=' + lng;
    // var fullQuery = '/data/2.5/weather?' + $scope.event.venue +" "+ $scope.event.cityState + '&key=AIzaSyCJpKi0u-5QY2pbNgURwwbJLTQ-rXRkEv8';
    // console.log(fullQuery);
    // var req = {
    //   url: fullQuery,
    //   method: 'GET',
    // }

    // $http(req).then(function success(res) {
    //   console.log(res)
    //   $scope.results = res.data.results;
    //   console.log("results for popover are: ",$scope.results);
    //   $scope.popover.show($event);
    // }, function error(res) {
    // //do something if the response has an error
    //     console.log(res);
    //   }); 



    $scope.event = {}
    $scope.todayDate = moment().format('MM-DD-YYYY');
    $scope.now_formatted_date = moment().format('MMMM Do, YYYY');
    $scope.day_of_week = moment().format('dddd');
    usersRef.child(currentAuth.uid).child("groups").on("child_added", function(group){
    $scope.currentGroup = group.val();
    var groupKey = group.key();
      if ($scope.currentGroup.access !== "pending"){
        eventsRef.orderByChild('groupId').startAt(groupKey).endAt(groupKey).on("value", function(event){
          event.forEach(function(childSnapshot) {
            var key = childSnapshot.key();
            var childData = childSnapshot.val();
            if ($scope.todayDate === childData.date){
              $scope.result = true;
              $scope.event = childData;
              itineraryService.getItinItems($scope, key);
              return true;
            }  
          });
          if ($scope.result !== true){
            $scope.result = false;
          }
        })
      } else 
        console.log("don't show stuff");
        }, function (errorObject) {
          alert("Sorry! There was an error getting your data:" + errorObject.code);
          });
  
}])

.controller('GroupsCtrl', ['$scope', 'currentAuth', '$state', function($scope, currentAuth, $state){
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  usersRef.child(currentAuth.uid).on("value", function(user){
    $scope.currentUser = user.val();
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
  $scope.admin = {email: ""};
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
    var searchEmail = $scope.admin.email;
    adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).once('value', function(snapshot) {
      console.log("snapshot is: ",snapshot.val());
      $scope.results = snapshot.val();
      if ($scope.results !== null){
        adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).on('child_added', function(snap){
          var foundAdmin = snap.val();
          var foundKey = snap.key();
          var groupId = foundAdmin.groupId;  
          if (foundAdmin.groupName === $scope.admin.groupName ){
            var memberEntry = {};
            memberEntry[currentAuth.uid] = {
            "name": $scope.currentUser.name,
            "email": $scope.currentUser.email,
            "userType": "pending"
            };
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

.controller('AccountCtrl', ['$scope', '$http','currentAuth', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, currentAuth, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    $scope.orderByDate = function(event){
    var unixTime = moment(event.date, "MM-DD-YYYY");
    return unixTime;
    };

    if (currentAuth.facebook){
        console.log("facebook",currentAuth);
        $scope.user = currentAuth.facebook.displayName;
    } else {
        console.log("not facebook",currentAuth);
        $scope.user = currentAuth.auth.token.email;
      }

    $scope.selectedEvent = {};
    $scope.nextDay = false; 
    $scope.event = {};
    $scope.save = {};
    var geocoder = new google.maps.Geocoder();
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
    $scope.currentAuth = currentAuth;
    usersRef.child(currentAuth.uid).child("groups").on("child_added", function(group){
            console.log("current group: ",group.val());
            var currentGroup = group.val();
            $scope.accountType = currentGroup.access;
            $scope.save.groupId = group.key();
            eventsService.allGroupEvents($scope, $scope.save.groupId);
            eventsService.todayGroupEvents($scope, $scope.save.groupId);
            $scope.save.groupName = currentGroup.name;
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
    eventsService.createEvent($scope, $scope.event);
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
        $scope.event.longDate = moment(val).format('MMMM Do, YYYY');
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


    var ipObj2 = {
    callback: function (val) {      //Mandatory
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        $scope.itin.startTimeUnix = val;
        console.log("startTime Unix: ",$scope.itin.startTimeUnix);
        $scope.itin.startTime = helperService.timeFormat($scope, val);
        console.log("converted time? ",$scope.itin.startTime);

      }
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set'    //Optional
  };
// .format('hh:mm A');
     var ipObj3 = {
    callback: function (val) {      //Mandatory
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        $scope.itin.endTimeUnix = val;
        console.log("val is: ",$scope.itin.endTimeUnix);
        $scope.itin.endTime = helperService.timeFormat($scope, val);
        console.log("converted time? ",$scope.itin.endTime);
        // var selectedTime = new Date(val * 1000);
        // console.log("selected time is: ",selectedTime);
        // console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
      }
    },
    inputTime: 50400,   //Optional
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set'    //Optional
  };

    $scope.openStartTimePicker = function(){
      ionicTimePicker.openTimePicker(ipObj2);
    };

    $scope.openEndTimePicker = function(){
      ionicTimePicker.openTimePicker(ipObj3);
    };


   // New Itin Modal
    $ionicModal.fromTemplateUrl('templates/newItinModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.newItinModal = modal; 
  });
  $scope.openNewItinModal = function() {
    $scope.itin = {};
    $scope.newItinModal.show();
  };
  $scope.nextDayToggle = function() {
          if ($scope.nextDay == false) {
              $scope.nextDay = true;
          } else
              $scope.nextDay = false;
          console.log('testToggle changed to ' + $scope.nextDay);
  };
  $scope.closeNewItinModal = function() {
    $scope.selectedEvent = {};
    $scope.newItinModal.hide();
        
      };
  $scope.submitNewItinModal = function() {
    console.log($scope.selectedEvent.select.eventId);
     itineraryService.createItinItem($scope);
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.newItinModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('newItinModal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('newItinModal.removed', function() {
    // Execute action
  });


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
      console.log("results for popover are: ",$scope.results);
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

