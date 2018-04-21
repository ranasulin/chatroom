// const express   = require('express');
// const app       = express();
const port      = 3000;
var questionDictionary = {};
var faker = require('faker');
var http = require('http');
var express = require('express'),
    app = module.exports.app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);  //pass a http.Server instance
server.listen(port);

app.use(express.static(`${__dirname}/client`)); 		// statics
require(`./server/routes.js`)(app);

// var io = require('socket.io').listen(app);
// app.listen(port);
var users = {
    bot:
        {
            name: 'bot',
            avatar: "https://api.adorable.io/avatars/40/bot@adorable.io.png"}
}, messages = [], messageCount = 0;

io.on('connection', function(client) {
    client.on('disconnect', function() {
        delete users[client.username];

        io.emit('disconnect', client.username);
    });

    client.on("newUser", function(callback){
        let newName = faker.internet.userName();
        let newUser = {
            name: newName,
            avatar: "https://api.adorable.io/avatars/40/" + newName + "@adorable.io.png"
        };
        client.username = newName;

        users[newName] = newUser;
        callback({name: newName, users: users, messages: messages});

        io.emit("newUserConnected", newUser);
    });

    client.on("message", function(message, callback){
        if (questionDictionary[message.text]){
            message.reply = questionDictionary[message.text];
        }

        message.id = messageCount;
        messageCount++;
        messages.push(message);
        callback(message.id);

        io.emit("newMessage", message);
    });

    client.on("reply", function(message){
        questionDictionary[message.text] = message.reply;
        questionDictionary[message.text].author = "bot";

        // find the message in the messages and add the answer
        let messageToAdd = messages.find(function(currMessage){
            return currMessage.id === message.id;
        });

        messageToAdd.reply = message.reply;

        io.emit("messageReply", message);
    });
});
// let the games begin!
console.log(`Web server listening on port ${port}`);
