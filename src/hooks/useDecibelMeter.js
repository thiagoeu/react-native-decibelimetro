import { useEffect, useRef, useState } from "react";

import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";

export function useDecibelMeter() {
  const [db, setDb] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [minDb, setMinDb] = useState(null);
  const [maxDb, setMaxDb] = useState(null);
  const [avgDb, setAvgDb] = useState(null);
  const intervalRef = useRef(null);
  const totalRef = useRef(0);
  const countRef = useRef(0);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const start = async () => {
    try {
      // Evita múltiplas gravações
      if (isRecording) return;

      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        console.log("Permissão negada");
        return;
      }

      await recorder.prepareToRecordAsync();

      recorder.record();

      setIsRecording(true);

      startMetering();
    } catch (error) {
      console.log("START ERROR", error);
    }
  };

  const startMetering = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const status = await recorder.getStatus();

        if (status.metering !== undefined) {
          // Conversão aproximada dBFS -> dB SPL
          const dbSPL = Math.max(35, Math.min(100, 90 + status.metering));
          // Suavização
          setDb((prev) => {
            const smoothValue = prev * 0.7 + dbSPL * 0.3;

            // mínimo noise floor filtering
            setMinDb((prevMin) => {
              // ignora leituras absurdas
              if (smoothValue < 32) {
                return prevMin;
              }

              if (prevMin === null) {
                return smoothValue;
              }

              return Math.min(prevMin, smoothValue);
            });

            // máximo
            setMaxDb((prevMax) => {
              if (prevMax === null) {
                return smoothValue;
              }

              return Math.max(prevMax, smoothValue);
            });

            // média
            totalRef.current += smoothValue;

            countRef.current += 1;

            setAvgDb(totalRef.current / countRef.current);

            return smoothValue;
          });
        }
      } catch (error) {
        console.log("METER ERROR", error);
      }
    }, 150);
  };

  const stop = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      await recorder.stop();

      setIsRecording(false);

      setDb(0);
      setMinDb(null);
      setMaxDb(null);
      setAvgDb(null);
      totalRef.current = 0;
      countRef.current = 0;
    } catch (error) {
      console.log("STOP ERROR", error);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    db,
    isRecording,
    minDb,
    maxDb,
    avgDb,
    start,
    stop,
  };
}
