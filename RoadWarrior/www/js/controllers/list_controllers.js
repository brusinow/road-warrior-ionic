angular.module('roadWarrior.controllers')



.controller ('ListCtrl', ['$scope','$firebaseArray', 'currentAuth', 'thisGroup', 'sendDataService', 'ActiveGroup', 'itineraryService', 'helperService','MyYelpAPI', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, thisGroup, sendDataService, ActiveGroup, itineraryService, helperService, MyYelpAPI, $state, $http, $q, moment,Yahoo){
  $scope.loaded = false;
  $scope.thisGroup = thisGroup;
  var eventRef = firebase.database().ref('events');
  if ($scope.thisGroup){
  $scope.events = $firebaseArray(eventRef.orderByChild('groupId').startAt(thisGroup.groupId).endAt(thisGroup.groupId));
  $scope.groupItins = itineraryService.getAllGroupItins(thisGroup.groupId);
  $scope.groupItins.$loaded().then(function(){
    console.log("what are itins? ",$scope.groupItins);
  });
  $scope.events.$loaded()
    .then(function(){
      $scope.loaded = true; 
    })  
  } else {
    console.log("no active group");
    $scope.loaded = true;
  }

   $scope.newEvent = function(){
      $state.go("tab.list-newEvent");
    }
              

  $scope.viewDay = function(event){
    sendDataService.set(event);
    $state.go("tab.listShow");
  }
}])


.controller ('ListShowCtrl', ['$scope', '$firebaseArray','currentAuth', 'thisGroup', 'sendDataService', 'itineraryService', 'helperService', 'ActiveGroup', 'MyYelpAPI', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, thisGroup, sendDataService, itineraryService, helperService, ActiveGroup, MyYelpAPI, $state, $http, $q, moment,Yahoo){
    $scope.loaded = false;
    $scope.weatherLoaded = false;
    $scope.itinsLoaded = false;
    $scope.weatherData = {};
    $scope.groupItins = itineraryService.getAllGroupItins(thisGroup.groupId);
      $scope.groupItins.$loaded().then(function(){
      console.log("what are itins? ",$scope.groupItins);
    });

    ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
      console.log("this group loaded");
    });

     $scope.editEvent = function(event){
      sendDataService.set(event);
      $state.go("tab.list-editDayEvent")
    }

    $scope.newItin = function(event){
      sendDataService.set(event);
      $state.go("tab.list-newItin");
    }



    $scope.editItin = function(itin, event){
      var eventWithItin = {
        itin: itin,
        event: event
      };

      sendDataService.set(eventWithItin);
      $state.go("tab.list-editItin");
    }

    $scope.toggleItin = function(itin) {
    if (itin.details){
    itin.show = !itin.show;
    }
    };
    
    $scope.isItinShown = function(itin) {
      if (itin.details){
    return itin.show;
    }
    };

    $scope.tooLong = function(text){
      if (text.length >= 23){
        return true
      } else {
        return false
      }
    }

  var itinsRef = firebase.database().ref('itins');
  $scope.event = sendDataService.get();
  console.log("event: ",$scope.event);
  $scope.event.weekDay = moment($scope.event.unixDate).format('dddd');
  $scope.loaded = true;
  console.log("loaded is ",$scope.loaded)
  
  $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id));
  $scope.itins.$loaded()
  .then(function(){
    console.log("itins: ",$scope.itins);
    $scope.itinsLoaded = true;
    console.log("itins are ",$scope.itinsLoaded)
  });







  $scope.toList = function(){
    $state.go("tab.list");
  }  





  var connectedRef = firebase.database().ref('.info/connected');
  connectedRef.on('value', function(snap) {
  if (snap.val() === true) {

        var lat = $scope.event.lat;
    var lng = $scope.event.lng;
    if (lat && lng){
    Yahoo.getYahooData(lat,lng).then(function(data){
      console.log("WHAT IS DATA???? ",data);
      var thisDayFormatted = moment($scope.event.unixDate).format('DD MMM YYYY');
      console.log("this day formatted is: ",thisDayFormatted);
      var forecasts = data.forecast;

      angular.forEach(forecasts, function(forecast) {
        if (forecast.date === thisDayFormatted){
          $scope.weatherData = forecast;
          $scope.weatherLoaded = true;
          console.log("weatherloaded is ",$scope.weatherLoaded);
        }       
      })
  
      if (!$scope.weatherLoaded){
        $scope.weatherLoaded = true;
        console.log("weatherloaded is ",$scope.weatherLoaded);
      }
    });
   } else {
    $scope.weatherLoaded = true;
   }




  } else {
    // if not connected
    $scope.weatherLoaded = true;
  }
});















    $scope.data = {};
    $scope.$watch('data.slider', function(nv, ov) {
    $scope.slider = $scope.data.slider;
    })

    $scope.options = {
    loop: false,
    effect: 'slide',
    speed: 500,
    }

    function dataChangeHandler(){
    // call this function when data changes, such as an HTTP request, etc (Slide)
      if ( $scope.slider ){
      $scope.slider.updateLoop();
      }
    }
    

}])












            

                
            
   