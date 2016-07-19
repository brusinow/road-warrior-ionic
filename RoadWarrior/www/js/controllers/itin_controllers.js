angular.module('roadWarrior.controllers')


.controller('EditItinCtrl', ['$scope', '$http','$firebaseArray','$firebaseObject','$ionicHistory', 'EditItin', 'sendDataService', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $firebaseObject, $ionicHistory, EditItin, sendDataService, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    
    var data = sendDataService.get();
    console.log("what is data? ",data);
    $scope.event = data.event;
    $scope.submitted = false;
    console.log("submitted is ",$scope.submitted);


    $scope.itin = EditItin(data.itin.id);
    console.log("nextDay is ",data.itin.nextDay);
   
  
    $scope.deleteItin = function(thisItin){
      var itinRef = firebase.database().ref('itins/'+thisItin.$id);
      itinRef.remove()
      .then(function() {
      console.log("Remove succeeded.");
      $ionicHistory.goBack();
      })
      .catch(function(error) {
      console.log("Remove failed: " + error.message)
      });

    }
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


.controller('NewDayItinCtrl', ['$scope', '$http','$firebaseArray','$firebaseObject','$ionicHistory', 'EditItin', 'sendDataService', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $firebaseObject, $ionicHistory, EditItin, sendDataService, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    


    $scope.event = sendDataService.get();
    $scope.submitted = false;
    console.log("submitted is ",$scope.submitted);


    $scope.itin = {
      nextDay: false
    }

     ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){})
  
 
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



    $scope.submitNewItin = function(event) {
    $scope.submitted = true;
     itineraryService.createItinItem($scope, event);
     $ionicHistory.goBack();
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


  // $scope.submitNewItin = function() {
  //   console.log($scope.selectedEvent.select.eventId);
  //    itineraryService.createItinItem($scope);
  //    $state.go("tab.account");
  // };

}])