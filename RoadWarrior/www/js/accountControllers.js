angular.module('roadWarrior.controllers')

.controller('AccountCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    var geocoder = new google.maps.Geocoder();
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
    var userGroupsRef = new Firebase("https://roadwarrior.firebaseio.com/users/"+currentAuth.uid+"/groups");
    $scope.submitted = false;
    console.log("submitted is ",$scope.submitted);

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
      usersRef.unauth();
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
     $state.go("tab.account");
  };

  

  
}])



.controller('NewEventCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
  $scope.event = {};
  Profile(currentAuth.uid).$bindTo($scope, "profile");


  $scope.submitNewEvent = function() {
    console.log("current auth is: ",currentAuth);
    eventsService.createEvent($scope, $scope.event, currentAuth.uid);
    $state.go("tab.account");
  };





 var ipObj1 = {
      callback: function (val) {  //Mandatory
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

$ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event) {
    var fullQuery = '/api/place/textsearch/json?query=' + $scope.event.venue +" "+ $scope.event.cityState + '&key='+__env.GOOGLE_PLACES_KEY;
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

.controller('EditEventCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
  var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
  var userGroupsRef = new Firebase("https://roadwarrior.firebaseio.com/users/"+currentAuth.uid+"/groups");


  $scope.updateEvents = function(){
      console.log("what is $scope.events? ",$scope.events);
      angular.forEach($scope.events, function(event) {
        console.log("event in loop: ",event)
        $scope.thisEvent = event;
          this.geocoder = new google.maps.Geocoder();
              this.geocoder.geocode({ 'address': $scope.thisEvent.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  console.log("results are: ",results)
                  $scope.thisEvent.lat = results[0].geometry.location.lat();
                  $scope.thisEvent.lng = results[0].geometry.location.lng();
                  $scope.thisEvent.address = results[0].formatted_address;
                  var latlng = {lat: $scope.thisEvent.lat, lng: $scope.thisEvent.lng};
                  console.log("lat/lng is: ",latlng);
                  this.geocoder = new google.maps.Geocoder();
                  this.geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                      for (var ac = 0; ac < results[0].address_components.length; ac++) {
                        var component = results[0].address_components[ac];
                        console.log("what is component? ",component);
                        switch(component.types[0]) {
                          case 'locality':
                            $scope.thisEvent.city = component.long_name;
                            break;
                          case 'administrative_area_level_1':
                            $scope.thisEvent.state = component.short_name;
                            break;
                        }
                      };
                      $scope.thisEvent.cityState = $scope.thisEvent.city+", "+$scope.thisEvent.state; 
                      console.log("cityState is ",$scope.thisEvent.cityState);
                      console.log("this event to be saved: ",$scope.thisEvent);
                      $scope.events.$save($scope.thisEvent).then(function(ref) {
                        console.log("Ref val: ",ref.val);
                      });
                    }
                      


                  })
                } 
              });
          
      })
      $state.go("tab.account");
  }


   ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
      $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId))
      $scope.groups = $firebaseArray(userGroupsRef);
        $scope.groups.$loaded()
          .then(function(){
           $scope.selected = $scope.events[0];
          })
    })

   $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event) {
    var fullQuery = '/api/place/textsearch/json?query=' + $scope.selected.venue +" "+ $scope.selected.cityState + '&key='+__env.GOOGLE_PLACES_KEY;
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
    $scope.selected.address = result.formatted_address;
    console.log("event address is: ",$scope.selected.address);
    $scope.selected.venue = result.name;
    console.log("venue is: ",$scope.selected.venue);
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
        $scope.selected.unixDate = val;
        $scope.selected.dayOfWeek = moment(val).format('dddd');
        $scope.selected.date = moment(val).format('MM-DD-YYYY');
        $scope.selected.longDate = moment(val).format('MMMM Do, YYYY');
        console.log("day is: ",$scope.selected.date);
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

    







    // var ipObj2 = {
    //   callback: function (val) {      //Mandatory
    //     if (typeof (val) === 'undefined') {
    //       console.log('Time not selected');
    //     } else {
    //       $scope.itin.startTimeUnix = val;
    //       console.log("startTime Unix: ",$scope.itin.startTimeUnix);
    //       $scope.itin.startTime = helperService.timeFormat($scope, val);
    //       console.log("converted time? ",$scope.itin.startTime);

    //     }
    //   },
    //   inputTime: $scope.itin.startTimeUnix,   //Optional
    //   format: 12,         //Optional
    //   step: 15,           //Optional
    //   setLabel: 'Set'    //Optional
    // };
// .format('hh:mm A');
  //   var ipObj3 = {
  //     callback: function (val) {      //Mandatory
  //       if (typeof (val) === 'undefined') {
  //         console.log('Time not selected');
  //       } else {
  //         $scope.itin.endTimeUnix = val;
  //         console.log("val is: ",$scope.itin.endTimeUnix);
  //         $scope.itin.endTime = helperService.timeFormat($scope, val);
  //         console.log("converted time? ",$scope.itin.endTime);
  //         // var selectedTime = new Date(val * 1000);
  //         // console.log("selected time is: ",selectedTime);
  //         // console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
  //       }
  //   },
  //   inputTime: $scope.itin.endTimeUnix,   //Optional
  //   format: 12,         //Optional
  //   step: 15,           //Optional
  //   setLabel: 'Set'    //Optional
  // };

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
  
