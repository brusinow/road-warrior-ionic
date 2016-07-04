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



.controller('TodayCtrl', ['$scope','$firebaseArray', 'currentAuth','itineraryService','GetSetActiveGroup','ActiveGroup', 'helperService', 'Profile','MyYelpAPI', '$state','$q', 'moment','Yahoo', function($scope, $firebaseArray, currentAuth, itineraryService, GetSetActiveGroup, ActiveGroup, helperService, Profile, MyYelpAPI, $state, $q, moment,Yahoo){
  
    

   
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

    
      $scope.event = {};
      $scope.todayDate = moment().format('MM-DD-YYYY');
      $scope.now_formatted_date = moment().format('MMMM Do, YYYY');
      $scope.day_of_week = moment().format('dddd');
    
//     syncObject.$bindTo($scope, 'data').then(function(){
//     $scope.dataLoaded = true;
// });
    
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
                    console.log("event in forEach: ",event);
                      if (event.date === $scope.todayDate){
                        $scope.result.today = true;
                        $scope.event = event;
                        console.log("saves the correct day");

                        var lat = $scope.event.lat;
                        var lng = $scope.event.lng;
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

                        $scope.itins = $firebaseArray(itinsRef.orderByChild('eventId').startAt($scope.event.$id).endAt($scope.event.$id))
                        $scope.itins.$loaded()
                        .then(function(){
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
              

            // ********** weather related stuff *************

              

              // ********** YELP *************
            // $scope.$watch('events', function() {

               // console.log("HEY, SOMETHING CHANGED!!!!");
              $scope.yelp = {};
              if ($scope.result.today) {
              MyYelpAPI.retrieveYelp($scope.event, "restaurants", 500, 4, "2", function(data){
                $scope.yelp.restaurants = data.businesses;
                $scope.yelpLoadList[0] = true;
              });
              MyYelpAPI.retrieveYelp($scope.event, "coffee", 500, 1, "2", function(data){
                $scope.yelp.coffee = data.businesses[0];
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
            });
              // if ($scope.events){
              
              // }
          }).catch(function(data){
            console.log("you have no events. ",data);
          });
        // });

       
  
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






.controller('AccountCtrl', ['$scope', '$http','$firebaseArray','$ionicHistory', 'currentAuth','Profile','GetSetActiveGroup','ActiveGroup', 'eventsService','itineraryService','helperService', 'moment', '$state','$ionicModal','$ionicPopover','ionicDatePicker','ionicTimePicker', function($scope, $http, $firebaseArray, $ionicHistory, currentAuth, Profile, GetSetActiveGroup, ActiveGroup, eventsService, itineraryService, helperService, moment, $state, $ionicModal, $ionicPopover, ionicDatePicker, ionicTimePicker){
    var geocoder = new google.maps.Geocoder();
    var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
    var eventsRef = new Firebase("https://roadwarrior.firebaseio.com/events");
    var userGroupsRef = new Firebase("https://roadwarrior.firebaseio.com/users/"+currentAuth.uid+"/groups");


    $scope.itin = {};
    Profile(currentAuth.uid).$bindTo($scope, "profile");

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
    console.log($scope.selectedEvent.select.eventId);
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
      angular.forEach($scope.events, function(event) {
        console.log("event in loop: ",event)
        var thisEvent = event;
          this.geocoder = new google.maps.Geocoder();
              this.geocoder.geocode({ 'address': thisEvent.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  console.log("results are: ",results)
                  thisEvent.lat = results[0].geometry.location.lat();
                  thisEvent.lng = results[0].geometry.location.lng();
                  thisEvent.address = results[0].formatted_address;
                  var latlng = {lat: thisEvent.lat, lng: thisEvent.lng};
                  console.log("lat/lng is: ",latlng);
                  this.geocoder = new google.maps.Geocoder();
                  this.geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                      for (var ac = 0; ac < results[0].address_components.length; ac++) {
                        var component = results[0].address_components[ac];
                        switch(component.types[0]) {
                          case 'locality':
                            thisEvent.city = component.long_name;
                            break;
                          case 'administrative_area_level_1':
                            thisEvent.state = component.short_name;
                            break;
                        }
                      };
                      thisEvent.cityState = thisEvent.city+", "+thisEvent.state; 
                    }
                  })
                } 
              });
        $scope.events.$save(event).then(function(ref) {
          console.log(ref.val);
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


  }])



  
      
            

                
            
   