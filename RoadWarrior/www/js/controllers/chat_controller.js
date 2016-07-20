angular.module('roadWarrior.controllers')



.controller('ChatsCtrl', function($scope, chatMessages, Profile, currentAuth, ActiveGroup, $cordovaCamera, $ionicScrollDelegate, $ionicModal, $ionicActionSheet, $timeout, moment) {
   
  $scope.postDate = {};
  $scope.showTime = false;
  $scope.showChat = false;
  console.log($scope.showTime);

  function scrollBottom() {
    $ionicScrollDelegate.$getByHandle('chat').scrollBottom();
  }

  function addPost(message, img) {
    chatMessages($scope.thisGroup.groupId).$add({
      message: message ? message : null,
      img: img ? img : null,
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

    Profile(currentAuth.uid).$bindTo($scope, "profile").then(function(){
    $scope.myId = $scope.profile.$id;
    })


    ActiveGroup(currentAuth.uid).$bindTo($scope, "thisGroup").then(function(){
    $scope.posts = chatMessages($scope.thisGroup.groupId);
    $scope.posts.$loaded()
    .then(function(){
    // $ionicScrollDelegate.scrollBottom();
    $scope.showChat = true;  
    })
    
    $scope.posts.$watch(scrollBottom);
  });


  

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

    function takeARealPicture(cameraIndex) {
      var options = {
        quality: 50,
        sourceType: cameraIndex === 2 ? 2 : 1,
        cameraDirection: cameraIndex,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 600,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        var photo = 'data:image/jpeg;base64,' + imageData;
        addPost(null, photo);
      }, function(err) {
        // error
        console.error(err);
        takeAFakePicture();
      });
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
