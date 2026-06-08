import os
import sys

# Глубокий поиск и динамическое подключение всех зависимостей NVIDIA (cublas, cudnn, nvrtc)
for path in sys.path:
    nvidia_dir = os.path.join(path, "nvidia")
    if os.path.exists(nvidia_dir):
        for root, dirs, files in os.walk(nvidia_dir):
            if any(f.endswith(".dll") for f in files):
                if hasattr(os, 'add_dll_directory'):
                    try:
                        os.add_dll_directory(root)
                    except Exception:
                        pass
                os.environ["PATH"] = root + os.pathsep + os.environ["PATH"]

import io
import queue
import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel
from pynput import keyboard
import time

# --- НАСТРОЙКИ ---
HOTKEY = keyboard.Key.f4 
MODEL_SIZE = "large-v3-turbo"  
DEVICE = "cuda"  
COMPUTE_TYPE = "float16" 
SAMPLE_RATE = 16000  
# -----------------

print("Загрузка модели Whisper... Пожалуйста, подождите.")
try:
    model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
    print("Отлично! Видеокарта (CUDA) полностью готова к работе.")
except Exception as e:
    print(f"\n[Не удалось запустить на GPU]: {e}")
    print("Переключаемся на процессор (CPU)...")
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

print("\nМодель готова! Нажми и держи F12 для записи.")

is_recording = False
audio_queue = queue.Queue()
stream = None

def audio_callback(indata, frames, time, status):
    if is_recording:
        audio_queue.put(indata.copy())

def start_recording():
    global is_recording, stream, audio_queue
    is_recording = True
    audio_queue = queue.Queue()
    stream = sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype='float32', callback=audio_callback)
    stream.start()
    print("\n[Запись...] Говори", end="", flush=True)

def stop_recording():
    global is_recording, stream
    is_recording = False
    if stream:
        stream.stop()
        stream.close()
    print(" -> [Обработка нейросетью]")
    
    audio_data = []
    while not audio_queue.empty():
        audio_data.append(audio_queue.get())
    
    if audio_data:
        audio_np = np.concatenate(audio_data, axis=0)
        process_audio(audio_np)

def process_audio(audio_np):
    start_time = time.time()
    audio_segment = audio_np.flatten()
    
    segments, info = model.transcribe(audio_segment, beam_size=1, condition_on_previous_text=False)
    text = "".join([segment.text for segment in segments]).strip()
    
    if text:
        print(f"[{info.language.upper()} | {time.time() - start_time:.2f}s]: {text}")
        insert_text(text)
    else:
        print("Речь не распознана.")

def insert_text(text):
    kb = keyboard.Controller()
    kb.type(text + " ")

def on_press(key):
    global is_recording
    if key == HOTKEY and not is_recording:
        start_recording()

def on_release(key):
    global is_recording
    if key == HOTKEY and is_recording:
        stop_recording()

with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()