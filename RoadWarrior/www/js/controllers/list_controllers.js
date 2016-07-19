angular.module('roadWarrior.controllers')



.controller ('ListCtrl', ['$scope','$firebaseArray', 'currentAuth', 'sendDataService', 'ActiveGroup', 'itineraryService', 'helperService','MyYelpAPI', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, sendDataService, ActiveGroup, itineraryService, helperService, MyYelpAPI, $state, $http, $q, moment,Yahoo){
  $scope.loaded = false;


  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
    console.log("This group: ",$scope.thisGroup);
    var eventRef = firebase.database().ref('events');
    $scope.events = $firebaseArray(eventRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId));
    $scope.loaded = true;
  })
              

  $scope.viewDay = function(event){
    sendDataService.set(event);
    $state.go("tab.listShow");
  }
}])


.controller ('ListShowCtrl', ['$scope', '$firebaseArray','currentAuth', 'sendDataService', 'itineraryService', 'helperService', 'ActiveGroup', 'MyYelpAPI', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, sendDataService, itineraryService, helperService, ActiveGroup, MyYelpAPI, $state, $http, $q, moment,Yahoo){
    $scope.loaded = false;
    $scope.weatherLoaded = false;
    $scope.itinsLoaded = false;
    $scope.weatherData = {};

    ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
      console.log("this group loaded");
    });


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
  $scope.event.weekDay = moment($scope.event.unixDate).format('dddd');
  $scope.loaded = true;
  console.log("loaded is ",$scope.loaded)
  
  $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id));
  $scope.itins.$loaded()
  .then(function(){
    $scope.itinsLoaded = true;
    console.log("itins are ",$scope.itinsLoaded)
  });







  $scope.toList = function(){
    $state.go("tab.list");
  }  



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












            

                
            
   