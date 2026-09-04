// Speech and Audio synthesis helper

export const isSpeechRecognitionSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export const isSpeechSynthesisSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

// Audio chime using Web Audio API for turn indication
export function playTurnChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2 (slightly higher for upbeat alert)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.09, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.debug("Audio chime blocked or unavailable:", e);
  }
}

// Text-to-speech
export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported) return null;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    // Remove markdown symbols for natural vocalization
    const cleanedText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/#{1,6}\s/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) =>
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")) &&
        v.lang.startsWith("en")
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      playTurnChime();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    console.warn("Failed to speak text:", e);
    onEnd?.();
    return null;
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.cancel();
  }
}

// Speech recognition
export interface RecognitionHandler {
  recognition: any;
  stop: () => void;
}

export function startSpeechRecognition(
  onPartial: (transcript: string) => void,
  onFinal: (transcript: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): RecognitionHandler | null {
  if (!isSpeechRecognitionSupported) {
    onError("Speech recognition is not supported in this browser. Please use text mode or Chrome.");
    return null;
  }

  try {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onPartial(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        onError("Microphone permission denied. Please grant permission in browser settings.");
      } else if (event.error === "no-speech") {
        // Normal timeout
      } else {
        onError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      onFinal(finalTranscript.trim());
      onEnd();
    };

    recognition.start();

    return {
      recognition,
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch (err: any) {
    onError(err.message || "Failed to initialize microphone.");
    return null;
  }
}
