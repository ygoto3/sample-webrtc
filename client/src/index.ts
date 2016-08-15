import "./presets";
import { VideoChat } from "./utils/video-chat";

const styles = require("./index.css");

const videoChat = new VideoChat("local-video", "remote-video");

const startButton = document.getElementById("start");
startButton.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault();
  videoChat.start();
});
