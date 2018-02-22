var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var db_u = require("./helpers/db_util");
var gameSockets = {};
var hostSockets = {};

app.set('view engine', 'ejs');

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
app.get("/startgame/2/:people", async(req, res) => {
    var buf = Buffer.from(req.params.people, 'base64');
    var encJson = String(buf);
    var id = await db_u.addGame(JSON.parse(encJson));
    gameSockets[id] = [];

    res.render("pages/host", {
        code: id
    })
})
io.on('connection', function(socket) {
    console.log("Got connection: " + socket.id)
    socket.on("host", function(gcode) {
        hostSockets[gcode] = socket;
    })
});