import socketClient from 'socket.io-client';
import * as webRTCHandler from './webRTCHandler';
const SERVER = 'https://signaling-server-backend.herokuapp.com';

const broadcastEventTypes = {
  ACTIVE_USERS: 'ACTIVE_USERS',
  GROUP_CALL_ROOMS: 'GROUP_CALL_ROOMS'
};

let socket;

export const connectWithWebSocket = (setMySocketId) => {
  socket = socketClient(SERVER);

  socket.on('connection', () => {
    console.log('succesfully connected with wss server');
    console.log(socket.id);
    setMySocketId(socket.id);
  });

  socket.on('broadcast', (data) => {
    
    handleBroadcastEvents(data);
  });

  socket.on('webRTC-offer',(data)=>{
    console.log("Recieved webRTC offer");
    webRTCHandler.handlerOffer(data);
  });

  socket.on('webRTC-answer',(data)=>{
    console.log("handling webRTC answer");
    webRTCHandler.handleAnswer(data);
  })

  socket.on('webRTC-candidate',(data)=>{
    console.log("handling candidates");
    webRTCHandler.handleCandidate(data);
  })

};

export const registerNewUser = (username) => {
  socket.emit('register-new-user', {
    username: username,
    socketId: socket.id
  });
};

const handleBroadcastEvents = (data) => {
  switch (data.event) {
    case broadcastEventTypes.ACTIVE_USERS:
        console.log(data)
      break;
    default:
      break;
  }
};


export const sendWebRTCOffer = (data)=>{
  console.log("sending webRTC offer");
  socket.emit('webRTC-offer',data);
}

export const sendWebRTCAnswer = (data) =>{
  socket.emit('webRTC-answer',data);
}

export const sendWebRTCCandidate = (data) => {
  socket.emit('webRTC-candidate',data);
}