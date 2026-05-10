import { useEffect } from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useDecibelMeter } from "./src/hooks/useDecibelMeter";

import MeterDisplay from "./src/components/MeterDisplay";
import NoiseStatus from "./src/components/NoiseStatus";
import MeterBar from "./src/components/MeterBar";
import ControlButton from "./src/components/ControlButton";
import StatsPanel from "./src/components/StatsPanel";

export default function App() {
  const { db, minDb, maxDb, avgDb, isRecording, start, stop } =
    useDecibelMeter();

  useEffect(() => {
    start();
  }, []);

  const getColor = () => {
    if (db < 50) return "#00E676";

    if (db < 75) return "#FFD600";

    return "#FF5252";
  };

  const getNoiseLabel = () => {
    if (db < 40) return "Silencioso";

    if (db < 60) return "Moderado";

    if (db < 80) return "Alto";

    return "Perigoso";
  };

  const getWidth = () => {
    return `${Math.min((db / 120) * 100, 100)}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Decibelímetro</Text>

      <MeterDisplay db={db} color={getColor()} />

      <NoiseStatus label={getNoiseLabel()} color={getColor()} />

      <MeterBar width={getWidth()} color={getColor()} />
      <StatsPanel minDb={minDb} avgDb={avgDb} maxDb={maxDb} />

      <ControlButton
        isRecording={isRecording}
        onPress={() => {
          if (isRecording) {
            stop();
          } else {
            start();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1115",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 40,
  },
});
