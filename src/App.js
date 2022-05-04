import './App.css';
import {useState,useEffect} from 'react';
import {connectWithWebSocket} from './utils/wssConnection';
import {getLocalStream,createPeerConnection,handleMute,handleUnMute,handleVideoOff,handleVideoOn,printRemoteStreamStatus,printStreamStatus,sendOffer} from './utils/webRTCHandler';
import Video from './Components/VideoView';

function App() {
  const [stream,setStream] = useState(new MediaStream());
  const [remoteStream,setRemoteStream] = useState(null);
  const [socketId,setSocketId] = useState('');
  const [mySocketId,setMySocketId] = useState('');
  const [video,setVideo] = useState(true);
  const [audio,setAudio] = useState(false);

  useEffect( ()=>{
    ( async () => {
      await getLocalStream(setStream);
    })();
    connectWithWebSocket(setMySocketId);
    createPeerConnection(stream,setRemoteStream);
  },[]);

  const handleConnectButton = () => {
    console.log("CONNECT clicked, socketId : ",socketId);
    sendOffer(socketId);
  }
  const handleMuteUnMute = () => {
    if(audio)
      handleMute(stream);
    else 
      handleUnMute(stream);
    setAudio(!audio);
  }
  const handleVideoOnOff = () => {
    if(video)
      handleVideoOff(stream);
    else 
      handleVideoOn(stream);
    setVideo(!video);
  }
  const getStreamStatus = () => {
    printStreamStatus(stream);
  }

  return (
    <div className='App' >
      <div id="main-container">
      <div >
      <h1>WEBCALL </h1>
        <h2>Your Unique ID is: {mySocketId} </h2>
        
        </div>
     
      
            <Video videoStream={stream} muted={true}/>
           
            <Video videoStream={remoteStream} muted={false}/>
     
        


<div >
	<div >
		<button 
    onClick={handleVideoOnOff}>
			      {video?'VIDEO_OFF':'VIDEO_ON'}
      
		</button>
    <button  
  onClick={handleMuteUnMute}>		
    {audio?'MUTE':'UN_MUTE'}

	</button>

	</div>

  <div>
   </div>

  
	<div class="col-md-2 text-center">
    <input
        type="text"
        value={socketId}
        onChange={(event)=>{setSocketId(event.target.value);console.log("CHANGED")}}
      />
      		<button
    onClick={handleConnectButton}
    >

      CONNECT
		</button>
	</div>
</div>
<p>Powered By - Purboshi Das</p>
   
    </div></div>
  );
}

export default App;
