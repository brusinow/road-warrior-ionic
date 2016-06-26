angular.module('roadWarrior.services', [])


.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://roadwarrior.firebaseio.com/users");
  return $firebaseAuth(usersRef);
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

.factory('userService', function(){
     var _url = 'https://roadwarrior.firebaseio.com/users';
    var usersRef = new Firebase(_url);

    return {
      currentUserData: function($scope, userId){
        console.log("user id is ",userId);
        console.log("entering service");
        usersRef.child(userId).child("groups").on("child_added", function(group){

          $scope.groupKey = group.key();
          console.log($scope.groupKey);
          $scope.thisGroup = group.val();
          console.log($scope.thisGroup);
        });

      }
    }


})