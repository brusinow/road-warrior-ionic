angular.module('roadWarrior.controllers')

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
      $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId));
      $scope.events.$loaded()
      .then(function(){
        console.log("what is events? ",$scope.events); 
      })



      $scope.oldEvents = $firebaseArray(eventsRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId))
      $scope.oldEvents.$loaded()
      .then(function(){
        console.log("what is oldEvents? ",$scope.oldEvents); 
      })
     


      
      
      $scope.groups = $firebaseArray(userGroupsRef);
        $scope.groups.$loaded()
          .then(function(){
           
          })
  })



  $scope.whatSelected = function(){
    console.log("selected is ",$scope.selection);
  }

  $scope.updateEvents = function(){
    eventsService.editEvent($scope);
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