angular.module('roadWarrior.services', [])


.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})



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
      // create a reference to the database node where we will store our data
      var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
      var profileRef = usersRef.child(userId);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
])


.factory("ActiveGroup", ["$firebaseObject",
  function($firebaseObject) {
    return function(userId) {
      // create a reference to the database node where we will store our data
      var activeGroupRef = new Firebase('https://roadwarrior.firebaseio.com/activeGroup/'+userId);
      return $firebaseObject(activeGroupRef);
    }
  }
])

.factory("EditItin", ["$firebaseObject",
  function($firebaseObject) {
    return function(id) {
      // create a reference to the database node where we will store our data
      var itinRef = new Firebase('https://roadwarrior.firebaseio.com/itins/'+id);
      return $firebaseObject(itinRef);
    }
  }
])


.factory('GetSetActiveGroup', ["$firebaseObject", function($firebaseObject) {
  
  function set(data, userId) {
    console.log("data is ",data);
    console.log("userId is ",userId);
    var activeGroupRef = new Firebase('https://roadwarrior.firebaseio.com/activeGroup/'+userId);
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


 


.factory("MyYelpAPI", function($http, YelpEndpoint) {
    function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                return result;
            }
    

    return {
        retrieveYelp: function(event, searchTerm, radius, limitNumber, sort, callback) {
            // var count = angular.callbacks.counter;
            // id = id + count;
            // console.log("what is callback id? ",count);
            // console.log("running Yelp")
            var method = 'GET';
            var url = YelpEndpoint.url+'?callback=JSON_CALLBACK';
            var params = {
                    callback: 'angular.callbacks._0',
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
            $http.jsonp(url, {params: params}).success(callback).catch(err => console.log(err));;
        }
    }
})


// $http.jsonp("api.yelp.com/v2/search?callback=JSON_CALLBACK", yourParams) 
// .success(function() {
//      //success callback
// })
// .error(function(){
//      //error callback
// }) ;





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


// .factory('GetGroup', function() {
//   var currentGroup = {}
//  function set(data) {
//    currentGroup = data;
//  }
//  function get() {
//   return currentGroup;
//  }

//  return {
//   set: set,
//   get: get
//  }

// })


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
    var eventsRef = new Firebase('https://roadwarrior.firebaseio.com/events');

    
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
      createEvent: function($scope, newEvent, userId){
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
                                    console.log("what is component? ",component);
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
                                // var currentGroup = ActiveGroup(userId);
                                ActiveGroup(userId).$bindTo($scope, "currentGroup").then(function(){
                                console.log("GetGroup results are: ",$scope.currentGroup);
                                newEvent.groupId = $scope.currentGroup.groupId;
                                newEvent.groupName = $scope.currentGroup.name;
                                var newEventEntry = {};
                                var newEventRef = eventsRef.push();
                                var eventId = newEventRef.key();
                                newEvent.eventId = eventId;
                                console.log("new event to be submitted: ",newEvent);
                                newEventEntry[eventId] = newEvent;
                                eventsRef.update(newEventEntry);
                                // $scope.newEventModal.hide();
                              })
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
}
])

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
      $scope.itin.groupId = $scope.thisGroup.groupId;
      $scope.itin.eventId = $scope.selectedEvent.select.eventId;
      console.log("itin object is: ",$scope.itin);
      var newItinEntry = {};
      var newItinRef = itinRef.push();
      var itinId = newItinRef.key();
      $scope.itin.id = itinId;
      newItinEntry[itinId] = $scope.itin;
      itinRef.update(newItinEntry);
      $scope.selectedEvent = {};
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





