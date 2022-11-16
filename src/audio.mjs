// https://github.com/nomadhoc/sound-play
import { exec } from 'child_process'
import { promisify } from 'util'


const execPromise = promisify(exec)

/* MAC PLAY COMMAND */
const macPlayCommand = (path, volume) => `afplay \"${path}\" -v ${volume}`

const linuxPlayCommand = (path, volume) => `ffplay -volume ${volume} -loglevel info -nodisp -autoexit \"${path}\"`

/* WINDOW PLAY COMMANDS */
const addPresentationCore = `Add-Type -AssemblyName presentationCore;`
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`
const loadAudioFile = path => `$player.open('${path}');`
const playAudio = `$player.Play();`
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`

const windowPlayCommand = (path, volume) =>
  `powershell -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    path,
  )} $player.Volume = ${volume}; ${playAudio} ${stopAudio}`

export default {
  play: async (path, volume=0.5) => {
    /**
     * Window: mediaplayer's volume is from 0 to 1, default is 0.5
     * Mac: afplay's volume is from 0 to 255, default is 1. However, volume > 2 usually result in distortion.
     * Therefore, it is better to limit the volume on Mac, and set a common scale of 0 to 1 for simplicity
     */
    const volumeAdjustedByOS = process.platform === 'darwin' ? Math.min(2, volume * 2) : volume

    let playCommand = null
    switch(process.platform) {
      case "darwin":
        playCommand = macPlayCommand(path, volumeAdjustedByOS)
        break
      case "windows":
        playCommand = windowPlayCommand(path, volumeAdjustedByOS)
        break;
      case "linux":
        playCommand = linuxPlayCommand(path, 100)
        break
      default:
        throw new Error("pas de chance")
    }

    await execPromise(playCommand, {windowsHide: true})
  },
}