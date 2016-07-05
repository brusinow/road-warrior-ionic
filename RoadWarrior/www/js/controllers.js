angular.module('roadWarrior.controllers', [])



.controller ('ListCtrl', ['$scope','$firebaseArray', 'currentAuth', 'sendDataService', 'ActiveGroup', 'itineraryService', 'helperService','MyYelpAPI','userService', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, sendDataService, ActiveGroup, itineraryService, helperService, MyYelpAPI, userService, $state, $http, $q, moment,Yahoo){
  
  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
    console.log("This group: ",$scope.thisGroup);
    var eventRef = new Firebase("https://roadwarrior.firebaseio.com/events");
    $scope.events = $firebaseArray(eventRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId)) 
  })
              
  // $scope.events.$loaded().then(function(){
  //     angular.forEach($scope.events, function(event) {
  //       console.log("event in loop: ",event)
  //       event.dayOfWeek = helperService.dayOfWeek((event.unixDate/1000));
  //       console.log("Should be day of week? ", $scope.event.dayOfWeek);
  //     })
  // })

  $scope.viewDay = function(event){
    sendDataService.set(event);
    $state.go("tab.listShow");
  }
}])


.controller ('ListShowCtrl', ['$scope', '$firebaseArray','currentAuth', 'sendDataService', 'itineraryService', 'helperService','MyYelpAPI','userService', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, sendDataService, itineraryService, helperService, MyYelpAPI, userService, $state, $http, $q, moment,Yahoo){
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

  var itinsRef = new Firebase('https://roadwarrior.firebaseio.com/itins');
  $scope.event = sendDataService.get();
  $scope.event.weekDay = moment($scope.event.unixDate).format('dddd');
  
  $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id));

  $scope.toList = function(){
    $state.go("tab.list");
  }  



    var lat = $scope.event.lat;
    var lng = $scope.event.lng;
    Yahoo.getYahooData(lat,lng).then(function(data){
      console.log(data.title);
      var thisDayFormatted = moment($scope.event.unixDate).format('DD MMM YYYY');
      console.log("this day formatted is: ",thisDayFormatted);
      var forecasts = data.forecast;

      angular.forEach(forecasts, function(forecast) {
        if (forecast.date === thisDayFormatted){
          $scope.weatherData = forecast;
        }
      })
    });
    

}])



.controller('TodayCtrl', ['$scope','$firebaseArray', 'currentAuth','itineraryService','GetSetActiveGroup','ActiveGroup', 'helperService', 'sendDataService', 'Profile','MyYelpAPI', '$state','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, itineraryService, GetSetActiveGroup, ActiveGroup, helperService, sendDataService, Profile, MyYelpAPI, $state, $q, moment,Yahoo){
  
      $scope.$watch('event', function(newEvent, oldEvent) {
          console.log("Old event is ",oldEvent);  
          console.log("New event is ",newEvent);
          console.log("CHANGE!!!!");
          $scope.yelpCall();
          $scope.weatherCall($scope.event.lat, $scope.event.lng);
      });

   
    $scope.yelpLoadList = [];
    $scope.result = {
      "weather": false,
      "today": false,
      "itins": false,
      "complete": false,
      "director": ""
    }
    $scope.yelpShow = {
      "food": true,
      "entertainment": false,
      "emergency": false
    }
    

    $scope.editItin = function(itin, event){
      var eventWithItin = {
        itin: itin,
        event: event
      };

      sendDataService.set(eventWithItin);
      $state.go("tab.today-editItin");
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
        return true;
      } else {
        return false;
      }
    }

    $scope.hideLoader = function(){
      if ($scope.result.director === "noToday"){
        return true;
      } else if ($scope.result.director === "noItins" && $scope.result.weather){
        return true;
      } else if ($scope.result.weather && $scope.result.today && $scope.result.itins){
        return true;
      } else {
        return false;
      }
    }


  $scope.yelpCall = function(){            
    $scope.yelp = {};
    if ($scope.result.today) {
    MyYelpAPI.retrieveYelp($scope.event, "restaurants", 500, 4, "2", function(data){
      $scope.yelp.restaurants = data.businesses;
      $scope.yelpLoadList[0] = true;
    });
    MyYelpAPI.retrieveYelp($scope.event, "coffee", 500, 1, "2", function(data){
      $scope.yelp.coffee = data.businesses[0];
      console.log("Coffee results: ",$scope.yelp.coffee);
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
  }

      $scope.weatherCall = function(lat, lng){
        Yahoo.getYahooData(lat,lng).then(function(data){
          if (data){
            $scope.result.weather = true;
            // console.log("weather result is ",$scope.result.weather);
            // console.log("weather data is ",data);
          }
          $scope.weatherData = data;
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

    Profile(currentAuth.uid).$bindTo($scope, "profile");
    
    
    // console.log("this group id is: ",thisGroup.groupId);
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
    var itinsRef = new Firebase('https://roadwarrior.firebaseio.com/itins');

    
      // $scope.event = {};
      $scope.todayDate = moment().format('MM-DD-YYYY');
      $scope.now_formatted_date = moment().format('MMMM Do, YYYY');
      $scope.day_of_week = moment().format('dddd');
    

    
      ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
        console.log("$scope.thisGroup.groupId: ",$scope.thisGroup.groupId);
        $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').equalTo($scope.thisGroup.groupId))
        $scope.events.$loaded()
          .then(function(){
            console.log("events loaded: ",$scope.events);
              if ($scope.events.length === 0){
                console.log("you have no events. None at all.");
                $scope.result.director = "noToday";
              }
                    angular.forEach($scope.events, function(event) {
                    // console.log("event in forEach: ",event);
                      if (event.date === $scope.todayDate){
                        $scope.result.today = true;
                        $scope.event = event;
                        console.log("saves the correct day");

                        var lat = $scope.event.lat;
                        var lng = $scope.event.lng;
                      //WEATHER CALL
                        $scope.weatherCall(lat,lng);

                        $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id))
                        $scope.itins.$loaded()
                        .then(function(){
                          console.log("itins are ",$scope.itins);
                          if ($scope.itins.length > 0){
                            $scope.result.itins = true;
                            console.log("itins result is ",$scope.result.itins);
                          } else {
                            console.log("you have no itins for this day.")
                            $scope.result.director = "noItins";
                          }
                        }).catch(function(data){
                          console.log("no itins data came back. ",data);
                        });
                      } 
                    })
                    if (!$scope.result.today){
                        console.log("no today event!");
                        $scope.result.director = "noToday";
                    }
                    $scope.yelpCall();

          }).catch(function(data){
            console.log("you have no events. ",data);
          });
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
              "access": false,
              "level": pending
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

.controller('NewGroupsCtrl', ['$scope', 'currentAuth', 'GetSetActiveGroup','$state', function($scope, currentAuth,GetSetActiveGroup, $state){
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
      console.log("what is adminEntry? ",adminEntry)
      groupsRef.child(groupId).set({
        "name": searchGroup,
        "members": memberEntry
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







            

                
            
   