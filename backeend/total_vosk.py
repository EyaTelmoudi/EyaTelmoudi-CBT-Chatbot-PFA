import sys
import os
import json
import pyaudio
import vosk
import time

# Chargement du modèle Vosk
model_path = "vosk-model-fr-0.22"

if not os.path.exists(model_path):
    print(json.dumps({"error": f"❌ Modèle introuvable : {model_path}"}))
    sys.exit(1)

print("status:loading_model")
sys.stdout.flush()

model = vosk.Model(model_path)

print("status:ready")
sys.stdout.flush()

# Initialisation micro
samplerate = 16000
buffer_size = 2048
rec = vosk.KaldiRecognizer(model, samplerate)

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=samplerate, input=True, frames_per_buffer=buffer_size)
stream.start_stream()

transcription = ""
start_time = time.time()
min_listen_time = 8     # écouter au moins 8 secondes
max_silence_time = 4    # arrêt si 4 secondes de silence
last_voice_time = time.time()

try:
    while True:
        data = stream.read(buffer_size, exception_on_overflow=False)
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            if result.get("text"):
                transcription += result["text"] + " "
                last_voice_time = time.time()
        else:
            # Pour détecter si la personne continue à parler (sans attendre la fin de phrase)
            partial = json.loads(rec.PartialResult())
            if partial.get("partial"):
                last_voice_time = time.time()

        # Conditions d'arrêt :
        elapsed_time = time.time() - start_time
        silence_time = time.time() - last_voice_time

        if elapsed_time > min_listen_time and silence_time > max_silence_time:
            break

    # Résultat final
    final_result = json.loads(rec.FinalResult())
    if final_result.get("text"):
        transcription += final_result["text"]

    print(json.dumps({"text": transcription.strip()}))
    sys.stdout.flush()

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.stdout.flush()    
    
finally:
    stream.stop_stream()
    stream.close()
    p.terminate()