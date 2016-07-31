angular.module('roadWarrior.controllers', ['roadWarrior.services','ionic'])

.controller('TodayCtrl', ['$scope','$firebaseArray', 'currentAuth','FirebaseEnv','thisGroup', 'itineraryService','GetSetActiveGroup','ActiveGroup', 'helperService', 'sendDataService', 'Profile','MyYelpAPI', '$state','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, FirebaseEnv, thisGroup, itineraryService, GetSetActiveGroup, ActiveGroup, helperService, sendDataService, Profile, MyYelpAPI, $state, $q, moment,Yahoo){
  
  $scope.yelpLoadList = [];
    $scope.disconnected = false;
    $scope.loaded = false;
    $scope.foundToday = false;
    $scope.weatherLoaded = false;
    $scope.itinsLoaded = false;
    $scope.noToday = false;
    $scope.weatherData = {};
    $scope.backup = {};

    $scope.yelpShow = {
      "food": true,
      "entertainment": false,
      "emergency": false
    }


        // console.log("this group id is: ",thisGroup.groupId);
    var usersRef = firebase.database().ref('users');
    var eventsRef = firebase.database().ref('events');
    var itinsRef = firebase.database().ref('itins');

    
    // $scope.event = {};
    $scope.todayDate = moment().format('MM-DD-YYYY');
    $scope.now_formatted_date = moment().format('MMMM Do, YYYY');
    $scope.day_of_week = moment().format('dddd');


    Profile(currentAuth.uid).$bindTo($scope, "profile");

    var allGroupItins = itineraryService.getAllGroupItins(thisGroup.groupId);
    allGroupItins.$loaded().then(function(){
      console.log("Group itins: ",allGroupItins);
    })





  var myConnectionsRef = firebase.database().ref('users/'+currentAuth.uid+'/connections');
  var lastOnlineRef = firebase.database().ref('users/'+currentAuth.uid+'/lastOnline');
  var connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function(snap) {
      console.log("what is snap? ",snap.val());
      if (snap.val() === true) {
        console.log("we're connected!!!!!!!");
        var con = myConnectionsRef.push(true);
        $scope.disconnected = false;


  
        // console.log("$scope.thisGroup.groupId: ",$scope.thisGroup.groupId);
        $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').equalTo(thisGroup.groupId))
        $scope.events.$loaded()
          .then(function(){
            $scope.$watch('events', function(newValue, oldValue){    
            console.log("old value of events list: ",oldValue);   
            console.log("new value of events list: ",newValue);      
              $scope.events = newValue;
              $scope.foundToday = false;
              $scope.loaded = false;
              $scope.weatherLoaded = false;
              $scope.itinsLoaded = false;
              $scope.noToday = false;
              $scope.weatherData = {};
            console.log("events loaded: ",$scope.events);
              if ($scope.events.length === 0){
                console.log("you have no events. None at all.");
                $scope.loaded = true;
                $scope.itinsLoaded = true;
                $scope.weatherLoaded = true;
                $scope.noToday = true;
                
              } else {      
                    for (i=0; i < $scope.events.length; i++){
                      if ($scope.events[i].date === $scope.todayDate){ 
                            $scope.event = $scope.events[i]; 
                            $scope.foundToday = true;
                            $scope.loaded = true;
                            console.log("loaded is ",$scope.loaded);
                                $scope.$watch('event', function(newEvent, oldEvent) {
                                console.log("Old value is ",oldEvent);  
                                console.log("New value is ",newEvent);
                                console.log("API CALLS!!!!!!!!!!!!!!");
                                if ($scope.event.lat && $scope.event.lng){
                                console.log("LOCATION SPECIFIC TASKS HERE!!!!!!!")
                                var lat = $scope.event.lat;
                                var lng = $scope.event.lng;
                                $scope.weatherCall(lat,lng);
                                $scope.yelpCall();
                                } else {
                                  console.log("NO LOCATION STUFF!!!!!")
                                $scope.weatherLoaded = true;
                                console.log("weather loaded is ",$scope.weatherLoaded);
                                } 
                                },true);

                        $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id))
                        $scope.itins.$loaded()
                        .then(function(){
                          // console.log("itins are ",$scope.itins);
                          if ($scope.itins.length > 0){
                            $scope.itinsLoaded = true;
                            // console.log("itins result is ",$scope.result.itins);
                            
                          } else {
                            console.log("you have no itins for this day.")
                            $scope.itinsLoaded = true;
                            console.log("itins loaded is ",$scope.itinsLoaded);
                          }
                        }).catch(function(data){
                          console.log("no itins data came back. ",data);
                        });
                        break;
                      }                      
                    }
                     
                          if (!$scope.foundToday){
                          $scope.loaded = true;
                          $scope.itinsLoaded = true;
                          $scope.weatherLoaded = true;
                          $scope.noToday = true;
                          console.log("no today event!");
                          }
                       
                      
                  }    

            },true);                    
          });










        con.onDisconnect().remove();
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
        } else {
          console.log("we are not connected!!!!!!!!!!!!!!")
          $scope.disconnected = true;
        }
      });






  










    


    $scope.editItin = function(itin, event){
      var eventWithItin = {
        itin: itin,
        event: event
      };

      sendDataService.set(eventWithItin);
      $state.go("tab.today-editItin");
    }


    $scope.editEvent = function(event){
      sendDataService.set(event);
      $state.go("tab.today-editDayEvent")
    }


    $scope.newItin = function(event){
      sendDataService.set(event);
      $state.go("tab.today-newItin");
    }



    //********** for itin item accordions ***************

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

    //***************************************************



    function dataChangeHandler(){
    // call this function when data changes, such as an HTTP request, etc (Slide)
      if ( $scope.slider ){
      $scope.slider.updateLoop();
      }
    }

    $scope.metersToMiles = function(distance) {
      var result = distance * 0.000621371192;
     return Math.round( result * 10 ) / 10; 
    }



    $scope.yelpLoading = function(){
      if ($scope.event && $scope.yelpLoadList.length === 8){
           // console.log("yelp loading is true");
        return true;
      } else {
        return false;
        console.log("what is yelp loading? ",$scope.yelpLoadList);
      }
    }



  $scope.yelpCall = function(){ 
    console.log("making Yelp API Call!!!!!!!!!!!!!!!!!!")
    $scope.yelpLoadList = [];           
    $scope.yelp = {};
    MyYelpAPI.retrieveYelp($scope.event, "restaurants", 500, 3, "2", function(data){
      $scope.yelp.restaurants = data.businesses;
      $scope.yelpLoadList[0] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "coffee", 500, 1, "2", function(data){
      $scope.yelp.coffee = data.businesses[0];
      // console.log("Coffee results: ",$scope.yelp.coffee);
      $scope.yelpLoadList[1] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "gyms", 500, 1, "2", function(data){
      $scope.yelp.gym = data.businesses[0];
      $scope.yelpLoadList[2] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "bookstores", 2000, 1, "0", function(data){
      $scope.yelp.bookstore = data.businesses[0];
      $scope.yelpLoadList[3] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "movietheaters", 2000, 1, "0", function(data){
      $scope.yelp.movie = data.businesses[0];
      $scope.yelpLoadList[4] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "drugstores", 3000, 1, "0", function(data){
      $scope.yelp.pharmacy = data.businesses[0];
      $scope.yelp.pharmacy.formattedPhone = helperService.phoneFormat($scope.yelp.pharmacy.display_phone);
      $scope.yelpLoadList[5] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "urgent_care", 3000, 1, "0", function(data){
      $scope.yelp.urgent = data.businesses[0];
      $scope.yelp.urgent.formattedPhone = helperService.phoneFormat($scope.yelp.urgent.display_phone);
      $scope.yelpLoadList[6] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "hospitals", 5000, 1, "0", function(data){
      $scope.yelp.hospital = data.businesses[0];
      $scope.yelp.hospital.formattedPhone = helperService.phoneFormat($scope.yelp.hospital.display_phone);
      $scope.yelpLoadList[7] = true;
    }); 
    console.log("end of yelp calls");
    
  }

      $scope.weatherCall = function(lat, lng){
        Yahoo.getYahooData(lat,lng).then(function(data){
          if (data){
            $scope.weatherData = data;
             $scope.weatherLoaded = true;
          }
        }).catch(function(data){
            console.log("You have no weather data. ",data);
        });
      }


    $scope.yelpShowFood = function(){
      $scope.yelpShow = {
      "food": true,
      "entertainment": false,
      "emergency": false
      }
    }

    $scope.yelpShowEntertainment = function(){
      $scope.yelpShow = {
      "food": false,
      "entertainment": true,
      "emergency": false
      }
    }

    $scope.yelpShowEmergency = function(){
      $scope.yelpShow = {
      "food": false,
      "entertainment": false,
      "emergency": true
      }
    }

    $scope.options = {
    loop: false,
    effect: 'slide',
    speed: 500,
    }


  $scope.data = {};
  $scope.$watch('data.slider', function(nv, ov) {
  $scope.slider = $scope.data.slider;
  })

  
    
    

    

    
     

}])

      
