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
app.get('/joinlobby', function(req, res) {
    res.sendFile(__dirname + "/misc/joinlobby.html");
});
app.get('/play/:gcode/:name', function(req, res) {
    res.render("pages/play", { gcode: req.params.gcode, name: req.params.name });
});
app.get("/startgame/1", (req, res) => {
    res.sendFile(__dirname + "/misc/startgame.1.html");
})
app.get("/startgame/2/:people", async(req, res) => {
    var buf = Buffer.from(req.params.people, 'base64');
    var encJson = String(buf);
    var id = require("shortid").generate()
    peopleByGame[id] = JSON.parse(encJson);
    gameSockets[id] = [];

    res.render("pages/host", {
        code: id
    })
})
io.on('connection', function(socket) {
    console.log("Got connection: " + socket.id)
    socket.on("host", function(gcode) {
        console.log("ishost");
        hostSockets[gcode] = socket;
        setInterval(() => { // Send player list every 750ms TODO: Events? only send player on join etc
            socket.emit("playerRelist", gameSockets[gcode])
        }, 750);
    })
    socket.on("join", function({ gcode, name }) {
        console.log("joined")
        gameSockets[gcode].push({ id: socket.id, name: name })
        if (gameSockets[gcode].length > 2) return socket.emit("_err", "Too many players");
        console.log("Didn't error")
        if (gameSockets[gcode].length == 1) {
            console.log("is mastero")
                // is masterplayer
            socket.emit("u are master")
            socket.emit("people", peopleByGame[gcode]);
            socket.on("choice", function(choices) {
                gameSockets[gcode].forEach(a => {
                    io.to(a.id).emit("masterChoice", choices);
                })
            })
        } else if (gameSockets[gcode].length == 2) {
            // is slaveplayer
            console.log("is slaveo")
            socket.emit("u are slave")
        }
    })

});