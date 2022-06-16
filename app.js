// app.js
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const fs = require("fs");
// socket.io 모듈을 불러와 io 변수에 담는다.
const io = require("socket.io")(server);

app.use(express.static("src"));

app.get("/", function (req, res) {
  fs.readFile("./src/index.html", (err, data) => {
    if (err) throw err;

    res
      .writeHead(200, {
        "Content-Type": "text/html",
      })
      .write(data)
      .end();
  });
});

// io.sockets.on에 connection 이벤트가 호출되면 실행될 함수를 바인딩
// io.sockets은 나를 포함한 모든 소켓의 객체이며 'connection'이벤트는 소켓이 연결되면 호출되는 이벤트
// on 메서드를 통해 이벤트를 바인딩 할 수 있다.
// emit 메서드를 통해 이벤트를 호출할 수 있다.
// on -> 수신, emit -> 발신
// connection의 콜백함수의 socket인자는 접속된 해당 소켓의 객체
// 소켓 연결 중에 어떤 이벤트를 바인딩하고 싶다면 connection 콜백함수 스코프 내부에 이벤트리스너들을 작성.
io.sockets.on("connection", function (socket) {
  socket.on("newUserConnect", function (name) {
    socket.name = name;

    let message = name + "님이 접속했습니다.";

    io.sockets.emit("updateMessage", {
      name: "SERVER",
      message: message,
    });
  });

  socket.on("disconnect", function () {
    let message = socket.name + "님이 퇴장했습니다.";
    // socket.broadcast -> 나를 제외한 전체 소켓, 접속을 종료하는 나에게 emit할 필요가 없다.
    socket.broadcast.emit("updateMessage", {
      name: "SERVER",
      message: message,
    });
  });

  socket.on("sendMessage", function (data) {
    data.name = socket.name;
    io.sockets.emit("updateMessage", data);
  });
});

server.listen(3030, function () {
  console.log("서버 실행중 ...");
});
