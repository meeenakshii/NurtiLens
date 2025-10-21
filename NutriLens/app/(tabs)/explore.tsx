// ...rest of your imports
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

export default function ExploreScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const animateFlash = () => {
    flashAnim.setValue(0.8);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Text style={styles.text}>We need your permission to access camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );

  const takePhoto = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        animateFlash();
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedPhoto(photo.uri);
        analyzePhoto(photo.uri);
      } catch (err) {
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const analyzePhoto = async (uri: string) => {
    setLoading(true);
    try {
      // Resize and compress image
      await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      setTimeout(() => {
        setResult("🥔 Detected: Lay’s Potato Chips\n⚠️ High in Sodium and Trans Fats");
        setLoading(false);
      }, 1500);
    } catch (e) {
      Alert.alert("Error", "Unable to analyze image");
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        <>
          <CameraView
            style={styles.camera}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          />

          {/* Camera overlay frame */}
          <View style={styles.overlayFrame} />

          {/* Flash effect */}
          <Animated.View
            pointerEvents="none"
            style={[styles.flashOverlay, { opacity: flashAnim }]}
          />

          {/* Preview Info Panel */}
          <View style={styles.previewPanel}>
            <Text style={styles.previewText}>📸 Center the object in frame</Text>
            <Text style={styles.previewText}>✋ Hold steady for best results</Text>
          </View>
        </>
      ) : (
        <Image source={{ uri: capturedPhoto }} style={styles.preview} />
      )}

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Analyzing...</Text>
        </View>
      )}

      {result && !loading && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{result}</Text>
          <TouchableOpacity onPress={retakePhoto} style={styles.retakeBtn}>
            <Text style={styles.retakeText}>🔄 Retake</Text>
          </TouchableOpacity>
        </View>
      )}

      {!capturedPhoto && (
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <Text style={styles.captureText}>📸</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 50,
    elevation: 5,
  },
  captureText: { fontSize: 24 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0009",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#fff", marginTop: 10, fontSize: 16 },
  resultBox: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#ffffffee",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: "90%",
  },
  resultText: { fontWeight: "bold", fontSize: 16, textAlign: "center" },
  retakeBtn: {
    marginTop: 10,
    backgroundColor: "#2b9348",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retakeText: { color: "#fff", fontWeight: "bold" },
  text: { color: "#333", textAlign: "center", marginBottom: 20 },
  button: {
    backgroundColor: "#2b9348",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlayFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "#fff6",
    margin: 20,
    borderRadius: 12,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },
  previewPanel: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#0007",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  previewText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

