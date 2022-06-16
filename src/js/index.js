"use strict";

// socket.io 실행 후 해당 객체를 리턴 받아 socket 변수에 담는다.
var socket = io();

// 담겨진 변수를 통해 connect이벤트에 바인딩.
// connect 이벤트는 소켓이 연결되면 호출.
socket.on("connect", function () {
  let name = prompt("대화명을 입력해주세요.", "");

  // 저장한 name 값을 newUserConnect 이벤트를 호출하면서 파라미터로 전달
  // 이벤트 이름(newUserConnect)은 app.js에서 이벤트 호출 시 실행되는 on함수의 네임과 동일해야함.
  socket.emit("newUserConnect", name);
  console.log("connect");
});

let chatWindow = document.getElementById("chatWindow");

socket.on("updateMessage", function (data) {
  if (data.name === "SERVER") {
    let info = document.getElementById("info");
    info.innerHTML = data.message;

    setTimeout(() => {
      info.innerText = "";
    }, 1000);
  } else {
    let chatMessageEl = drawChatMessage(data);
    chatWindow.appendChild(chatMessageEl);

    // 사용자 대화일 경우 스크롤을 높이만큼 내려주어 최신 대화를 볼 수 있다.
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

function drawChatMessage(data) {
  let wrap = document.createElement("p");
  let message = document.createElement("span");
  let name = document.createElement("span");

  name.innerText = data.name;
  message.innerText = data.message;

  name.classList.add("output__user__name");
  message.classList.add("output__user__message");

  wrap.classList.add("output__user");
  wrap.dataset.id = socket.id;

  wrap.appendChild(name);
  wrap.appendChild(message);

  return wrap;
}

let sendButton = document.getElementById("chatMessageSendBtn");
let chatInput = document.getElementById("chatInput");

sendButton.addEventListener("click", function () {
  let message = chatInput.value;
  if (!message) return false;

  socket.emit("sendMessage", {
    message,
  });

  chatInput.value = "";
});
