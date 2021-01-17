// Import Socket

const peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: 3030
});

var socket = io("/");

peer.on("open", id => {
    socket.emit("room-joined", {
        joinRoom: ROOM_ID,
        username: USERNAME,
        peerID: id
    });
    
});


// The Client's Video and Audio stream

const userVideo = navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    // Todo: Add Controls

    const video = document.createElement("video");
    addVideoStream(video, stream); // Add Client Stream


    // Accepting other Peers and adding their stream
    peer.on("call", call => {
        console.log(call)
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", userStream => {
            console.log("Answered");
            addVideoStream(video, userStream);
        });
        
    });
    
    socket.on("user-connected", (uid) => {
        addMessage("User has Joined","SYSTEM");
        connectToUser(uid, stream);
    });
});

// Function to add Video to Page

const addVideoStream = (video, stream) => {
    let videoGrid = document.querySelector(".videos");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        videoGrid.appendChild(video);
        video.play();
    });
}

const addMessage = (message, sender) => {
    var chatWindow = document.querySelector(".chat__window .messages");
    const messageElement = document.createElement("li");
    messageElement.innerHTML = `<h3>${sender}</h3><p>${message}</p>`
    
    // * If sender is the User
    if(sender == "You")
    {
        messageElement.classList.add("client-message");
    }
    
    chatWindow.appendChild(messageElement);
}

const connectToUser = (uid, stream) => {
    setTimeout(() => {
        console.log(peer.id);
        console.log("New User: ", uid);
        const call = peer.call(uid, stream);
        const video = document.createElement("video");
        call.on("stream", userStream => {
            console.log("Called")
            addVideoStream(video, userStream);
        });
    }, 1000);

    
}


const handleMessage = (e) => {
    // ! Ascii code "13" is enter
    const message = document.querySelector(".message_box");
    if(e.which == 13 && message.value.length != 0)
    {
        addMessage(message.value, "You");
        socket.emit("new-message", message.value, USERNAME);
        message.value = "";
    }
}

socket.on("message-recieved", (message, sender) => {
    addMessage(message, sender);
});


window.onload = () => {
    const message = document.querySelector(".message_box");
    message.addEventListener("keydown", handleMessage);
}