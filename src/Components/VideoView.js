import { useEffect ,useRef} from "react";

const VideoView = (props) => {
    const {videoStream} = props;
    const localVideoRef = useRef();
    useEffect(()=>{
        console.log("Video rendered again");
        if(videoStream){
            const localVideo = localVideoRef.current;
            localVideo.srcObject = videoStream;
            localVideo.onloadedmetadata = () => {
                localVideo.play();
            }
        }
    },[videoStream]);
    return (
        <video ref={localVideoRef} autoPlay muted={props.muted} width="400px" height="200px" />
    );
}
export default VideoView;