/**
 * Reproductor Musical de Wonderland
 * Soporta:
 *  1. Archivo local MP3 (assets/audio/alices-theme.mp3 o musica.mp3) [PRIORIDAD MÁXIMA]
 *  2. Pista de YouTube oficial (eEFDN451_Xc - Alice in Wonderland Theme)
 *  3. Sintetizador orquestal Web Audio API (fallback sin conexión)
 */

class WonderlandAudioPlayer {
  constructor() {
    this.audioElement = document.getElementById('bg-music');
    this.floatingBtn = document.getElementById('floating-audio');
    this.audioLabel = document.querySelector('.audio-label');
    this.isPlaying = false;
    this.hasLocalAudio = false;
    this.ytPlayer = null;
    this.isYtReady = false;
    this.shouldAutoplayWhenReady = false;
    this.audioCtx = null;
    this.isSynthRunning = false;
    this.synthLoopTimeout = null;

    this.checkLocalAudio();
    this.init();
  }

  checkLocalAudio() {
    if (this.audioElement) {
      // Verificar si el archivo MP3 local se carga correctamente
      this.audioElement.addEventListener('canplaythrough', () => {
        this.hasLocalAudio = true;
        // Si el usuario ya había interactuado, reproducir el MP3
        if (this.isPlaying) {
          if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            this.ytPlayer.pauseVideo();
          }
          this.audioElement.play().catch(() => {});
        }
      });

      this.audioElement.addEventListener('error', () => {
        this.hasLocalAudio = false;
      });

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        if (this.floatingBtn) this.floatingBtn.classList.remove('paused');
        if (this.audioLabel) this.audioLabel.textContent = 'Música';
      });

      this.audioElement.addEventListener('pause', () => {
        if (!this.ytPlayer || this.ytPlayer.getPlayerState() !== 1) {
          if (this.floatingBtn) this.floatingBtn.classList.add('paused');
          if (this.audioLabel) this.audioLabel.textContent = 'Pausado';
        }
      });
    }
  }

  init() {
    if (this.floatingBtn) {
      this.floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // Desbloqueo universal en la primera interacción del usuario
    const unlockEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    const unlockHandler = () => {
      if (!this.isPlaying) {
        this.play();
      }
      unlockEvents.forEach(evt => window.removeEventListener(evt, unlockHandler));
    };

    unlockEvents.forEach(evt => window.addEventListener(evt, unlockHandler, { once: true }));

    // Intentar reproducción automática al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
      this.play().catch(() => {});
    });
  }

  onYouTubeReady(player) {
    this.ytPlayer = player;
    this.isYtReady = true;
    
    // Solo reproducir YouTube si no hay un archivo MP3 local activo
    if (!this.hasLocalAudio && (this.shouldAutoplayWhenReady || this.isPlaying)) {
      try {
        this.ytPlayer.playVideo();
      } catch (e) {
        console.log('Error al iniciar YouTube video:', e);
      }
    }
  }

  onYouTubeStateChange(state) {
    // 1: PLAYING, 2: PAUSED, 0: ENDED
    if (this.hasLocalAudio) return; // Si hay MP3 local, ignorar YouTube

    if (state === 1) {
      this.isPlaying = true;
      if (this.floatingBtn) this.floatingBtn.classList.remove('paused');
      if (this.audioLabel) this.audioLabel.textContent = 'Música';
    } else if (state === 2) {
      this.isPlaying = false;
      if (this.floatingBtn) this.floatingBtn.classList.add('paused');
      if (this.audioLabel) this.audioLabel.textContent = 'Pausado';
    } else if (state === 0) {
      // Repetir automáticamente (loop)
      if (this.ytPlayer) {
        this.ytPlayer.seekTo(0);
        this.ytPlayer.playVideo();
      }
    }
  }

  async play() {
    this.isPlaying = true;
    this.shouldAutoplayWhenReady = true;

    if (this.floatingBtn) {
      this.floatingBtn.classList.remove('paused');
    }
    if (this.audioLabel) {
      this.audioLabel.textContent = 'Música';
    }

    // 1. PRIORIDAD MÁXIMA: Archivo MP3 local
    if (this.audioElement) {
      try {
        await this.audioElement.play();
        this.hasLocalAudio = true;
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
          this.ytPlayer.pauseVideo();
        }
        return;
      } catch (err) {
        // MP3 local no encontrado o bloqueado, continuar a YouTube
      }
    }

    // 2. SEGUNDA PRIORIDAD: YouTube Player (eEFDN451_Xc)
    if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.playVideo();
        return;
      } catch (err) {
        console.log('Esperando interacción para YouTube:', err);
      }
    }

    // 3. TERCERA PRIORIDAD: Sintetizador orquestal Web Audio API
    if (!this.isYtReady && !this.hasLocalAudio) {
      await this.initWebAudioSynth();
    }
  }

  pause() {
    this.isPlaying = false;
    this.shouldAutoplayWhenReady = false;

    if (this.floatingBtn) {
      this.floatingBtn.classList.add('paused');
    }
    if (this.audioLabel) {
      this.audioLabel.textContent = 'Pausado';
    }

    if (this.audioElement) {
      this.audioElement.pause();
    }

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch (e) {}
    }

    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
    if (this.synthLoopTimeout) {
      clearTimeout(this.synthLoopTimeout);
      this.isSynthRunning = false;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // --- Fallback Web Audio API Synthesizer ---
  async initWebAudioSynth() {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.audioCtx = new AudioContext();
    this.startSynthMelody();
  }

  startSynthMelody() {
    if (this.isSynthRunning || !this.audioCtx) return;
    this.isSynthRunning = true;

    const notes = [
      { f: 523.25, d: 0.6 },
      { f: 587.33, d: 0.6 },
      { f: 622.25, d: 1.0 },
      { f: 587.33, d: 0.6 },
      { f: 523.25, d: 0.8 },
      { f: 466.16, d: 0.6 },
      { f: 392.00, d: 1.2 },
      { f: 523.25, d: 0.6 },
      { f: 622.25, d: 0.6 },
      { f: 783.99, d: 1.2 },
      { f: 698.46, d: 0.8 },
      { f: 622.25, d: 0.8 },
      { f: 587.33, d: 1.4 },
      { f: 523.25, d: 1.6 }
    ];

    let noteIdx = 0;

    const playNextNote = () => {
      if (this.hasLocalAudio || (this.isYtReady && this.ytPlayer && this.ytPlayer.getPlayerState && this.ytPlayer.getPlayerState() === 1)) {
        this.isSynthRunning = false;
        return;
      }

      if (!this.isPlaying || !this.audioCtx) return;

      const n = notes[noteIdx];
      this.playChimeNote(n.f, n.d);
      
      if (noteIdx === 0 || noteIdx === 7) {
        this.playPadChord([261.63, 311.13, 392.00], 3.5);
      } else if (noteIdx === 4) {
        this.playPadChord([233.08, 293.66, 349.23], 3.0);
      }

      noteIdx = (noteIdx + 1) % notes.length;
      this.synthLoopTimeout = setTimeout(playNextNote, n.d * 1000 * 0.95);
    };

    playNextNote();
  }

  playChimeNote(freq, duration) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    const now = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.8);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.9);
  }

  playPadChord(freqs, duration) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    const now = this.audioCtx.currentTime;

    freqs.forEach(freq => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.2);
    });
  }
}

window.wonderlandAudio = new WonderlandAudioPlayer();

// Callback oficial de la API de YouTube IFrame
window.onYouTubeIframeAPIReady = function() {
  if (typeof YT !== 'undefined' && YT.Player) {
    new YT.Player('youtube-audio-player', {
      height: '1',
      width: '1',
      videoId: 'eEFDN451_Xc',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        playlist: 'eEFDN451_Xc',
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          if (window.wonderlandAudio) {
            window.wonderlandAudio.onYouTubeReady(event.target);
          }
        },
        onStateChange: (event) => {
          if (window.wonderlandAudio) {
            window.wonderlandAudio.onYouTubeStateChange(event.data);
          }
        }
      }
    });
  }
};
