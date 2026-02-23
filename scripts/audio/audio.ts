export type AudioController = {
  unlock: () => void
  playChop: () => void
  playConvert: () => void
  playWin: () => void
  playLose: () => void
  pauseTheme: () => void
  tryPlayTheme: () => void
}

type CreateAudioControllerOptions = {
  shouldPlayTheme: () => boolean
}

function safePlay(audio: HTMLAudioElement): void {
  void audio.play().catch(() => {})
}

function restartAndPlay(audio: HTMLAudioElement): void {
  audio.currentTime = 0
  safePlay(audio)
}

export function createAudioController(options: CreateAudioControllerOptions): AudioController {
  const { shouldPlayTheme } = options

  const chopSound = new Audio('/sounds/tree-cutting-sound.wav')
  chopSound.volume = 0.4

  const convertSound = new Audio('/sounds/convert-sound.mp3')
  convertSound.volume = 0.3

  const winSound = new Audio('/sounds/game-win.wav')
  const loseSound = new Audio('/sounds/game-lost.wav')

  const themeMusic = new Audio('/sounds/music.mp3')
  themeMusic.volume = 0.3
  themeMusic.loop = true

  let musicUnlocked = false

  function tryPlayTheme(): void {
    if (!musicUnlocked) return
    if (!shouldPlayTheme()) return
    if (!themeMusic.paused) return
    safePlay(themeMusic)
  }

  function unlock(): void {
    if (!musicUnlocked) {
      musicUnlocked = true
    }
    tryPlayTheme()
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      tryPlayTheme()
    }
  })

  window.addEventListener('focus', () => {
    tryPlayTheme()
  })

  return {
    unlock,
    tryPlayTheme,
    pauseTheme: () => {
      themeMusic.pause()
    },
    playChop: () => {
      restartAndPlay(chopSound)
    },
    playConvert: () => {
      restartAndPlay(convertSound)
    },
    playWin: () => {
      restartAndPlay(winSound)
    },
    playLose: () => {
      restartAndPlay(loseSound)
    },
  }
}
