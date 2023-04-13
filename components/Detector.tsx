import React from 'react';
import { View } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

interface Face {
  // define properties of a face object
  smilingProbability: number;
}

interface DetectorProps {
  onFacesDetected: ({ faces }: { faces: Face[] }) => void;
}

const Detector: React.FC<DetectorProps> = ({ onFacesDetected }) => {
  return (
    <View>
      <Camera
        type={CameraType.front}
        onFacesDetected={onFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
};

export default Detector;
