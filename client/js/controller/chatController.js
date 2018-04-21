// App controller
app.controller('chatController', ['$scope','dataServ', 'clientSocketManager', '$location', '$anchorScroll','$timeout',
    ($scope, Data, clientSocketManager, $location, $anchorScroll, $timeout) => {
    let messageToReply;
    let skins = {
        "plamingo": {
            background: 'js/view/background1.jpg',
            textAreaColor: '#ffd0e6'
        }
    };
    $scope.selectedSkin = skins.plamingo;
    $scope.focus = false;
    $scope.users = [];
    $scope.messages = [];
    $scope.messageToSend = {};

    clientSocketManager.emit("newUser", function(data){
        $scope.loggedInUser = data.name;

        $scope.users = data.users;
        $scope.messages = data.messages;
        scrollDown();
    });

    clientSocketManager.on("newUserConnected", function(newUser){
        if (newUser.name !== $scope.loggedInUser){
            // type new user, different UI for this message
            $scope.messages.push({type:'nu', newUser: newUser.name});
            $scope.users[newUser.name] = newUser;
            scrollDown();
        }
    });

    clientSocketManager.on("messageReply", function(messageWithReply){
        if (messageWithReply.answerBy !== $scope.loggedInUser){
            // find the message and update with the reply
            let message = $scope.messages.find(function(message){
                return message.id === messageWithReply.id;
            });

            message.reply = messageWithReply.reply;
        }

        scrollDown();
    });

    clientSocketManager.on("newMessage", function(message){
        if (message.author !== $scope.loggedInUser) {
            $scope.messages.push(message);
        } else {
            if (message.reply) {
                // Maybe the server also returned answer
                let messageInList = $scope.messages.find(function (currMessage) {
                    return message.id === currMessage.id;
                });

                if (messageInList) {
                    messageInList.reply = message.reply;
                }
            }
        }

        scrollDown();
    });

    clientSocketManager.on("disconnect", function(username){
        if ($scope.users[username]){
            $scope.messages.push({type:'du', user: username});
            delete $scope.users[username];
        }

        scrollDown();
    });

    $scope.send = function() {
        if ($scope.replyMode){
            let answerDate = moment().format("HH:mm");
            $scope.replyMode = false;
            $scope.focus = false;
            messageToReply.reply = {text: $scope.messageToSend.reply,
                author: $scope.loggedInUser,
                createDate: answerDate,
                type: 'A'
            };

            $scope.messageToSend.reply = '';
            clientSocketManager.emit('reply', messageToReply);
        } else {
            let creationDate = moment().format("HH:mm");
            let message = {text: $scope.messageToSend.text, author: $scope.loggedInUser, createDate: creationDate, type:'Q'};
            $scope.messages.push(message);
            $scope.messageToSend.text = '';

            clientSocketManager.emit("message", message, function(id){
                message.id = id;
            });
        }
    };

    $scope.answer = function(message){
        if (!message.reply) {
            $scope.placeholder = 'Answer';
            $scope.focus = true;
            $scope.replyMode = true;
            messageToReply = message;
        }
    };

    function scrollDown(){
        $timeout(function(){
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('bottom');

            // call $anchorScroll()
            $anchorScroll();
        });
    }

    Data.get().success(resp => {
        $scope.funnyStuff = resp;
    });
}]);