import express from 'express'
import 'express-async-errors';
import soundboard from './src/soundboard.mjs'
import morgan from 'morgan'

const port = process.env.PORT || 8000;
const app = express()

// log incoming requests
app.use(morgan('tiny'))

app.get('/', (req, res) => {
    res.json(Array.from(soundboard.soundList))
})
app.get('/play/:sound', (req, res) => {
    if (!soundboard.soundList.has(req.params.sound)) {
        res
            .status(404)
            .json({code: 404, message: `unknown sound '${req.params.sound}'`})
    } else {
        soundboard.play(req.params.sound)
        res
        .writeHead(200, {
            'Content-Length': Buffer.byteLength(''),
            'Content-Type': 'text/plain',
          })
          .end('')
    }
})
app.use(async (err, req, res, next) => {
    console.error(err.stack)
    res
        .status(500)
        .json({message: err.message, code: 500, label: "Internal Server Error"})
})

app.listen(port, () => {
    console.log(`Soundboard listening on port ${port}`)
})
