import { useState, useRef, useEffect } from 'react';

export const useWebRTC = (socket, currentUserId) => {

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStatus, setCallStatus] = useState('idle');
    const [activeCall, setActiveCall] = useState(null);
    const peerConnection = useRef(null);
    const pendingCandidates = useRef([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isRemoteMuted, setIsRemoteMuted] = useState(false);

    const setupMedia = async (audio = true, video = false) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
            // console.log('Local stream tracks:', stream.getTracks().map(t => t.kind));
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Error getting media:', err);
            throw err;
        }
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ]
        });


        pc.onicecandidate = (event) => {
            // console.log('ice event: ', event)
            if (event.candidate && activeCall) {
                // console.log('event.candidate: ', event.candidate)
                // console.log('active call: ', activeCall)
                socket.emit('ice_candidate', {
                    callId: activeCall.id,
                    candidate: event.candidate
                });
            }
        };


         // monitors state connection
        pc.onconnectionstatechange = () => {
            // console.log('Connection state changed:', pc.connectionState);
            if (pc.connectionState === 'disconnected') {
                // console.log('Peer disconnected. Ending call...');
                endCall();
            }
        };

        pc.onsignalingstatechange = () => {
            // console.log('Signaling state changed:', pc.signalingState);
        };

        pc.onicegatheringstatechange = () => {
            // console.log('ICE gathering state changed:', pc.iceGatheringState);
        };

        pc.onicecandidateerror = (event) => {
            console.error('ICE candidate error:', event);
        };


        pc.ontrack = (event) => {
        // console.log('Track received:', event.track.kind);

            //  // Track event handlers
            // event.track.onmute = () => {
            //     // console.log(`${event.track.kind} track muted`);
            // };
            // event.track.onunmute = () => {
            //     // console.log(`${event.track.kind} track unmuted`);
            // };
            // event.track.onended = () => {
            //     // console.log(`${event.track.kind} track ended`);
            // };


                setRemoteStream(prev => {
                // Create new stream if none exists
                if (!prev) {
                    const newStream = new MediaStream();
                    newStream.addTrack(event.track);
                    return newStream;
                }
                
                // Replace track if same kind exists
                const existingTracks = prev.getTracks();
                const sameKindTrack = existingTracks.find(t => t.kind === event.track.kind);
                
                if (sameKindTrack) {
                    prev.removeTrack(sameKindTrack);
                }
                prev.addTrack(event.track);
                
                return prev;
            });

        };

        pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected') {
            // console.log('Peer disconnected. Ending call...');
            endCall();
        }
        };


        return pc
    }


    const initiateCall = async (callData) => {
        try {
            setCallStatus('initiating');
            const stream = await setupMedia(true, callData.type === 'video');
            
            peerConnection.current = createPeerConnection();
            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream);
            });

            const offer = await peerConnection.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            // console.log('Offer SDP:', offer.sdp);
            await peerConnection.current.setLocalDescription(offer);

            // Save call to DB and notify participants
            socket.emit('initiate_call', {
                callId: callData._id,
                offer
            });
            // console.log("INIT CALL ACTIVECALL: ", callData)

            setActiveCall(callData);
            setCallStatus('ringing');
        } catch (err) {
            console.error('Call initiation failed:', err);
            setCallStatus('failed');
        }
    };

    const answerCall = async (call) => {

        try {
            
            setCallStatus('answering');
            const stream = await setupMedia(true, call.type === 'video');
            
            peerConnection.current = createPeerConnection();
            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream);
            });

            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(call.connectionData.offer)
            );

            for (const candidate of pendingCandidates.current) {
                 await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.current = [];

            const answer = await peerConnection.current.createAnswer({
                offerToReceiveAudio: true,  
                offerToReceiveVideo: true 
            });
            // console.log('Answer SDP:', answer.sdp);

             
            await peerConnection.current.setLocalDescription(answer);

            // console.log('ANSWER CALL: ', call)
            socket.emit('call_answer', {
                callId: call._id,
                // callId: call._id,
                answer
            });

            setActiveCall(call);
            setCallStatus('active');
        } catch (err) {
            console.error('Error answering call:', err);
            setCallStatus('failed');
        }
    };

    const endCall = () => {
        if (activeCall) {
            socket.emit('end_call', { callId: activeCall._id });
        }
        cleanup();
    };

    const cleanup = () => {
        // console.log('Cleaning up WebRTC resources');
        setIsMuted(false);
        setIsRemoteMuted(false);
        if (peerConnection.current) {
            // Remove all event listeners to prevent memory leaks
            peerConnection.current.onicecandidate = null;
            peerConnection.current.ontrack = null;
            peerConnection.current.oniceconnectionstatechange = null;
            peerConnection.current.onconnectionstatechange = null;
            peerConnection.current.onsignalingstatechange = null;
            peerConnection.current.onicegatheringstatechange = null;
            peerConnection.current.onicecandidateerror = null;
            
            // Close the connection
            peerConnection.current.close();
            peerConnection.current = null;
        }
        
        if (localStream) {
            localStream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
            });
            setLocalStream(null);
        }
        
        setRemoteStream(null);
        setActiveCall(null);
        setCallStatus('idle');
        };

     const toggleMute = () => {
        if (!localStream || !activeCall) return;
        
        const newMuteState = !isMuted;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !newMuteState;
        });
        setIsMuted(newMuteState);
        
        socket.emit('mute_state', {
        callId: activeCall._id,
        isMuted: newMuteState,
        senderId: currentUserId
    });

    };


    // Handle socket events
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (call) => {
            // console.log("INCOMING: ", call)
            const normalizedCall = {
                ...call,
                _id: call._id || call.id,
                id: call._id || call.id   
            };
            setActiveCall(normalizedCall);
            setCallStatus('incoming');
        };

        const handleCallAccepted = async({ answer }) => {
            if (peerConnection.current) {
                peerConnection.current.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
                for (const candidate of pendingCandidates.current) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                pendingCandidates.current = [];

                setCallStatus('active');
                // console.log('SACTIVE: ', activeCall)
            }
        };

       const handleNewICECandidate = async ({ candidate }) => {
            if (!candidate) return;
            // console.log('New ICE candidate received:', candidate);
            
            try {
                if (peerConnection.current?.remoteDescription) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                // console.log('Successfully added ICE candidate');
                } else {
                pendingCandidates.current.push(candidate);
                // console.log('Queued ICE candidate (no remote description yet)');
                }
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
            };

        const handleCallEnded = () => {
            cleanup();
        };

        const handleRemoteMute = ({ isMuted,senderId }) => {
        //      console.log('Received remote mute:', 
        //     `Sender: ${senderId}`,
        //     `State: ${isMuted}`,
        //     `CurrentUser: ${currentUserId}`
        // );
            if (senderId !== currentUserId) {
            setIsRemoteMuted(isMuted);
            // console.log(`Remote participant ${senderId} ${isMuted ? 'muted' : 'unmuted'}`);

        }
        };

        const handleMuteState = ({ isMuted }) => {
            if (activeCall) {
            socket.emit('mute_state', {
                callId: activeCall._id,
                isMuted,
                senderId: currentUserId
            });
        }
         };

        socket.on('incoming_call', handleIncomingCall);
        socket.on('call_accepted', handleCallAccepted);
        socket.on('new_ice_candidate', handleNewICECandidate);
        socket.on('call_ended', handleCallEnded);
        socket.on('remote_mute_state', handleRemoteMute);
        socket.on('mute_state', handleMuteState);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
            socket.off('call_accepted', handleCallAccepted);
            socket.off('new_ice_candidate', handleNewICECandidate);
            socket.off('call_ended', handleCallEnded);
            socket.off('remote_mute_state', handleRemoteMute);
            socket.off('mute_state', handleMuteState);
        };
    }, [socket, activeCall, currentUserId]);


    useEffect(() => {
        // console.log('Active call updated:', activeCall);
    }, [activeCall]);

        return {
            localStream,
            remoteStream,
            callStatus,
            activeCall,
            initiateCall,
            answerCall,
            rejectCall: endCall,
            endCall,
            isMuted,
            isRemoteMuted,
            toggleMute
        };

};