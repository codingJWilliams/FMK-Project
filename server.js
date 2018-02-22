var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var db_u = require("./helpers/db_util");
var gameSockets = {};
var hostSockets = {};
var peopleByGame = {}
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
    peopleByGame[id] = JSON.parse(encJson);
    gameSockets[id] = [];

    res.render("pages/host", {
        code: id
    })
})
io.on('connection', function(socket) {
    console.log("Got connection: " + socket.id)
    socket.on("host", function(gcode) {
        hostSockets[gcode] = socket;
        setTimeout(() => { // Send player list every 750ms TODO: Events? only send player on join etc
            socket.emit("playerRelist", gameSockets[gcode])
        }, 750);
    })
    socket.on("join", function({ gcode, name }) {
        gameSockets[gcode].push({ id: socket.id, name: name })
        if (gameSockets[gcode].length > 2) return socket.emit("_err", "Too many players");
        if (gameSockets[gcode].length == 1) {
            // is masterplayer
            socket.emit("u are master")
            socket.emit("people", peopleByGame[gcode]);
            socket.on("choice", function(choices) {
                gameSockets[gcode].forEach(a => {
                    io.to(a.id).emit("masterChoice", choices);
                })
            })
        } else if (gameSockets[gcode].length == 2) {}
        // is slaveplayer
        socket.emit("u are slave")
    })
});