angular.module('roadWarrior.controllers')




.controller('ChatsCtrl', function($scope, thisGroup, main, show, fun, chatMessages, Profile, currentAuth, ActiveGroup, $cordovaCamera, $ionicScrollDelegate, $ionicModal, $ionicActionSheet, $timeout, $state, moment) {
  
  $scope.chats = {
    main: {
      data: main,
      title: "Main",
      toChat: function(){
        $state.go("tab.chats-main");
      }
    },
    show: {
      data: show,
      title: "Show Related",
      toChat: function(){
        $state.go("tab.chats-show");
      }
    },
    fun: {
      data: fun,
      title: "Fun",
      toChat: function(){
        $state.go("tab.chats-fun");
      }
    }
  }


})



.controller('ChatsTopicCtrl', function($scope, thisGroup, posts, profile, chatName, chatMessages, currentAuth, ActiveGroup, $cordovaCamera, $ionicScrollDelegate, $ionicModal, $ionicActionSheet, $timeout,$state, moment) {
 
  $scope.chatName = chatName;

  $scope.postDate = {};
  $scope.showTime = false;
  $scope.showChat = false;

  $scope.posts = posts;
  $scope.posts.$loaded().then(function(){
   $ionicScrollDelegate.scrollBottom(true); 
    $scope.showChat = true;
  })
  
  
  $scope.posts.$watch(scrollBottom);
  $scope.profile = profile;


  function scrollBottom() {
    $ionicScrollDelegate.$getByHandle('chat').scrollBottom();
  }

  function addPost(message, url) {
    $scope.posts.$add({
      message: message ? message : null,
      img: url ? url : null,
      timestamp: new Date().getTime(),
      user: $scope.profile.name,
      userId: $scope.profile.$id 
    });
  }
  $scope.data = {};
  var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
  $scope.inputUp = function() {
    window.addEventListener('native.keyboardshow', function() {
      if (isIOS) {
        $scope.data.keyboardHeight = 216;
      }
      $timeout(function() {
        $ionicScrollDelegate.scrollBottom(true);
      }, 300);

    });
  };

  $scope.inputDown = function() {
    if (isIOS) {
      $scope.data.keyboardHeight = 0;
    }
    $ionicScrollDelegate.resize();
  };

    


   

  

  $scope.add = function(message) {
    addPost(message);
    // pretty things up
    $scope.message = null;
  };

  $scope.takePicture = function() {
    $ionicActionSheet.show({
      buttons: [{
        text: 'Picture'
      }, {
        text: 'Selfie'
      }, {
        text: 'Saved Photo'
      }],
      titleText: 'Take a...',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        ionic.Platform.isWebView() ? takeARealPicture(index) : takeAFakePicture();
        return true;
      }
    });



    function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  

  // Old code
  // var bb = new BlobBuilder();
  // bb.append(ab);
  // return bb.getBlob(mimeString);
}


function takeARealPicture(cameraIndex){
    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 50,
      sourceType: cameraIndex === 2 ? 2 : 1,
      cameraDirection: cameraIndex,
      destinationType: Camera.DestinationType.FILE_URI,
      targetWidth: 1920,
      targetHeight: 1920,
      saveToPhotoAlbum: false
    });

     var onFail = function(){
      console.log("STUFF FAILED");
    }

    function onSuccess(imageData) {
      console.log("starting camera actions");
      var storageRef = firebase.storage().ref(thisGroup.groupId);
      var photoId = (Math.random()*1e32).toString(36);

    var getFileBlob = function(url, cb) {
      console.log("get file blob");
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            cb(xhr.response);
        });
        xhr.send();
    };

    // function decodeFromBase64(input) {
    //   input = input.replace(/\s/g, '');
    //   return input;
    // }

    var blobToFile = function(blob, name) {
        console.log("blob to file");
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    };

    var getFileObject = function(filePathOrUrl, cb) {
        console.log("get file object");
        getFileBlob(filePathOrUrl, function(blob) {
          console.log("getFileBlob callback")
            cb(blobToFile(blob, photoId+'.jpg'));
        });
    };



    getFileObject(imageData, function(fileObject) {
        console.log("made it to callback");
        var uploadTask = storageRef.child(thisGroup.groupId+'/'+photoId+'.jpg').put(fileObject);

        uploadTask.on('state_changed', function(snapshot) {
            console.log(snapshot);
        }, function(error) {
            console.log("error here? ",error);
        }, function() {
            var downloadURL = uploadTask.snapshot.downloadURL;
            console.log(downloadURL);
            // handle image here
        });
    });

}
}








    function takeAFakePicture() {
      addPost(null, $cordovaCamera.getPlaceholder());
    }
  };












    $ionicModal.fromTemplateUrl('templates/image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    $scope.imageSrc = '';

    $scope.showImage = function(src) {
      $scope.imageSrc = src;
      $scope.openModal();
    }
  

    $scope.sameDay = function(thisUnix, lastUnix){
      if (!lastUnix){
        return true
      } else {
        var newest = moment(thisUnix).format('MMMM Do, YYYY');
        var oldest = moment(lastUnix).format('MMMM Do, YYYY');
        if (newest !== oldest){
        return true;
        } else {
        return false;
        }
      }
    }







});
