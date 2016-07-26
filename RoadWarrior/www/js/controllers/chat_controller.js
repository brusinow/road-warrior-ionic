angular.module('roadWarrior.controllers')




.controller('ChatsCtrl', function($scope, thisGroup, chatMessages, Profile, currentAuth, ActiveGroup, $cordovaCamera, $ionicScrollDelegate, $ionicModal, $ionicActionSheet, $timeout, $state, moment) {
  Profile(currentAuth.uid).$bindTo($scope, "profile");



  $scope.chats = {
    main: {
      data: chatMessages(thisGroup.groupId,'main',1),
      title: "Main",
      toChat: function(){
      $state.go("tab.chats-main");
      }
    },
    show: {
      data: chatMessages(thisGroup.groupId,'show',1),
      title: "Show Related",
      toChat: function(){
      $state.go("tab.chats-show");
      }
    },
    fun: {
      data: chatMessages(thisGroup.groupId,'fun',1),
      title: "Fun",
      toChat: function(){
      $state.go("tab.chats-fun");
      }
    }
  }


})



.controller('ChatsTopicCtrl', function($scope, $q, thisGroup, chatName, chatMessages, chatMedia, Profile, currentAuth, ActiveGroup, $cordovaCamera, $ionicScrollDelegate, $ionicModal, $ionicActionSheet, $timeout,$state,$ionicPopover, moment) {

  Profile(currentAuth.uid).$bindTo($scope, "profile");
  $scope.chatName = chatName;

  $scope.images = chatMedia(thisGroup.groupId, chatName.lowerCase);
  $scope.thisPhoto = '';
  $scope.postDate = {};
  $scope.showTime = false;

  $scope.posts = chatMessages(thisGroup.groupId,chatName.lowerCase,100);
  $scope.posts.$loaded().then(function(){  
    $timeout(function() {
        $ionicScrollDelegate.scrollBottom(true);
    }, 600);
  })
  
  
  $scope.posts.$watch(scrollBottom);


  function scrollBottom() {
    $ionicScrollDelegate.$getByHandle('chat').scrollBottom(true);
  }

  function addPost(message, url) {
    $scope.posts.$add({
      message: message ? message : null,
      img: url ? url : null,
      timestamp: new Date().getTime(),
      user: $scope.profile.name,
      userId: $scope.profile.$id 
    }).then(function(ref){
      $scope.postId = ref.key;
      console.log("what is post id? ",ref.key);


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



function takeARealPicture(cameraIndex){
    $scope.postId = "";
    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 75,
      targetWidth: 1000,
      targetHeight: 1000,
      sourceType: cameraIndex === 2 ? 2 : 1,
      cameraDirection: cameraIndex,
      destinationType: Camera.DestinationType.DATA_URL,
      saveToPhotoAlbum: false
    });

     var onFail = function(){
      console.log("STUFF FAILED");
    }

    function onSuccess(imageData) {
      console.log("starting camera actions");
      var storageRef = firebase.storage().ref(thisGroup.groupId+'/'+$scope.chatName.lowerCase);
      var photoId = (Math.random()*1e32).toString(36);
      $scope.thisPhoto = 'data:image/jpeg;base64,' + imageData;
      addPost(null, $scope.thisPhoto);


    function getFileBlob(base64Data, contentType, cb) {
        contentType = contentType || '';
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);

        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);

            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        cb(blob);
    }

    var blobToFile = function(blob, name) {
        console.log("blob to file");
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    };

    var getFileObject = function(filePathOrUrl, cb) {
        console.log("get file object");
        getFileBlob(filePathOrUrl,'image/jpeg', function(blob) {
          console.log("getFileBlob callback")
            cb(blobToFile(blob, photoId+'.jpg'));
        });
    };



    getFileObject(imageData, function(fileObject) {
        console.log("made it to callback");
        var uploadTask = storageRef.child(photoId+'.jpg').put(fileObject);
        uploadTask.on('state_changed', function(snapshot) {
            console.log("snapshot is ",snapshot);
        }, function(error) {
            console.log("error here? ",error);
        }, function() {
            $timeout(function () {
              var rec = $scope.posts.$getRecord($scope.postId)
              console.log("what is rec? ",rec);
              var downloadURL = uploadTask.snapshot.downloadURL;
              rec.firebase = downloadURL;
              $scope.images.$add({
                jpeg: $scope.thisPhoto,
                download: downloadURL,
                messageRef: $scope.postId
              }).then(function(ref){
                console.log("database ref for media saved");
              });
              $scope.posts.$save(rec).then(function(ref) {
                console.log("update saved to message object");
                ref.key === rec.$id; // true
              });
            }, 1000);
        });
    });

}
}


    function takeAFakePicture() {
      addPost(null, $cordovaCamera.getPlaceholder());
    }
  };



  $scope.downloadImage = function(url){
  var fileURL = "cdvfile://localhost/persistent/file.jpg";

  var fileTransfer = new FileTransfer();
  var uri = url;
  console.log("what is URI? ",uri);

  fileTransfer.download(
    uri,
    fileURL,
    function(entry) {
        console.log("download complete: " + entry.toURL());
    },
    function(error) {
        console.log("download error source " + error.source);
        console.log("download error target " + error.target);
        console.log("download error code" + error.code);
    }
  );
}


  $ionicPopover.fromTemplateUrl('templates/img-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event, url) {
    console.log("ON HOLD!!!");
    $scope.url = {'value' : url};
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
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



    $ionicModal.fromTemplateUrl('templates/image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/allChatPhotos-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalPhoto = modal;
    });

    $scope.openModal = function(index) {
      if (index === 1){
      $scope.modal.show();
      } else if (index === 2){
      $scope.modalPhoto.show();
      }
    };

    $scope.closeModal = function(index) {
       if (index === 1){
      $scope.modal.hide();
      } else if (index === 2){
      $scope.modalPhoto.hide();
      }
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
      $scope.modalPhoto.remove();
    });

    $scope.imageSrc = '';

    $scope.showImage = function(src, index) {
      console.log("show image");
      $scope.imageSrc = src;
      $scope.openModal(index);
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