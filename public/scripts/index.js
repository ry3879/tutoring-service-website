/*This file is to handle yourself. It's the script for index.html so yeah :D */

let isAlreadyCalling = false;
let getCalled = false;

var ID = document.currentScript.getAttribute('ID'); //1
var requested = document.currentScript.getAttribute('requested'); //2
var accepted = document.currentScript.getAttribute('accepted'); //1
var isRequested = document.currentScript.getAttribute('isRequested'); //2

var otherUser = requested;
var yourself = accepted;
if(isRequested==="true"){
  otherUser = accepted;
  yourself = requested;
}

const existingCalls = [];

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

//function is called when not active. we wouldn't want to call these anymore
//since we're not dealing with active boxes or whatnot
function unselectUsersFromList() {
  const alreadySelectedUser = document.querySelectorAll(
    ".active-user.active-user--selected"
  );

  alreadySelectedUser.forEach(el => {
    el.setAttribute("class", "active-user");
  });
}
//we also likely wouldn't need this
function createUserItemContainer(socketId,user) {
  const userContainerEl = document.createElement("div");

  const usernameEl = document.createElement("p");

  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");
  //usernameEl.innerHTML = `Socket: ${socketId}`;
  usernameEl.innerHTML = "User: " + user;
  userContainerEl.appendChild(usernameEl);

  userContainerEl.addEventListener("click", () => {
    unselectUsersFromList();
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    const talkingWithInfo = document.getElementById("talking-with-info");
    //talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    talkingWithInfo.innerHTML = `Talking with: ` + user;
    callUser(socketId,user);
  });

  return userContainerEl;
}

async function callUser(socketId, name) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit("call-user", {
    offer,
    to: socketId,
    name: name
  });
}

//again, wouldn't need this, since it's dealing with the whole active users thing
function updateUserList(socketIds) {
  const activeUserContainer = document.getElementById("active-user-container");

  socketIds.forEach(socketId => {
    const alreadyExistingUser = document.getElementById(socketId.id);
    if (!alreadyExistingUser && (socketId.user === otherUser)) {
      const userContainerEl = createUserItemContainer(socketId.id, socketId.user);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
}

//instead, we'd have to replace this with something else.
//now though, we wouldn't actually have to deal with the website would we?
//we can actually just post the information instead maybe
//actually i think we'd keep this with localhost:3000 hmmm
const socket = io.connect("localhost:3000", {query:{user:yourself}});

socket.on("update-user-list", ({ users }) => {
  //alert("hi");
  updateUserList(users);
});
//we also wouldn't need this?
//remember for all these on things, we need to cancel the emit
socket.on("remove-user", ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
});

socket.on("call-made", async data => {
  if (getCalled) {
    //alert(data.name);
    const confirmed = confirm(
      `User ${data.name} wants to call you. Do accept this call?`
    );

    if (!confirmed) {
      socket.emit("reject-call", {
        from: data.socket,
        name: data.name
      });

      return;
    }
  }

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  socket.emit("make-answer", {
    answer,
    to: data.socket,
    name: data.name
  });
  getCalled = true;
});

socket.on("answer-made", async data => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );

  if (!isAlreadyCalling) {
    callUser(data.socket);
    isAlreadyCalling = true;
  }
});

socket.on("call-rejected", data => {
  alert(`User: ${data.name} rejected your call.`);
  unselectUsersFromList();
});

peerConnection.ontrack = function({ streams: [stream] }) {
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
  }
};

navigator.getUserMedia(
  { video: true, audio: true },
  stream => {
    const localVideo = document.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = stream;
    }

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  },
  error => {
    console.warn(error.message);
  }
);

//disconnect socket when closing
window.onbeforeunload = function(e) {
  socket.disconnect();
};

