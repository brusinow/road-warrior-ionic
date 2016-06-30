angular.module('roadWarrior.services', [])


.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})



.factory('Yahoo', function($http, YahooEndpoint) {
  console.log('YahooEndpoint', YahooEndpoint)

  var getYahooData = function(lat,lng) {
    console.log("lat: ",lat);
    console.log("lng: ",lng);
    var url = YahooEndpoint.url + "/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(SELECT%20woeid%20FROM%20geo.places%20WHERE%20text%3D%22("+lat+"%2C"+lng+")%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    console.log(url);

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
      // create a reference to the database node where we will store our data
      var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
      var profileRef = usersRef.child(userId);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
])


.factory('eventsServiceTest', ["$firebaseObject", 
  function($firebaseObject) {
    return function(groupKey) {
        
        var ref = new Firebase("https://roadwarrior.firebaseio.com/events");
        var obj = $firebaseObject(ref.orderByChild('groupId').startAt(groupKey).endAt(groupKey));
        obj.$loaded(function() {
            console.log('loaded', obj);
            // if( arr.$value === null ) { // if object has not been initialized
            //     angular.extend(arr, {
            //         something: "1234", 
            //         somethingElse: "567",
            //         $priority: 7
            //     });
            //     arr.$save();
            // }
        });
        return obj;
    }
}
])







// .factory("eventsServiceTest", ["$firebaseArray",
//   function($firebaseArray) {
//     return function(groupKey) {
//       // create a reference to the database node where we will store our data
//       var ref = new Firebase("https://roadwarrior.firebaseio.com/events");
//       var obj = $firebaseArray(ref.orderByChild('groupId').startAt(groupKey).endAt(groupKey));
//       obj.$loaded().then(function(data) {
//         console.log("what is data? ",data);
//         return data;
//       })
     

//       // console.log("what does this firebaseObject look like? ",$firebaseObject(eventsRef))
//       // return it as a synchronized object
//       // return $firebaseObject(eventsRef);
//     }
//   }
// ])








// .factory('eventsServiceTest', function($q){
//   var _url = 'https://roadwarrior.firebaseio.com/events';
//   var eventsRef = new Firebase(_url);

//   var myObject = {
//     allGroupEvents: function(groupKey){
//       var deferred = $q.defer();
//       eventsRef.orderByChild('groupId').startAt(groupKey).endAt(groupKey).on("value", function(eventsData){
//         deferred.resolve(eventsData);
//       });
//       console.log("deferred promise: ",deferred.promise);
//       return deferred.promise;
//     },
//   }
//   return myObject;
// })






// .factory("userServiceTest", ["$firebaseObject",
//   function($firebaseObject) {
//     return function(userId) {
//       // create a reference to the database node where we will store our data
//       var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
//       usersRef.child(userId).child("groups").on("child_added", function(groupData){
//           console.log("should have data");
//           deferred.resolve(groupData)
//       });

//       // return it as a synchronized object
//       return $firebaseObject(profileRef);
//     }
//   }
// ])



.factory('userService', function($q){
     var _url = 'https://roadwarrior.firebaseio.com/users';
    var usersRef = new Firebase(_url);


  var myObject = {
    currentGroupData: function(userId){
      var deferred = $q.defer();
      usersRef.child(userId).child("groups").on("child_added", function(groupData){
          console.log("should have data");
          deferred.resolve(groupData)
      });
      return deferred.promise;
    }
  }
  return myObject;
})





.factory("MyYelpAPI", function($http) {
    function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                return result;
            }
    

    return {
        retrieveYelp: function(event, searchTerm, radius, limitNumber, sort, id, callback) {
            var method = 'GET';
            var url = 'http://api.yelp.com/v2/search';
            var params = {
                    callback: 'angular.callbacks._' + id,
                    location: event.address, 
                    cll: event.lat+','+event.lng,
                    oauth_consumer_key: __env.YELP_CONSUMER_KEY, //Consumer Key
                    oauth_token: __env.YELP_TOKEN, //Token
                    oauth_signature_method: "HMAC-SHA1",
                    oauth_timestamp: new Date().getTime(),
                    oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                    sort: sort, 
                    radius_filter: radius,
                    limit: limitNumber,
                    category_filter: searchTerm 
                };
                // console.log("callback in params is: ",params.callback);

            var consumerSecret = __env.YELP_CONSUMER_SECRET; //Consumer Secret
            var tokenSecret = __env.YELP_TOKEN_SECRET; //Token Secret
            var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
            params['oauth_signature'] = signature;
            $http.jsonp(url, {params: params}).success(callback);
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


.factory('GetGroup', function() {
 var currentGroupId = "-KKzqF2TmPER2w71AlwJ";
 function set(data) {
   currentGroupId = data;
 }
 function get() {
  return currentGroupId;
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
            }
            

        };
})








.factory('eventsService', function() {
    var _url = 'https://roadwarrior.firebaseio.com/events';
    var eventsRef = new Firebase(_url);
    
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
              console.log("actual today event from service is: ",childData);
              $scope.today = childData;
              return true;
            }  
          });
          if ($scope.result !== true){
            $scope.result = false;
          }
        })
      },
      createEvent: function($scope, newEvent){
        console.log("event to be submitted is: ",newEvent);
        if (newEvent.address && newEvent.address.length > 0) {
            if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
            this.geocoder.geocode({ 'address': newEvent.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  console.log("results are: ",results)
                  newEvent.lat = results[0].geometry.location.lat();
                  newEvent.lng = results[0].geometry.location.lng();
                  newEvent.address = results[0].formatted_address;
                  var latlng = {lat: newEvent.lat, lng: newEvent.lng};
                  console.log("lat/lng is: ",latlng);
                  this.geocoder = new google.maps.Geocoder();
                  this.geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                          for (var ac = 0; ac < results[0].address_components.length; ac++) {
                                    var component = results[0].address_components[ac];
                                    switch(component.types[0]) {
                                        case 'locality':
                                            newEvent.city = component.long_name;
                                            break;
                                        case 'administrative_area_level_1':
                                            newEvent.state = component.short_name;
                                            break;
                                    }
                                };
                                newEvent.cityState = newEvent.city+", "+newEvent.state; 
                                newEvent.groupId = $scope.save.groupId;
                                newEvent.groupName = $scope.save.groupName;
                                var newEventEntry = {};
                                var newEventRef = eventsRef.push();
                                var eventId = newEventRef.key();
                                newEvent.eventId = eventId;
                                newEventEntry[eventId] = newEvent;
                                eventsRef.update(newEventEntry);
                                $scope.newEventModal.hide();
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
    };
})

.factory('itineraryService', function() {
  var _url = 'https://roadwarrior.firebaseio.com/itins';
  var itinRef = new Firebase(_url)

  return {
    createItinItem: function($scope){
      if ($scope.nextDay){
        if ($scope.itin.startTimeUnix){
        $scope.itin.startTimeUnix = $scope.itin.startTimeUnix + 86400;
        }
        if ($scope.itin.endTimeUnix){
        $scope.itin.endTimeUnix = $scope.itin.endTimeUnix + 86400;  
        } 
      }
      $scope.itin.groupId = $scope.save.groupId;
      $scope.itin.eventId = $scope.selectedEvent.select.eventId;
      console.log("itin object is: ",$scope.itin);
      var newItinEntry = {};
      var newItinRef = itinRef.push();
      var itinId = newItinRef.key();
      newItinEntry[itinId] = $scope.itin;
      itinRef.update(newItinEntry);
      $scope.selectedEvent = {};
      $scope.newItinModal.hide();
    },
    getItinItems: function($scope, eventId){
      itinRef.orderByChild('eventId').startAt(eventId).endAt(eventId).on("value", function(itins){
        $scope.todayItins = itins.val();
        console.log(itins.val());
      });
    }




  };



})





// authenticationController.factory('Authentication' , ['$firebase' , '$location' , 'FIREBASE_URL', '$rootScope' , '$q', function( $firebaseSimpleLogin , $location, FIREBASE_URL, $rootScope, $q){

// var ref = new Firebase(FIREBASE_URL);

// var myObject = {
//     login : function(user){
//  var defered = $q.defer();
//  ref.authWithPassword({
//           email    : user.email,
//           password : user.password
//         }, function(error, authData) {
//         if (error) {
//            defered.reject(error);
//         } else {
//             defered.resolve(authData);
//           }
//         }); 
//         return defered.promise;
//     }, // login

// } // object

// return myObject; 
