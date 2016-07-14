angular.module('roadWarrior.controllers', [])



.controller ('ListCtrl', ['$scope','$firebaseArray', 'currentAuth', 'sendDataService', 'ActiveGroup', 'itineraryService', 'helperService','MyYelpAPI', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, sendDataService, ActiveGroup, itineraryService, helperService, MyYelpAPI, $state, $http, $q, moment,Yahoo){
  
  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
    console.log("This group: ",$scope.thisGroup);
    var eventRef = firebase.database().ref('events');
    $scope.events = $firebaseArray(eventRef.orderByChild('groupId').startAt($scope.thisGroup.groupId).endAt($scope.thisGroup.groupId)) 
  })
              

  $scope.viewDay = function(event){
    sendDataService.set(event);
    $state.go("tab.listShow");
  }
}])


.controller ('ListShowCtrl', ['$scope', '$firebaseArray','currentAuth', 'sendDataService', 'itineraryService', 'helperService','MyYelpAPI', '$state', '$http','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, sendDataService, itineraryService, helperService, MyYelpAPI, $state, $http, $q, moment,Yahoo){
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



.controller('TodayCtrl', ['$scope','$firebaseArray', 'currentAuth','FirebaseEnv', 'itineraryService','GetSetActiveGroup','ActiveGroup', 'helperService', 'sendDataService', 'Profile','MyYelpAPI', '$state','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, FirebaseEnv, itineraryService, GetSetActiveGroup, ActiveGroup, helperService, sendDataService, Profile, MyYelpAPI, $state, $q, moment,Yahoo){

   
    $scope.yelpLoadList = [];

    $scope.result = {
      "weather": false,
      "today": "",
      "itins": "",
      "complete": "",
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
           console.log("yelp loading is true");
        return true;
      } else {
        return false;
        console.log("what is yelp loading? ",$scope.yelpLoadList);
      }
    }

    $scope.hideLoader = function(){
      if ($scope.result.director === "noToday"){
        // console.log("NO TODAY!!!");
        return true;
      } else if ($scope.result.director === "noItins" && $scope.result.weather){
        // console.log("EVENT, BUT NO ITINS!!!");
        return true;
      } else if ($scope.result.weather && $scope.result.today && $scope.result.itins){
         // console.log("WE HAVE A TODAY EVENT!!");
        return true;
      } else {
        // console.log("RETURNING FALSE!?!?!?!");
        // console.log("director is ",$scope.result.director);
        // console.log("today result is ",$scope.result.today)
        // console.log("itin results is ",$scope.result.itins);
        return false;
      }
    }


  $scope.yelpCall = function(){ 
    $scope.yelpLoadList = [];           
    $scope.yelp = {};
    if ($scope.result.today) {
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
  }

      $scope.weatherCall = function(lat, lng){
        Yahoo.getYahooData(lat,lng).then(function(data){
          if (data){
            $scope.result.weather = true;
            console.log("weather result is ",$scope.result.weather);
            console.log("weather data is ",data);
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
    var usersRef = firebase.database().ref('users');
    var eventsRef = firebase.database().ref('events');
    var itinsRef = firebase.database().ref('itins');

    
      // $scope.event = {};
      $scope.todayDate = moment().format('MM-DD-YYYY');
      $scope.now_formatted_date = moment().format('MMMM Do, YYYY');
      $scope.day_of_week = moment().format('dddd');
    

    
      ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
        // console.log("$scope.thisGroup.groupId: ",$scope.thisGroup.groupId);
        $scope.events = $firebaseArray(eventsRef.orderByChild('groupId').equalTo($scope.thisGroup.groupId))
        $scope.events.$loaded()
          .then(function(){
            $scope.$watch('events', function(newValue, oldValue){    
            console.log("old value of events list: ",oldValue);   
            console.log("new value of events list: ",newValue);      
              $scope.events = newValue;
              $scope.result.today = '';
            console.log("events loaded: ",$scope.events);
              if ($scope.events.length === 0){
                console.log("you have no events. None at all.");
                $scope.result.today = false;
                $scope.result.director = "noToday";
              } else {
                    
                    for (i=0; i < $scope.events.length; i++){
                      if ($scope.events[i].date === $scope.todayDate){
                            $scope.result.today = true;
                            $scope.event = $scope.events[i]; 

                                $scope.$watch('event', function(newEvent, oldEvent) {
                                console.log("Old value is ",oldEvent);  
                                console.log("New value is ",newEvent);
                                console.log("API CALLS!!!!!!!!!!!!!!");
                                var lat = $scope.event.lat;
                                var lng = $scope.event.lng;
                                $scope.weatherCall(lat,lng);
                                $scope.yelpCall();
                                },true);

                        $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id))
                        $scope.itins.$loaded()
                        .then(function(){
                          // console.log("itins are ",$scope.itins);
                          if ($scope.itins.length > 0){
                            $scope.result.itins = true;
                            // console.log("itins result is ",$scope.result.itins);
                            
                          } else {
                            console.log("you have no itins for this day.")
                            $scope.result.director = "noItins";
                          
                          }
                        }).catch(function(data){
                          console.log("no itins data came back. ",data);
                        });
                        break;
                      }                      
                    }
                     
                          if (!$scope.result.today){
                          $scope.result.today = false;
                          console.log("no today event!");
                          $scope.result.director = "noToday";
                          }
                       
                      
                  }    

            },true);                    
          });
        });

      




}])

.controller('GroupsCtrl', ['$scope', '$ionicLoading','Profile','currentAuth', '$state', function($scope, $ionicLoading, Profile, currentAuth, $state){
   Profile(currentAuth.uid).$bindTo($scope,"profile").then(function(){
   });


    $scope.toJoinGroup = function(){
    $state.go("joinGroup");
    }
    $scope.toNewGroup = function(){
    $state.go("newGroup");
    }
}])




.controller('JoinGroupsCtrl', ['$scope', '$http', '$ionicHistory', 'FirebaseEnv', 'Profile', 'GetSetActiveGroup','currentAuth', '$state', function($scope, $http, $ionicHistory, FirebaseEnv, Profile, GetSetActiveGroup, currentAuth, $state){
  var ENV = FirebaseEnv();

  var mailgunUrl = "sandbox244b4a8817e84888a7a999503925c789.mailgun.org";
    var mailgunApiKey = window.btoa(ENV.MAILGUN)
    
 
    $scope.send = function() {
      var message = "Your request to join a group has been sent to the group administrator. If approved, you will receive email confirmation. Thanks for using Road Warrior!  -The Road Warrior Team";
        $http(
            {
                "method": "POST",
                "url": "https://api.mailgun.net/v3/sandbox244b4a8817e84888a7a999503925c789.mailgun.org/messages",
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + mailgunApiKey
                },
                data: "from=" + "brusinow@gmail.com" + "&to=" + "brusinow@gmail.com" + "&subject=" + "MailgunTest" + "&text=" + "blah blah"
            }
        ).then(function(success) {
            console.log("SUCCESS " + JSON.stringify(success));
        }, function(error) {
            console.log("ERROR " + JSON.stringify(error));
        });
    }


  $scope.noResults = {};
  $scope.admin = {email: ""};
  var usersRef = firebase.database().ref('users');
  var adminsRef = firebase.database().ref('admins');
  var groupsRef = firebase.database().ref('groups');
  var currentUserRef = usersRef.child(currentAuth.uid);
  var currentUserGroupRef = currentUserRef.child("groups");

  Profile(currentAuth.uid).$bindTo($scope, "profile");
   // usersRef.child(currentAuth.uid).on("value", function(user){
   //  $scope.currentUser = user.val();
   //  })


 

    $scope.joinGroup = function(){
       
    $scope.noResults = {}; 
    var searchEmail = $scope.admin.email;
    adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).once('value', function(snapshot) {
      console.log("snapshot is: ",snapshot.val());
      $scope.results = snapshot.val();
      if ($scope.results !== null){
        adminsRef.orderByChild('email').startAt(searchEmail).endAt(searchEmail).on('child_added', function(snap){
          var foundAdmin = snap.val();
          var foundKey = snap.key;
          var groupId = foundAdmin.groupId;  
          if (foundAdmin.groupName === $scope.admin.groupName ){
            var memberEntry = {};
            memberEntry[currentAuth.uid] = {
            "name": $scope.profile.name,
            "email": $scope.profile.email,
            "userType": "pending"
            };
            groupsRef.child(groupId+"/members").update(memberEntry);
            var userGroupEntry = {};
            userGroupEntry[groupId] = {
              "name": foundAdmin.groupName,
              "access": false,
              "level": "pending"
            };
            activeGroupEntry = {
            "name": foundAdmin.groupName,
            "groupId": groupId,
            "access": false,
            "level": "pending"
            };
            console.log("userGroupEntry before submission is ",userGroupEntry);
            currentUserGroupRef.update(userGroupEntry); 
            GetSetActiveGroup.set(activeGroupEntry, currentAuth.uid);
           
            $ionicHistory.clearCache().then(function(){ $state.go('tab.today') })
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

.controller('NewGroupsCtrl', ['$scope', '$ionicHistory', 'currentAuth', 'Profile','GetSetActiveGroup','$state', function($scope, $ionicHistory, currentAuth,Profile, GetSetActiveGroup, $state){
  $scope.group = {};

  var usersRef = firebase.database().ref('users');
  var adminsRef = firebase.database().ref('admins');
  var groupsRef = firebase.database().ref('groups');
  var currentUserRef = usersRef.child(currentAuth.uid);
  var currentUserGroupsRef = currentUserRef.child("groups");
  
  Profile(currentAuth.uid).$bindTo($scope, "profile");

    $scope.newGroup = function(){
      console.log("submitting new group");
      var newGroupRef = groupsRef.push();
      var groupId = newGroupRef.key;
      var memberEntry = {};
      var adminEntry = {};
      var searchGroup = $scope.group.name;
      memberEntry[currentAuth.uid] = {
        "name": $scope.profile.name,
        "email": $scope.profile.email,
        "userType": "admin"
      };
      console.log("what is memberEntry? ",memberEntry);
      adminEntry[currentAuth.uid] = {
        "name": $scope.profile.name,
        "email": $scope.profile.email,
        "groupName": searchGroup,
        "groupId": groupId
      }
      console.log("what is adminEntry? ",adminEntry)
      newGroupRef.set({
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
      $ionicHistory.clearCache();
      $state.go("tab.today");
    };
}])



.controller('ChatsCtrl', ['$scope','$timeout','$ionicScrollDelegate','chatMessages','ActiveGroup','Profile','currentAuth', function($scope, $timeout, $ionicScrollDelegate, chatMessages, ActiveGroup, Profile, currentAuth) {
  Profile(currentAuth.uid).$bindTo($scope, "profile").then(function(){
    $scope.myId = $scope.profile.$id;
  })
  
  ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
    $scope.messages = chatMessages($scope.thisGroup.groupId);
  });
  $ionicScrollDelegate.scrollBottom(true);
  $scope.data = {};


  $scope.showTime = true;

  var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();

  $scope.sendMessage = function() {

    var d = new Date();
    d = d.toLocaleTimeString().replace(/:\d+ /, ' ');

    $scope.messages.$add({
      userId: $scope.profile.$id,
      userName: $scope.profile.name,
      text: $scope.data.message,
      time: d
    });

    delete $scope.data.message;
    $ionicScrollDelegate.scrollBottom(true);

    };


  $scope.inputUp = function() {
    if (isIOS) $scope.data.keyboardHeight = 216;
    $timeout(function() {
      $ionicScrollDelegate.scrollBottom(true);
    }, 300);

  };

  $scope.inputDown = function() {
    if (isIOS) $scope.data.keyboardHeight = 0;
    $ionicScrollDelegate.resize();
  };

  $scope.closeKeyboard = function() {
    // cordova.plugins.Keyboard.close();
  };


  

}]);







            

                
            
   