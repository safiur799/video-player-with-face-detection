import React, { useRef } from "react";
import * as faceapi from "face-api.js";

const FaceDetectionComponent = () => {
  const videoRef = useRef(null);

  const handleVideoUpload = async (event) => {
    const videoFile = event.target.files[0];

    if (videoFile && videoRef.current) {
      const video = videoRef.current;
      video.src = URL.createObjectURL(videoFile);

      await faceDetection(video);
    }
  };

  const faceDetection = async (videoElement) => {
    await faceapi.nets.tinyFaceDetector.loadFromUri(
      "/models/tiny_face_detector_model"
    );
    await faceapi.nets.faceLandmark68Net.loadFromUri(
      "/models/face_landmark_68_model"
    );
    await faceapi.nets.faceRecognitionNet.loadFromUri(
      "/models/face_recognition_model"
    );
    await faceapi.nets.faceExpressionNet.loadFromUri(
      "/models/face_expression_model"
    );

    videoElement.addEventListener("play", async () => {
      const canvas = faceapi.createCanvasFromMedia(videoElement);
      document.body.appendChild(canvas);
      const displaySize = {
        width: videoElement.width,
        height: videoElement.height,
      };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }, 100);
    });
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      <video ref={videoRef} width="640" height="480" controls />
    </div>
  );
};

export default FaceDetectionComponent;
