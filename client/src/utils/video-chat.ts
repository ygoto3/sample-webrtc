interface IVideo {
  video: HTMLVideoElement;
  stream: any;
}

export class VideoChat {

  local: IVideo = {
    video: null,
    stream: null
  };

  remote: IVideo = {
    video: null,
    stream: null
  };

  serverConnection: WebSocket;

  peerConnection: RTCPeerConnection;

  peerConnectionConfig = {
    iceServers: [
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  constructor(local: string, remote: string) {

    this.local.video = document.getElementById(local) as HTMLVideoElement;
    this.remote.video = document.getElementById(remote) as HTMLVideoElement;

    this.serverConnection = new WebSocket("/* @echo WS_URL */");
    this.serverConnection.onmessage = this.onGetMessageFromServer.bind(this);

    this.configure();

  }

  configure() {

    const constraints = { video: true, audio: true };
    navigator.getUserMedia(
      constraints,
      this.onGetUserMediaSuccess.bind(this),
      this.onGetUserMediaError
    );

  }

  start(toOffer = true) {

    this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
    this.peerConnection.onicecandidate = this.onGetIceCandidate.bind(this);
    this.peerConnection.onaddstream = this.onGetRemoteStream.bind(this);
    this.peerConnection.addStream(this.local.stream);

    if (toOffer) {
      this.peerConnection.createOffer(
        this.onGetDescription.bind(this),
        this.onCreateOfferError
      );
    }

  }

  onGetUserMediaSuccess(stream: MediaStream) {

    this.local.stream = stream;
    this.local.video.src = URL.createObjectURL(stream);

  }

  onGetUserMediaError(error: MediaStreamError) {

    console.log(error);

  }

  onGetIceCandidate(event: RTCIceCandidateEvent) {

    if (event.candidate === null) return;

    this.serverConnection.send(
      JSON.stringify({ ice: event.candidate })
    );

  }

  onGetRemoteStream(event: RTCMediaStreamEvent) {

    this.remote.video.src = URL.createObjectURL(event.stream);

  }

  onGetDescription(description: RTCSessionDescription) {

    this.peerConnection.setLocalDescription(
      description,
      () => {
        this.serverConnection.send(
          JSON.stringify({ sdp: description })
        )
      },
      (error: DOMError) => console.log(error)
    );

  }

  onCreateOfferError(error: DOMError) {

    console.log(error);

  }

  onGetMessageFromServer(message: any) {

    if (!this.peerConnection) this.start(false);

    const signal = JSON.parse(message.data);

    if (signal.sdp) {

      this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal.sdp),
        () => {
          this.peerConnection.createAnswer(
            this.onGetDescription.bind(this),
            this.onCreateOfferError
          );
        }
      );

    } else if (signal.ice) {

      this.peerConnection.addIceCandidate(
        new RTCIceCandidate(signal.ice)
      );

    }

    console.log(signal);

  }

}
