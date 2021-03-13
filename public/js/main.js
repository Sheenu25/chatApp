//this is fontend js

angular.module("myApp", [])
  .directive('scrollBottom', function() {
    return {
      scope: {
        scrollBottom: "="
      },
      link: function(scope, element) {
        scope.$watchCollection('scrollBottom', function(newValue) {
          if (newValue) {
            $(element).scrollTop($(element)[0].scrollHeight);
          }
        });
      }
    }
  })
  .controller('appCtrl', ['$scope', '$window', function($scope, $window) {
    $scope.details = {
      username: "",
      room: ""
    };
    $scope.msg = {
      inputmessage: ""
    };
    $scope.chatMessages = angular.element(document.querySelector('.chat-messages'))
    $scope.messages = [];
    $scope.displayUsers = {
      users: ""
    };


    $scope.startChat = function() {
      // console.log("abc");
      // console.log($scope.details);
      // console.log($scope.username);

      if ($scope.details.username == '' || $scope.details.room == '') {
        $window.alert("please enter both fields");
      } else {
        $scope.showLogin = false;
        $scope.showChat = true;
        console.log($scope.details.username, $scope.details.room);

        const socket = io(); //can access because of script tag added in chat.html

        //join chat Room
        const username = $scope.details.username;
        const room = $scope.details.room;
        socket.emit('joinRoom', {
          username,
          room
        });

        socket.on('roomUsers', ({
          room,
          users
        }) => {

          $scope.displayUsers.users = users;
          // console.log("in roomusers");
          // console.log($scope.displayUsers.users);
          // console.log("abc",$scope.displayUsers);
          $scope.$digest();
        });
        //message from server
        //catched from server.js
        socket.on('message', message => {
          // console.log(message);
          outputMessage(message);
        })

        //message submit

        $scope.submit = function($event) {
          $event.preventDefault();
          var msg = $scope.msg.inputmessage;
          // console.log("int submit",msg);
          socket.emit('chatMessage', msg);

          $scope.msg.inputmessage = "";
          $scope.focus = true;
        }

        //output message to dom
        function outputMessage(message) {
          $scope.messages.push(message);
          $scope.$digest();
        }
      }
      $scope.leaveroom = function() {
        window.location.reload();
      }
    }
  }])
