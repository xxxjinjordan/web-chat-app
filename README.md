# 프로젝트 명세서
**node.js와 socket.io를 활용한 채팅 server/client 구현**
실습을 통해 얻은 경험 TIL 정리

## 1. 프로젝트 개요
> node.js 웹소켓 라이브러리인 socket.io를 활용하여 간단한 채팅 서버를 구현

 * node.js를 이해하고, 개발환경을 세팅
 * express를 이해하고 활용
 * socket.io 라이브러리를 활용하여 채팅 서버를 구현
 * 본 과제를 통해 웹 기반 채팅 서버를 구현해보고 설치형 메신저와 웹 메신저와의 차이를 이해


## 2. 필수 지식 학습
### [Node.js](https://nodejs.org/ko/about/)

### [Express](https://expressjs.com/ko/)
* Node.js에서 동작하는 프레임워크
* http와 connect 컴포넌트를 기반으로 서버를 쉽게 만들기 위해 사용
* 서버를 담당

### [socket.io](https://socket.io/docs/v4/)
* 클라이언트와 서버간의 통신을 위한 라이브러리 for 실시간 웹 애플리케이션
* low-latency, 양방향, event-based
* 통신을 담당

#### 웹 브라우저에서의 양방향 통신
* 기존 웹페이지의 http 프로토콜은 request/response 패러다임 -> 클라이언트에서 요청을 보내야만 그에 대한 응답을 받음
* 초기 웹페이지와 다르게 동적인 기능이 많이 요구되는 현대 웹페이지는 **요청을 보내지 않아도 서버 -> 클라이언트로 데이터를 보내야하는 경우가 발생**
* 하지만 http 프로토콜로 통신하는 경우 연결이 유지가 되지 않아서 서버에서 먼저 요청을 보내는 것이 불가능
* 이를 비슷하게 구현하고자 *Polling, Long Polling, Streaming* 방식을 이용

##### Polling
* 클라이언트에서 일정 주기마다 요청을 보내고 서버는 현재 상태를 바로 응답
* 당연히 매 요청마다 응답이 발생하기 때문에 불필요한 트래픽 발생
* 실시간으로 반영되는 것이 중요한 서비스에서는 부적합

![Polling](http://www.secmem.org/assets/images/websocket-socketio/polling.png)

##### Long Polling
* 클라이언트에서 요청을 보내고 서버에서는 이벤트가 발생했을 때 응답을 보내주고 클라이언트가 응답을 받았을 때 다시 다음 응답을 기다리는 요청을 보내는 방식
* 실시간 반응이 가능
* Polling에 비해서 불필요한 트래픽 유발은 하지 않지만 이벤트가 잦다면 순간적으로 과부하가 걸리게 됨

![Long Polling](http://www.secmem.org/assets/images/websocket-socketio/long-polling.png)

##### Streaming
* 이벤트가 발생했을 때 응답을 내려주는 방식, 응답을 완료시키지 않고 계속 연결을 유지
* Long Polling에 비해 응답마다 다시 요청을 하지 않아도 되어 효율적이지만, 연결 시간이 길 수록 연결의 유효성 관리 부담 발생 

![Streaming](http://www.secmem.org/assets/images/websocket-socketio/streaming.png)

위와 같은 방법들을 이용하여 서버-클라이언트 양방향 통신을 구현할 수도 있지만 이제는 HTML5에서 소켓 연결을 하는 WebSocket이 표준으로 등록되어 있어 이를 이용하여 구현

### WebSocket
![WebSocket](http://www.secmem.org/assets/images/websocket-socketio/websocket.png)

* 웹 서버와 웹 브라우저간 실시간 양방향 통신환경을 제공해주는 *실시간 통신 기술*
* Polling  방식(request-response)과 다르게 양방향으로 원할 때 요청을 보낼 수 있음
* stateless한 http에비해 오버헤드가 적으므로 유용
* ws프로토콜을 이용한 양방향 통신으로 한번 연결되면 **연결을 끊지 않고 계속 유지**한 상태로 **클라이언트와 서버가 서로 데이터를 주고 받음**
    * http 통신의 경우 클라이언트가 요청을 보내고 서버가 응답을 내려주면 바로 연결이 끊어짐
* [WebSocket 구현 reference](https://curryyou.tistory.com/348)

### Socket.io 모듈
socket.io는 소켓 구현시 필요한 다양한 편의기능을 제공하는 모듈로 웹소켓이 지원되지 않는 브라우저에서도 작동하도록 내부적으로 구현해준다.
* ws 프로토콜이 지원되지 않는 경우, http 프로토콜은 polling 방식을 이용

#### socket.io 모듈 설치
```
npm install socket.io
```

#### 서버 측 socket.io 설정 작업
##### 1. http 서버 생성
```
const app = require("express")();
const server = app.listen(30001, ()=>{ ... 코드 ... });
```
- express 등을 활용해 http 서버 생성 및 구동
 
##### 2. socket.io 객체 생성 및 구동
```
const io = socketIO(server, {path: "/socket.io"});
```
- 첫번째 매개변수: 연결할 http서버를 설정
- 두번째 매개변수: 객체{키: 값, ... } 형태로 각종 옵션을 설정한다
  * path옵션: 이 경로를 통해 통신을 수행하며, 생략시 디폴트 값은 /socket.io 로 지정된다.
 
##### 3. 주요 이벤트 처리
```
io.connect('connect', (socket)=>{
    socket.on('disconnect', (reason)=>{...코드...});
    socket.on('error', (error)=>{...코드...});
    socket.on('사용자정의이벤트', (data)=>{...코드...});
});
```
- connect 이벤트를 제외하곤, 콜백함수의 매개변수로 들어온 socket객체에 이벤트 처리를 해주는 점에 주의하자!
1) connect: 연결 성공
2) disconnect: 연결 종료
3) error: 에러 발생
4) 그외 : 사용자 정의 이벤트
 
##### 4. 데이터 전송 to 클라이언트: 사용자 정의 이벤트 발생
```
socket.emit('이벤트 이름', '클라이언트에게 전송할 데이터 내용');
```
- emit()메서드를 통해 클라이언트에게 "데이터"를 보낼 수 있다.
- 클라이언트에서는 "이벤트이름"으로 데이터를 받아 처리할 수 있다.

#### 클라이언트 측 socket.io 설정 작업
##### 1. socket.io 모듈 스크립트 로드
```
<script src="/socket.io/socket.io.js"></script>
```
- socket.io모듈은 내부적으로 "루트/socket.io" 경로에 socket.io.js 파일을 자동으로 등록해둔다.
- 결과적으로 위 코드는 socket.io모듈이 자동으로 생성해둔 http://127.0.0.1:30001/socket.io/socket.io.js 에 접근하여 JS 스크립트를 불러오게 된다.
- 단, node.js 상에서 "socket.io 객체 생성시 설정한 path" 경로로 접근해야 한다.(생략시 디폴트가 /socket.io로 지정된다)
 
 
##### 2. 서버 socket접속용 객체 생성 및 연결
```
const socket = io.connect("http://127.0.0.1:30001", {path: "/socket.io", transports: ['websocket']});
```
- 연결할 서버 경로 및 옵션을 설정해준다.
1) path 옵션
: 이 경로를 통해 각종 통신을 수행하며, node.js상에서 설정한 path와 동일하게 지정해야한다.
2) transports 옵션
: socket.io는 처음에 polling 연결을 시도하고, 웹소켓이 지원되는 브라우저인 경우, ws통신으로 변경한다.
: 처음부터 ws로 통신하고자 할 경우, transports 옵션 값을 ['websocket']으로 추가 설정해주면 된다.
 
##### 3. 이벤트 처리(연결/종료/에러/데이터 수신 등)
```
socket.on('connect', ()=>{... 코드 ...});
socket.on('disconnect', (reason)=>{... 코드 ...});
socket.on('error', (error)=>{... 코드 ...});
socket.on('사용자정의이벤트', (data)=>{... 코드 ...});
```
1) connect: 연결 성공
2) disconnect: 연결 종료
3) error: 에러 발생
4) 그외 : 사용자 정의 이벤트 - 개발자가 서버에 데이터 전송시 '이름표'를 달고 보내는 이벤트다.
 
##### 4. 데이터 전송 to 서버: 사용자 정의 이벤트 발생
```
socket.emit('이벤트 이름', '서버에게 보낼 데이터 내용');
```
- emit()메서드를 통해 서버에게 "데이터"를 보낼 수 있다.
- 서버에서는 "이벤트이름"으로 데이터를 받아 처리할 수 있다.

## 3. 결과 화면
![채팅](https://user-images.githubusercontent.com/48264542/173991425-c3cf24f6-86ae-435f-9c88-1abfd04447d6.png)

#### 채팅 프로그램 flow
* 입장 시
    * connect (index.html) -> newUserConnect (server.js) -> updateMessage (index.html)
    * 소켓연결, 대화명입력받음 ->  대화명저장, 메세지 작성, 메세지 전달 -> 브라우저에 데이터 삽입
 
* 대화 시
    * click (index.html) -> sendMessage (server.js) -> updateMessage (index.html) 
    * 클릭, 메세지 작성 -> 대화명저장, 메세지 전달 -> 브라우저에 데이터 삽입
 
* 퇴장 시
    * disconnect (server.js) -> updateMessage (index.html)
    * 소켓종료, 메세지작성, 메세지 전달 -> 브라우저에 데이터 삽입
