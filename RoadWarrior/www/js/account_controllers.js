angular.module('roadWarrior.controllers')

.controller('AccountCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory', 'currentAuth','Profile','Auth','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, currentAuth, Profile, Auth, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    var geocoder = new google.maps.Geocoder();
    var usersRef = firebase.database().ref('users');
    var eventsRef = firebase.database().ref('events');
    var userGroupsRef = firebase.database().ref("users/"+currentAuth.uid+"/groups");
    $scope.submitted = false;
    console.log("submitted is ",$scope.submitted);
    $scope.selectedEvent = {};
    $scope.itin = {};
    Profile(currentAuth.uid).$bindTo($scope, "profile");


    $scope.nextDayToggle = function() {
          if ($scope.nextDay == false) {
              $scope.nextDay = true;
          } else {
              $scope.nextDay = false;
            }
          console.log('testToggle changed to ' + $scope.nextDay);
    };

    $scope.newEvent = function(){
      $state.go("tab.account-newEvent");
    }

     $scope.pendingUsers = function(){
      $state.go("tab.account-pending");
    }

    $scope.editEvent = function(){
      $state.go("tab.account-editEvent");
    }

    $scope.newItin = function(){
      $state.go("tab.account-newItin");
    }


    $scope.newGroup = function(){
      $state.go("newGroup");
    }

    $scope.switchGroup = function(group){
      GetSetActiveGroup.set(group, currentAuth.uid);
      $ionicHistory.clearCache();
    }

    ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
      $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId))
      $scope.groups = $firebaseArray(userGroupsRef);
        $scope.groups.$loaded()
          .then(function(){
            angular.forEach($scope.groups, function(group) {
              if ($scope.thisGroup.name === group.name){
              $scope.selected = group;
              }
            })
          })
    })

    $scope.orderByDate = function(event){
    var unixTime = moment(event.date, "MM-DD-YYYY");
    return unixTime;
    };

    if (currentAuth.facebook){
        console.log("facebook",currentAuth);
    } else {
        console.log("not facebook",currentAuth);
    }
      $scope.currentAuth = currentAuth;
      $scope.selectedEvent = {};
      $scope.nextDay = false; 
      $scope.event = {};
    
    $scope.logout = function(){
      Auth.$signOut();
      $state.go("login");
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


  $scope.submitNewItin = function() {
  
    $scope.submitted = true;
     itineraryService.createItinItem($scope);
     console.log("What is selected date after service? ",$scope.selectedEvent.select);
     $state.go("tab.account");
  };

  

  
}])



.controller('NewEventCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory','$ionicLoading','Popover','currentAuth', 'Profile','FirebaseEnv','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, $ionicLoading, Popover, currentAuth, Profile, FirebaseEnv, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
  var ENV = FirebaseEnv();

  $scope.event = {};
  $scope.submitted = false;
  console.log("submitted is ",$scope.submitted);
  $scope.eventExists = false;
  Profile(currentAuth.uid).$bindTo($scope, "profile");

  var eventsRef = firebase.database().ref("events");
  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
      $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId))
      $scope.events.$loaded()
        .then(function(){
        console.log("events list is ",$scope.events);
      })
    })


  $scope.submitNewEvent = function() {
    $scope.submitted = true;
    console.log("submitted after click is ",$scope.submitted);
    eventsService.createEvent($scope);
    $state.go("tab.account");
  };



 var ipObj1 = {
      callback: function (val) {  //Mandatory
        $scope.eventExists = false;
        console.log('Return value from the datepicker popup is : ',val);
        $scope.event.unixDate = val;
        $scope.event.dayOfWeek = moment(val).format('dddd');
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
      from: new Date(2015, 1, 1), //Optional
      to: new Date(2017, 05, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(ipObj1);
    };

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event, query){
    console.log("what is query? ",query);
    Popover.openPopover(query).then(function(data){
      console.log("what is data? ",data);
      $scope.results = data.data.results;
      $scope.popover.show($event);
    })  
  }


  $scope.selectAddressVenue = function(result){
    console.log("result of click is: ",result);
    $scope.event.address = result.formatted_address;
    console.log("event address is: ",$scope.event.address);
    $scope.event.venue = result.name;
    console.log("venue is: ",$scope.event.venue);
    $scope.popover.hide();
    console.log("popover should be closed");
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

.controller('EditEventCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory', 'currentAuth','Profile','Popover','FirebaseEnv','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, currentAuth, Profile, Popover, FirebaseEnv, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
   var ENV = FirebaseEnv();
  var eventsRef = firebase.database().ref('events');
  var userGroupsRef = firebase.database().ref("users/"+currentAuth.uid+"/groups");
  $scope.selection = {};


  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
      $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId))
      $scope.groups = $firebaseArray(userGroupsRef);
        $scope.groups.$loaded()
          .then(function(){
           $scope.selection.mySelect = $scope.events[0];
          })
  })



  $scope.whatSelected = function(){
    console.log("selected is ",$scope.selection);
  }

  $scope.updateEvents = function(){
      console.log("what is $scope.events? ",$scope.events);
      angular.forEach($scope.events, function(event) {
        console.log("event in loop: ",event)
          this.geocoder = new google.maps.Geocoder();
              this.geocoder.geocode({ 'address': event.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  // console.log("results are: ",results)
                  event.lat = results[0].geometry.location.lat();
                  event.lng = results[0].geometry.location.lng();
                  event.address = results[0].formatted_address;
                  var latlng = {lat: event.lat, lng: event.lng};
                  // console.log("lat/lng is: ",latlng);
                    this.geocoder = new google.maps.Geocoder();
                    this.geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                      for (var ac = 0; ac < results[0].address_components.length; ac++) {
                        var component = results[0].address_components[ac];
                        // console.log("what is component? ",component);
                        switch(component.types[0]) {
                          case 'locality':
                            event.city = component.long_name;
                            break;
                          case 'administrative_area_level_1':
                            event.state = component.short_name;
                            break;
                        }
                      };
                      event.cityState = event.city+", "+event.state; 
                      // console.log("cityState is ",event.cityState);
                      // console.log("this event to be saved: ",event);
                      $scope.events.$save(event).then(function(ref) {
                        // console.log("Ref val: ",ref.val);
                      });
                    }
                      


                  })
                } 
              });
          
      })
      $state.go("tab.account");
  }


   

   $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });



  $scope.openPopover = function($event, query){
    console.log("what is query? ",query);
    Popover.openPopover(query).then(function(data){
      console.log("what is data? ",data);
      $scope.results = data.data.results;
      $scope.popover.show($event);
    })  
  }


  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.selectAddressVenue = function(result){
    console.log("result of click is: ",result);
    $scope.selection.mySelect.address = result.formatted_address;
    console.log("event address is: ",$scope.selection.mySelect.address);
    $scope.selection.mySelect.venue = result.name;
    console.log("venue is: ",$scope.selection.mySelect.venue);
    $scope.popover.hide();
    console.log("popover should be closed");
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



   var ipObj1 = {
      callback: function (val) {  //Mandatory
        console.log('Return value from the datepicker popup is : ',val);
        $scope.selection.mySelect.unixDate = val;
        $scope.selection.mySelect.dayOfWeek = moment(val).format('dddd');
        $scope.selection.mySelect.date = moment(val).format('MM-DD-YYYY');
        $scope.selection.mySelect.longDate = moment(val).format('MMMM Do, YYYY');
        console.log("day is: ",$scope.selection.mySelect.date);
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
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(ipObj1);
    };


  }])


.controller('EditItinCtrl', ['$scope', '$http','$firebaseArray','$firebaseObject','$ionicHistory', 'EditItin', 'sendDataService', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $firebaseObject, $ionicHistory, EditItin, sendDataService, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    


    
    var data = sendDataService.get();
    console.log("what is data? ",data);
    $scope.event = data.event;
    $scope.submitted = false;
    console.log("submitted is ",$scope.submitted);


    $scope.itin = EditItin(data.itin.id);
    console.log("nextDay is ",data.itin.nextDay);
   
  
 
    // $scope.toggleSwitch = function(startTimeUnix){
    //   if (startTimeUnix >= 86400){
    //     return true;
    //   } else {
    //     return false
    //   }
    // }

    $scope.nextDayToggle = function() {
          console.log('testToggle changed to ' + $scope.itin.nextDay);
    };

    $scope.updateItin = function(){
      console.log("click");
      console.log("what is myItins? ",$scope.itinList);
      console.log("itin to be submitted: ",$scope.itin);
      console.log("submitted is ",$scope.submitted);
        if ($scope.itin.startTimeUnix < 86400 && $scope.itin.nextDay){
          $scope.itin.nextDay = true;
          $scope.itin.startTimeUnix = $scope.itin.startTimeUnix + 86400;
          if ($scope.itin.endTimeUnix){
            $scope.itin.endTimeUnix = $scope.itin.endTimeUnix + 86400;
          }
        } else if ($scope.itin.startTimeUnix >= 86400 && !$scope.itin.nextDay){
          $scope.itin.nextDay = false;
          $scope.itin.startTimeUnix = $scope.itin.startTimeUnix - 86400;
          if ($scope.itin.endTimeUnix){
            $scope.itin.endTimeUnix = $scope.itin.endTimeUnix - 86400;
          }
        } else {
          console.log("no toggle change needed");
        }

    
        $scope.itin.$save().then(function(ref) {
        console.log(ref);
        $ionicHistory.goBack();
        }, function(error) {
        console.log("Error:", error);
        });
   

      // $scope.itinList.$save($scope.itin).then(function(ref) {
      //     console.log("Ref val: ",ref.val);
      //     $ionicHistory.backView();
      // }).catch(function(data){
      //   console.log("error! ",data);
      // });
     
    }

    







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
      inputTime: data.itin.startTimeUnix,   //Optional
      format: 12,         //Optional
      step: 15,           //Optional
      setLabel: 'Set'    //Optional
    };

    var ipObj3 = {
      callback: function (val) {      //Mandatory
        if (typeof (val) === 'undefined') {
          console.log('Time not selected');
        } else {
          $scope.itin.endTimeUnix = val;
          console.log("val is: ",$scope.itin.endTimeUnix);
          $scope.itin.endTime = helperService.timeFormat($scope, val);
          console.log("converted time? ",$scope.itin.endTime);
          var selectedTime = new Date(val * 1000);
          console.log("selected time is: ",selectedTime);
          console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
        }
    },
    inputTime: data.itin.endTimeUnix || 50400,   //Optional
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


  // $scope.submitNewItin = function() {
  //   console.log($scope.selectedEvent.select.eventId);
  //    itineraryService.createItinItem($scope);
  //    $state.go("tab.account");
  // };

}])

.controller('PendingUserCtrl', ['$scope', '$http','$firebaseArray','$firebaseObject','currentAuth','Profile','GetSetActiveGroup','ActiveGroup', '$state', function($scope, $http,$firebaseArray,$firebaseObject,currentAuth,Profile,GetSetActiveGroup,ActiveGroup, $state){
  
  // var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  // var adminsRef = new Firebase("https://roadwarrior.firebaseio.com/admins");
  // var groupsRef = new Firebase("https://roadwarrior.firebaseio.com/groups");
  // var currentUserRef = usersRef.child(currentAuth.uid);
  // var currentUserGroupRef = currentUserRef.child("groups");

  Profile(currentAuth.uid).$bindTo($scope, "profile");

  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
    var thisGroup = $scope.thisGroup.groupId;
    console.log("this group is ",thisGroup);
    var memberRef = firebase.database().ref("groups/"+thisGroup+"/members");
      $scope.pendingMembers = $firebaseArray(memberRef.orderByChild('userType').startAt('pending').endAt('pending'))
        $scope.pendingMembers.$loaded()
          .then(function(){
           console.log("pending members are ",$scope.pendingMembers);
          })
  })


  $scope.accept = function(user){
    var activeGroupRef = firebase.database().ref('activeGroup/'+user.$id);
    var activeUserObj = $firebaseObject(activeGroupRef);
    activeUserObj.access = true;
    activeUserObj.groupId = $scope.thisGroup.groupId;
    activeUserObj.name = $scope.thisGroup.name;
    activeUserObj.level = "user";
    activeUserObj.$save().then(function(ref) {
      console.log("ref is ",ref.val()) // true
    }, function(error) {
      console.log("Error:", error);
    });

    var currentGroupMemberRef = firebase.database().ref('groups/'+$scope.thisGroup.groupId+'/members/'+user.$id);
    var groupMemberObj = $firebaseObject(currentGroupMemberRef);
    groupMemberObj.userType = 'user';
    groupMemberObj.name = user.name;
    groupMemberObj.email = user.email;
    groupMemberObj.$save().then(function(ref) {
     console.log("ref is ",ref.val()) 
    }, function(error) {
      console.log("Error:", error);
    });

    var thisUserGroupRef = firebase.database().ref('users/'+user.$id+'/groups/'+$scope.thisGroup.groupId);
    var currentUserObj = $firebaseObject(thisUserGroupRef);
    currentUserObj.access = true;
    currentUserObj.level = "user";
    currentUserObj.groupId = $scope.thisGroup.groupId;
    currentUserObj.name = $scope.thisGroup.name;
    currentUserObj.$save().then(function(ref) {
     console.log("ref is ",ref.val()) 
    }, function(error) {
      console.log("Error:", error);
    });

  }


    $scope.decline = function(user){
    var activeGroupRef = firebase.database().ref('activeGroup/'+user.$id);
    var activeUserObj = $firebaseObject(activeGroupRef);
    activeUserObj.$remove().then(function(ref) {
  // data has been deleted locally and in the database
    }, function(error) {
        console.log("Error:", error);
    });


    var currentGroupMemberRef = firebase.database().ref('groups/'+$scope.thisGroup.groupId+'/members/'+user.$id);
    var groupMemberObj = $firebaseObject(currentGroupMemberRef);
    groupMemberObj.$remove().then(function(ref) {
     console.log("ref is ",ref.val()) 
    }, function(error) {
      console.log("Error:", error);
    });

    var thisUserGroupRef = firebase.database().ref('users/'+user.$id+'/groups/'+$scope.thisGroup.groupId);
    var currentUserObj = $firebaseObject(thisUserGroupRef);
    currentUserObj.$remove().then(function(ref) {
     console.log("ref is ",ref.val()) 
    }, function(error) {
      console.log("Error:", error);
    });

  }


}])
