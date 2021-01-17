// Modules

const express = require("express");
const app = express();

const { v4: uuidv4} = require("uuid");

// Init Server

const server = require("http").createServer(app);
const port = 3030;

const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug:true
});

app.set("view engine", "ejs");
app.use("/peerjs", peerServer);
app.use(express.static("public"));
// Routes

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

app.get("/:roomID", (req, res) => {
    const roomData = {
        "id": req.params.roomID,
        "username": "Anonymous"
    };

    res.render("room", { data: roomData });
})

io.on("connection", socket => {
    var ROOM_ID;
    socket.on("room-joined", (data) => {
        ROOM_ID = data["joinRoom"];
        console.log("New User", socket.id);
        socket.join(ROOM_ID);
        socket.to(ROOM_ID).broadcast.emit("user-connected", data["peerID"]);
        console.log("Broadcasted");
    });

    socket.on("new-message", message => {
        socket.to(ROOM_ID).broadcast.emit("message-recieved", message);
    })
});



server.listen(port);
console.log(`Listening on PORT: ${port}`);