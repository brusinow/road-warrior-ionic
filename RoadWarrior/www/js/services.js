angular.module('roadWarrior.services', [])


.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
])



.factory("FirebaseEnv", ["$firebaseObject",
  function($firebaseObject) {
    return function() {
      // create a reference to the database node where we will store our data
      var ref = firebase.database().ref('_admin/env/localhost');
      // var ref = new Firebase("https://roadwarrior.firebaseio.com/_admin/env/localhost");
      // return it as a synchronized object
      return $firebaseObject(ref);
    }
  }
])






.factory('Popover', ["$http", "$ionicLoading", "FirebaseEnv", 
  function($http, $ionicLoading, FirebaseEnv){
  var ENV = FirebaseEnv(); 
  console.log("what is ENV? ",ENV);



  var openPopover = function(query){
   
    $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    width: 100,
    showDelay: 100
    });
    var fullQuery = '/api/place/textsearch/json?query=' + query.venue +" "+ query.cityState + '&key='+ENV.GOOGLE_PLACES_KEY;
    console.log(fullQuery);
    var req = {
      url: fullQuery,
      method: 'GET',
    }

    return $http(req).then(function success(results) {
      // var results = res.data.results;
      $ionicLoading.hide();
      return results;
    }, function error(res) {
    //do something if the response has an error
        console.log(res);
      }); 
  }
  return {
    openPopover: openPopover
  };
}])




.factory('Yahoo', function($http, YahooEndpoint) {
  console.log('YahooEndpoint', YahooEndpoint)

    var getYahooData = function(lat,lng) {
      // console.log("lat: ",lat);
      // console.log("lng: ",lng);
      var url = YahooEndpoint.url + "/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(SELECT%20woeid%20FROM%20geo.places%20WHERE%20text%3D%22("+lat+"%2C"+lng+")%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

      return $http.get(url)
        .then(function(data) {
          // console.log('Got some data: ', data.data.query.results.channel.item);
          var weatherResults = data.data.query.results.channel.item;
          return weatherResults;
        });
    };

  return {
    getYahooData: getYahooData
  };
})



.factory("Profile", ["$firebaseObject",
  function($firebaseObject) {
    return function(userId) {
      var profileRef = firebase.database().ref('users/'+userId)

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
])


.factory("ActiveGroup", ["$firebaseObject",
  function($firebaseObject) {
    return function(userId) {
      var activeGroupRef = firebase.database().ref('activeGroup/'+userId)
      // var activeGroupRef = new Firebase('https://roadwarrior.firebaseio.com/activeGroup/'+userId);
      return $firebaseObject(activeGroupRef);
    }
  }
])



.factory("EditItin", ["$firebaseObject",
  function($firebaseObject) {
    return function(id) {
      var itinRef = firebase.database().ref('itins/'+id)
      // var itinRef = new Firebase('https://roadwarrior.firebaseio.com/itins/'+id);
      return $firebaseObject(itinRef);
    }
  }
])


.factory('GetSetActiveGroup', ["$firebaseObject", function($firebaseObject) {
  function set(data, userId) {
    console.log("data is ",data);
    console.log("userId is ",userId);
    var activeGroupRef = firebase.database().ref('activeGroup/'+userId);
    // var activeGroupRef = new Firebase('https://roadwarrior.firebaseio.com/activeGroup/'+userId);
    var obj = $firebaseObject(activeGroupRef);
    obj.name = data.name;
    obj.groupId = data.groupId;
    obj.access = data.access;
    obj.level = data.level;
    obj.$save().then(function(ref) {
      ref.key() === obj.$id; // true
    }, function(error) {
      console.log("Error:", error);
    });
  }

 return {
  set: set
 }
}
])

 


.factory("MyYelpAPI", function($http, YelpEndpoint, FirebaseEnv) {
    var ENV = FirebaseEnv();
    console.log("what is ENV? ",ENV);


    function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                return result;
            }
    

    return {
        retrieveYelp: function(event, searchTerm, radius, limitNumber, sort, callback) {
            var method = 'GET';
            var url = YelpEndpoint.url+'?callback=JSON_CALLBACK';
            var params = {
                    callback: 'angular.callbacks._0',
                    location: event.address, 
                    cll: event.lat+','+event.lng,
                    oauth_consumer_key: ENV.YELP_CONSUMER_KEY, //Consumer Key
                    oauth_token: ENV.YELP_TOKEN, //Token
                    oauth_signature_method: "HMAC-SHA1",
                    oauth_timestamp: new Date().getTime(),
                    oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                    sort: sort, 
                    radius_filter: radius,
                    limit: limitNumber,
                    category_filter: searchTerm 
                };
                // console.log("callback in params is: ",params.callback);

            var consumerSecret = ENV.YELP_CONSUMER_SECRET; //Consumer Secret
            var tokenSecret = ENV.YELP_TOKEN_SECRET; //Token Secret
            var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
            params['oauth_signature'] = signature;
            $http.jsonp(url, {params: params}).success(callback).catch(function(error){
              console.log("what is error? ",error);
            });;
        }
    }
})





.factory('sendDataService', function() {
 var savedData = {}
 function set(data) {
   savedData = data;
 }
 function get() {
  return savedData;
 }

 return {
  set: set,
  get: get
 }

})


.factory('helperService', function() {
        return {
            timeFormat: function($scope, unix) {
              var selectedTime = new Date(unix * 1000);
              var utcHours = selectedTime.getUTCHours();
              var utcMinutes = selectedTime.getUTCMinutes();
                if (utcMinutes === 0){
                  utcMinutes = "00";
                }
              console.log("selected time is: ",selectedTime);
              console.log('Selected epoch is : ', unix, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
               if (utcHours > 12){
                utcHours = utcHours - 12;
                var formattedTime = utcHours + ":" + utcMinutes + " PM";
                return formattedTime;
                } else if (utcHours == 12){
                  console.log("utc should be 12");
                  utcHours = "12";
                  var formattedTime = utcHours + ":" + utcMinutes + " PM";
                  return formattedTime;
                } else if (utcHours == 0){
                  utcHours = "12";
                  var formattedTime = utcHours + ":" + utcMinutes + " AM";
                  return formattedTime;
                } else {
                  var formattedTime = utcHours + ":" + utcMinutes + " AM";
                  return formattedTime;
                  }
            },
            phoneFormat: function(number){
              var newNumber = number.slice(3);
              return newNumber;
            },
            dayOfWeek: function(unixTime){
              var day = moment(unixTime).format('dddd');
              return day;
            }
            

        };
})


.factory('eventsService', ['ActiveGroup','GetSetActiveGroup', function(ActiveGroup, GetSetActiveGroup) {
    // var eventsRef = new Firebase('https://roadwarrior.firebaseio.com/events');
    var eventsRef = firebase.database().ref('events');

    
    return {
      allGroupEvents: function($scope, groupKey){
        eventsRef.orderByChild('groupId').startAt(groupKey).endAt(groupKey).on("value", function(events){
          // console.log("all current group events from service: ",events.val());
          $scope.events = events.val();
        })
      },
      todayGroupEvents: function($scope, groupKey){
        var todayDate = new moment().format('MM-DD-YYYY');
        eventsRef.orderByChild('groupId').startAt(groupKey).endAt(groupKey).on("value", function(event){
          // console.log("event response is: ",event.val());
          event.forEach(function(childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
            if (todayDate === childData.date){
              $scope.result = true;
              // console.log("found one");
              // console.log("actual today event from service is: ",childData);
              $scope.today = childData;
              return true;
            }  
          });
          if ($scope.result !== true){
            $scope.result = false;
          }
        })
      },
      createEvent: function($scope){
        console.log("new event is ",$scope.event);
        console.log("scope is ",$scope);
          angular.forEach($scope.events, function(childData) {
          console.log("childData is ",childData);
            if ($scope.event.date === childData.date){
              $scope.eventExists = true;
              console.log("found one here already. Don't do anything.");
              // console.log("actual today event from service is: ",childData);
              return true;
            }  
          });
          if ($scope.eventExists === false){
            console.log("Nothing exists here - go ahead and do stuff.");
                if ($scope.event.address && $scope.event.address.length > 0) {
            if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({ 'address': $scope.event.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  console.log("results are: ",results)
                  $scope.event.lat = results[0].geometry.location.lat();
                  $scope.event.lng = results[0].geometry.location.lng();
                  $scope.event.address = results[0].formatted_address;
                  var latlng = {lat: $scope.event.lat, lng: $scope.event.lng};
                  console.log("lat/lng is: ",latlng);
                  this.geocoder = new google.maps.Geocoder();
                  this.geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                          for (var ac = 0; ac < results[0].address_components.length; ac++) {
                                    var component = results[0].address_components[ac];
                                    console.log("what is component? ",component);
                                    switch(component.types[0]) {
                                        case 'locality':
                                            $scope.event.city = component.long_name;
                                            break;
                                        case 'administrative_area_level_1':
                                            $scope.event.state = component.short_name;
                                            break;
                                    }
                                };
                                $scope.event.cityState = $scope.event.city+", "+$scope.event.state; 
                                $scope.event.groupId = $scope.thisGroup.groupId;
                                $scope.event.groupName = $scope.thisGroup.name;
                                var newEventEntry = {};
                                var newEventRef = eventsRef.push();
                                var eventId = newEventRef.key;
                                $scope.event.eventId = eventId;
                                console.log("new event to be submitted: ",$scope.event);
                                newEventEntry[eventId] = $scope.event;
                                eventsRef.update(newEventEntry);
                                // $scope.newEventModal.hide();
                         
                    } else {
                      window.alert('No first geocode results.');
                      }
                  });

                } else {
                    alert("Sorry, this search produced no results.");
                }
            });
        }
        }
        
      }   
    }
}
])

.factory('itineraryService', function() {
  var itinRef = firebase.database().ref('itins');

  return {
    createItinItem: function($scope){
      console.log("What is selected date at beginning of service? ",$scope.selectedEvent.select);
      if ($scope.nextDay){
        $scope.itin.nextDay = true;
        if ($scope.itin.startTimeUnix){
        $scope.itin.startTimeUnix = $scope.itin.startTimeUnix + 86400;
        }
        if ($scope.itin.endTimeUnix){
        $scope.itin.endTimeUnix = $scope.itin.endTimeUnix + 86400;  
        } 
      } else {
        $scope.itin.nextDay = false;
      }
      $scope.itin.groupId = $scope.thisGroup.groupId;
      $scope.itin.eventId = $scope.selectedEvent.select.eventId;
      console.log("itin object is: ",$scope.itin);
      var newItinEntry = {};
      var newItinRef = itinRef.push();
      var itinId = newItinRef.key;
      $scope.itin.id = itinId;
      newItinEntry[itinId] = $scope.itin;
      itinRef.update(newItinEntry);
      
      // $scope.newItinModal.hide();
    },
    getItinItems: function($scope, eventId){
      itinRef.orderByChild('eventId').startAt(eventId).endAt(eventId).on("value", function(itins){
        $scope.todayItins = itins.val();
        console.log(itins.val());
      });
    }




  };



})





      // createEvent: function($scope, newEvent, userId){
      //   if ($scope.event.address && $scope.event.address.length > 0) {
      //       if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
      //       this.geocoder.geocode({ 'address': $scope.event.address }, function (results, status) {
      //           if (status == google.maps.GeocoderStatus.OK) {
      //             console.log("results are: ",results)
      //             $scope.event.lat = results[0].geometry.location.lat();
      //             $scope.event.lng = results[0].geometry.location.lng();
      //             $scope.event.address = results[0].formatted_address;
      //             var latlng = {lat: $scope.event.lat, lng: $scope.event.lng};
      //             console.log("lat/lng is: ",latlng);
      //             this.geocoder = new google.maps.Geocoder();
      //             this.geocoder.geocode({'location': latlng}, function(results, status) {
      //               if (status === google.maps.GeocoderStatus.OK) {
      //                     for (var ac = 0; ac < results[0].address_components.length; ac++) {
      //                               var component = results[0].address_components[ac];
      //                               console.log("what is component? ",component);
      //                               switch(component.types[0]) {
      //                                   case 'locality':
      //                                       $scope.event.city = component.long_name;
      //                                       break;
      //                                   case 'administrative_area_level_1':
      //                                       $scope.event.state = component.short_name;
      //                                       break;
      //                               }
      //                           };
      //                           $scope.event.cityState = $scope.event.city+", "+$scope.event.state; 
      //                           $scope.event.groupId = $scope.thisGroup.groupId;
      //                           $scope.event.groupName = $scope.thisGroup.name;
      //                           var newEventEntry = {};
      //                           var newEventRef = eventsRef.push();
      //                           var eventId = newEventRef.key();
      //                           $scope.event.eventId = eventId;
      //                           console.log("new event to be submitted: ",$scope.event);
      //                           newEventEntry[eventId] = $scope.event;
      //                           eventsRef.update(newEventEntry);
      //                           // $scope.newEventModal.hide();
                         
      //               } else {
      //                 window.alert('No first geocode results.');
      //                 }
      //             });

      //           } else {
      //               alert("Sorry, this search produced no results.");
      //           }
      //       });
      //   }
      // }