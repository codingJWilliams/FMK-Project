var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8001);

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/lobby.html");
});
app.get('/joingame', function(req, res) {
    res.sendFile(__dirname + "/misc/joingame.html");
});
app.get("/startgame/1", (req, res) => {
    res.sendFile(__dirname + "/misc/startgame.1.html");
})
app.get("/startgame/2/:people", (req, res) => {
    res.sendFile(__dirname + "/misc/startgame.1.html");
})
io.on('connection', function(socket) {

});