import * as wss from './wssConnection';
import axios from 'axios';
const defaultConstraints = {
    video : true,
    audio : false
}

export const getLocalStream = async (setStream) => {
    console.log("GET LOCAL STREAM");
    while(navigator.mediaDevices === undefined);
    console.log("READY");
    try {
        console.log("INSIDE TRY");
        const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
        console.log("GOT LOCAL STREAM",stream);
        setStream(stream);
        return stream;
      } catch(err) {
        console.log("error occured when trying to get an access to local stream")
        console.log(err);
      }
}

let peerConnection;
let candidate=null;
let connectedUserSocketId=null;
let videoSender = null;
let audioSender = null;


export const createPeerConnection = (localStream,setRemoteStream) => {
    const configuration = {
        iceServers:[{
            urls:'turn:34.201.113.114:3478',
            username:"test",
            credential:"test123"
        }],
        iceTransportPolicy:'all'
    }

    console.log("CONFIGURATION",configuration);

    try{
        peerConnection = new RTCPeerConnection(configuration);

      }catch(err){
        console.log("ERRROR at RTCPeerConnection creation",err);
    }

    peerConnection.ontrack = ({streams:[stream]})=>{
        console.log("on track fired",stream);
        setRemoteStream(stream);
    };

    peerConnection.onicecandidate = (event) => {
        console.log("Got ice candidates");
        if(event.candidate){
            candidate = event.candidate;
            wss.sendWebRTCCandidate({
                candidate:candidate,
                connectedUserSocketId:connectedUserSocketId
            })
        }
    };
    peerConnection.onconnectionstatechange = (event) => {
        console.log("STATE CHANGED",peerConnection);
        if(peerConnection.connectionState === 'connected'){
            console.log("succesfully connected with other client")
        }
    }


}



export const sendOffer = async (socketIDofCallee) => {
    console.log("SENDING WEBRTC OFFER FROM CLIENT",peerConnection);
    connectedUserSocketId = socketIDofCallee;
    let offer;
    const offerOptions = {offerToReceiveAudio: true, offerToReceiveVideo: true};
        offer = await peerConnection.createOffer(offerOptions);
    await peerConnection.setLocalDescription(offer);

    wss.sendWebRTCOffer({
        calleeSocketId: socketIDofCallee,
        offer:offer
    })
}

export const handlerOffer = async (data) => {
    console.log("HANDLING WEBRTC OFFER FROM CLIENT");
    connectedUserSocketId = data.comingFrom;
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    wss.sendWebRTCAnswer({
        callerSocketId:data.comingFrom,
        answer:answer
    });
    // console.log("I am accepting the offer and also sending ICE Candidates : ",candidate);
    //     wss.sendWebRTCCandidate({
    //     candidate:candidate,
    //     connectedUserSocketId:connectedUserSocketId
    // })
} 

export const handleAnswer = async (data) => {
    console.log("HANDLING WEBRTC ANSWER FROM CLIENT");
    await peerConnection.setRemoteDescription(data.answer);
    //     wss.sendWebRTCCandidate({
    //     candidate:candidate,
    //     connectedUserSocketId:connectedUserSocketId
    // })
}

export const handleCandidate = async (data) => {
    console.log("HANDLING ICE CANDIDATES FROM CLINET");
    try{
        await peerConnection.addIceCandidate(data.candidate);
        }
        catch(err){
            console.log("error occured when trying to add received ice candidate",err);
        }
};


export const handleMute = (stream) => {
    console.log("Muting audio");
    stream.getTracks().forEach((track)=>{
        if(track.kind == 'audio'){
            track.stop();
            stream.removeTrack(track);
        }
    })
    // peerConnection.removeTrack(audioSender);
}

export const handleUnMute = (stream) => {
    console.log("Handling Unmute");
    // stream.getTracks().forEach((track) => {
    //     if(track.kind == 'audio')
    //         audioSender.replaceTrack(track);
    // });

    navigator.mediaDevices.getUserMedia({audio:true}).then(strm => {
        stream.addTrack(strm.getAudioTracks()[0])
        if(!audioSender){
            audioSender = peerConnection.addTrack(strm.getAudioTracks()[0],stream);
            sendOffer(connectedUserSocketId);
        }else{
            stream.getTracks().forEach((track) => {
                if(track.kind == 'audio')
                    audioSender.replaceTrack(track);
            });
        }
        
    }).catch(err => {
        console.log("error occured when trying to get an access to local stream")
        console.log(err);
    })


}

export const handleVideoOn = async (stream) => {
    console.log("handling video on");
    navigator.mediaDevices.getUserMedia({video:true}).then(strm => {
            console.log("STREAM on handle video : ",strm);
            stream.addTrack(strm.getVideoTracks()[0]);
        if(!videoSender){
            videoSender = peerConnection.addTrack(strm.getVideoTracks()[0],stream);
            sendOffer(connectedUserSocketId);
        }
        else{
            stream.getTracks().forEach((track) => {
            if(track.kind == 'video')
                videoSender.replaceTrack(track);
            });
        }
    }).catch(err => {
        console.log("error occured when trying to get an access to local stream")
        console.log(err);
    })
}

export const handleVideoOff = (stream) => {
    console.log("handling video off");
    stream.getTracks().forEach((track)=>{
        if(track.kind == 'video'){
            track.stop();
            stream.removeTrack(track);
        }
    }) 
    // peerConnection.removeTrack(videoSender);

}

export const printStreamStatus = (stream) => {
    stream.getTracks().forEach((track)=>{
        console.log("track : ",track.kind);
    }) 
}
export const printRemoteStreamStatus = () => {
    peerConnection.getRemoteStreams()[0].getTracks().forEach((track)=>{
        console.log("track : ",track.kind);
    })
}
