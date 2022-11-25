import * as fs from 'node:fs';
import * as path from 'node:path';
import player from './audio.mjs'

const STATIC_PATH = path.join(process.cwd(), './static');
// create sound files array
const sounds = new Set(fs.readdirSync(`${STATIC_PATH}/medias/music`)
    .map(filename => filename.split(".mp3")[0]))

export default {
    play: (sound) => {
        if (sounds.has(sound)) {
            player.play(`${STATIC_PATH}/medias/music/${sound}.mp3`)
            return
        }

        throw new Error(`${sound}.mp3 not found`)
    },
    soundList: sounds
}