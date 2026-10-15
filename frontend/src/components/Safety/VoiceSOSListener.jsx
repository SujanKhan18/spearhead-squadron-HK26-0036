import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, Radio, Activity, VolumeX, ShieldCheck, Zap } from 'lucide-react';

const TRIGGER_PHRASES = [
  'help me now',
  'help me',
  'help',
  'emergency',
  'save me',
  'i am not safe',
  'not safe',
  'somebody help me',
  'call police',
  'danger',
  'bachao',
  'bachao bachao',
  'madad karo',
  'madad',
  'police bulao'
];

export default function VoiceSOSListener({ onTriggerVoiceSOS }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastMatchedPhrase, setLastMatchedPhrase] = useState('');
  const [detectedPhrase, setDetectedPhrase] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Scream / High-Decibel offline detection
  const [screamDetection, setScreamDetection] = useState(true);
  const [screamThreshold, setScreamThreshold] = useState(75);
  const [speechCloudOffline, setSpeechCloudOffline] = useState(false);

  // Trigger lock & countdown window
  const [isTriggerLocked, setIsTriggerLocked] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Speech & Mic Permission Status: 'idle' | 'listening' | 'granted' | 'denied' | 'unsupported'
  const [micState, setMicState] = useState('idle');

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const isListeningRef = useRef(false);
  const rafIdRef = useRef(null);
  const screamCounterRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  // Check browser SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicState('unsupported');
    }
  }, []);

  // Handle Phrase Detection Match
  const handlePhraseMatched = useCallback((phrase) => {
    if (isTriggerLocked) return;
    setIsTriggerLocked(true);
    setDetectedPhrase(phrase);
    setLastMatchedPhrase(phrase);
    setCountdown(3);
  }, [isTriggerLocked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Start / Stop Listening Process
  const toggleListening = async () => {
    if (isListening) {
      // STOP LISTENING
      isListeningRef.current = false;
      setIsListening(false);
      setMicState('idle');
      setAudioLevel(0);
      screamCounterRef.current = 0;

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
        audioContextRef.current = null;
      }
    } else {
      // START LISTENING
      setTranscript('');
      setSpeechCloudOffline(false);
      screamCounterRef.current = 0;

      try {
        // 1. Request Mic & Audio Context for Local Offline Decibel Meter & Scream Detection
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true
            }
          });
          micStreamRef.current = stream;

          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.4;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkVolume = () => {
              if (!micStreamRef.current || !isListeningRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
              const avg = sum / bufferLength;
              const level = Math.min(100, Math.round((avg / 64) * 100));
              setAudioLevel(level);

              // Offline Scream / High Decibel Spike Detection
              if (screamDetection && level >= screamThreshold) {
                screamCounterRef.current += 1;
                if (screamCounterRef.current >= 4) { // Sustained loud scream / distress sound
                  screamCounterRef.current = 0;
                  handlePhraseMatched(`Distress Scream / High Decibel Spike (${level}%)`);
                }
              } else {
                screamCounterRef.current = Math.max(0, screamCounterRef.current - 1);
              }

              rafIdRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        }

        // 2. Initialize Speech Recognition (with resilient cloud error recovery)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN'; // Optimized for Indian English & Hindi phonetics

          recognition.onresult = (event) => {
            let currentText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript.toLowerCase() + ' ';
            }
            setTranscript(currentText.trim());

            // Pattern Match against trigger phrases
            const cleanText = currentText.toLowerCase().trim();
            for (const phrase of TRIGGER_PHRASES) {
              if (cleanText.includes(phrase)) {
                handlePhraseMatched(phrase);
                break;
              }
            }
          };

          recognition.onerror = (err) => {
            console.warn('Speech recognition status:', err.error);
            if (err.error === 'not-allowed') {
              setMicState('denied');
              setIsListening(false);
            } else if (err.error === 'network') {
              // Google Speech cloud endpoint unreachable on localhost/proxy
              // Mark offline mode, but local scream detection stays 100% active!
              setSpeechCloudOffline(true);
            }
          };

          recognition.onend = () => {
            // Auto-restart with safe debounce if still listening and not permanently denied
            if (isListeningRef.current && micState !== 'denied') {
              retryTimeoutRef.current = setTimeout(() => {
                try {
                  if (isListeningRef.current) {
                    recognition.start();
                  }
                } catch (e) {
                  // Ignore already started errors
                }
              }, 1200);
            }
          };

          try {
            recognition.start();
            recognitionRef.current = recognition;
          } catch (e) {
            console.warn('Initial recognition start warning:', e);
          }
        }

        isListeningRef.current = true;
        setIsListening(true);
        setMicState('listening');
      } catch (err) {
        console.warn('Mic permission error:', err);
        setMicState('denied');
        setIsListening(false);
      }
    }
  };

  // 3-Second Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (isTriggerLocked && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isTriggerLocked && countdown === 0) {
      // Countdown finished -> Dispatch Voice SOS!
      if (onTriggerVoiceSOS) {
        onTriggerVoiceSOS({
          triggerSource: 'voice_trigger',
          threatDetails: { triggerPhrase: detectedPhrase || 'emergency' }
        });
      }
      setIsTriggerLocked(false);
      setDetectedPhrase(null);
    }
    return () => clearInterval(timer);
  }, [isTriggerLocked, countdown, detectedPhrase, onTriggerVoiceSOS]);

  const handleCancelCountdown = () => {
    setIsTriggerLocked(false);
    setDetectedPhrase(null);
    setCountdown(3);
    setTranscript('');
    screamCounterRef.current = 0;
  };

  const simulatePhrase = (phrase) => {
    setTranscript(phrase);
    handlePhraseMatched(phrase);
  };

  return (
    <div className="premium-panel p-6 rounded-3xl border border-[#E2E8F0] bg-white shadow-sm space-y-6">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Volume2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline text-xl font-semibold text-[#0F172A]">Voice &amp; Scream SOS Listener</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                Dual-Layer Audio AI
              </span>
              {isListening && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  speechCloudOffline 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {speechCloudOffline ? '⚡ Offline Scream Sensor Active' : '🟢 Cloud Speech + Scream Active'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Listens for distress keywords ("Help me", "Emergency", "Bachao") or loud panic screams (&gt;{screamThreshold}% volume).
            </p>
          </div>
        </div>

        <button
          onClick={toggleListening}
          className={`px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
            isListening
              ? 'bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/40 hover:bg-[#DC2626]/25 animate-pulse'
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="h-4 w-4 text-[#DC2626] animate-bounce" /> ● Voice Listener Active
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4 text-white" /> Enable Voice Listener
            </>
          )}
        </button>
      </div>

      {/* Mic Status & Warnings */}
      {micState === 'denied' && (
        <div className="p-3.5 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0" />
          Microphone permission is blocked in browser settings. Please allow mic access or use the 1-tap simulation buttons below.
        </div>
      )}

      {speechCloudOffline && isListening && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Google Speech Cloud is offline on localhost, but <strong>100% Offline Local Scream &amp; Decibel Spike Detection is RUNNING</strong>. Shout or test below!
            </span>
          </div>
        </div>
      )}

      {/* Audio Visualizer & Speech Feed Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Left: Active Phrases & Audio Level */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#2563EB]" /> Local Decibel Meter (Offline)
            </span>
            <span className={`font-mono text-xs font-bold ${audioLevel >= screamThreshold ? 'text-[#DC2626]' : 'text-[#2563EB]'}`}>
              {audioLevel}% {audioLevel >= screamThreshold ? '🚨 SPIKE' : ''}
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-[#E2E8F0] overflow-hidden border border-[#CBD5E1]">
            <div
              className={`h-full transition-all duration-100 ${
                audioLevel >= screamThreshold ? 'bg-[#DC2626]' : 'bg-[#2563EB]'
              }`}
              style={{ width: `${audioLevel}%` }}
            />
          </div>

          {/* Scream detection threshold control */}
          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#0F172A] font-medium">
              <input
                type="checkbox"
                checked={screamDetection}
                onChange={(e) => setScreamDetection(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Scream &amp; Panic Spike Trigger ({screamThreshold}%)</span>
            </label>
            <input
              type="range"
              min="50"
              max="95"
              value={screamThreshold}
              onChange={(e) => setScreamThreshold(Number(e.target.value))}
              className="w-24 accent-[#2563EB] cursor-pointer"
              title={`Trigger threshold: ${screamThreshold}%`}
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">
              Recognized Trigger Phrases (Click to Test):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TRIGGER_PHRASES.map((phrase) => (
                <span
                  key={phrase}
                  onClick={() => simulatePhrase(phrase)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-[#E2E8F0] text-[11px] font-mono text-[#0F172A] hover:border-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  "{phrase}"
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Speech Recognizer Feed */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Live Transcribed Speech
              </span>
              {isListening && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#DC2626] uppercase animate-pulse">
                  <Radio className="h-3 w-3" /> Listening
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] min-h-[64px] flex items-center">
              <p className="text-xs font-mono text-[#0F172A] italic">
                {transcript
                  ? `"${transcript}"`
                  : isListening
                  ? speechCloudOffline
                    ? 'Listening for screams / loud panic sounds locally...'
                    : 'Listening for phrases like "help me", "bachao", "emergency"...'
                  : 'Voice listener idle. Click "Enable Voice Listener" above.'}
              </p>
            </div>
          </div>

          {/* Quick 1-Tap Simulation Triggers */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
              1-Tap Instant Test Triggers:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => simulatePhrase('help me now')}
                className="btn-secondary text-[11px] py-1.5 px-3 border-[#E2E8F0] hover:border-[#2563EB] cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-[#2563EB]" /> "Help me now"
              </button>
              <button
                type="button"
                onClick={() => simulatePhrase('bachao bachao')}
                className="btn-secondary text-[11px] py-1.5 px-3 border-[#E2E8F0] hover:border-[#DC2626] cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-[#DC2626]" /> "Bachao Bachao"
              </button>
              <button
                type="button"
                onClick={() => simulatePhrase('Distress Scream Detected (88% dB)')}
                className="btn-secondary text-[11px] py-1.5 px-3 border-[#E2E8F0] hover:border-amber-600 cursor-pointer"
              >
                <Zap className="h-3 w-3 text-amber-600" /> Loud Scream (88dB)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Second Cancel Countdown Overlay */}
      {isTriggerLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl border border-[#DC2626]/40 bg-white p-8 text-center shadow-2xl space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#DC2626] text-white shadow-xl animate-pulse">
              <ShieldAlert className="h-10 w-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30 text-[10px] font-bold uppercase tracking-widest">
                Trigger Detected: "{detectedPhrase}"
              </span>
              <h3 className="font-headline text-3xl font-extrabold text-[#0F172A] mt-3">
                DISPATCHING SOS
              </h3>
              <p className="text-xs text-[#64748B] mt-2">
                Emergency alert will automatically notify guardians and local command centers in:
              </p>
            </div>

            <div className="text-6xl font-mono font-extrabold text-[#DC2626] animate-bounce">
              {countdown}
            </div>

            <button
              type="button"
              onClick={handleCancelCountdown}
              className="w-full py-4 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0F172A] font-bold text-base border border-[#BFDBFE] shadow-md transition-all cursor-pointer"
            >
              CANCEL ALERT (FALSE TRIGGER)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
