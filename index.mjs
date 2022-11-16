import express from 'express'
import 'express-async-errors';
import soundboard from './src/soundboard.mjs'

const port = process.env.PORT || 8000;
const app = express()

app.get('/', async (req, res) => {
    res
        .json(Array.from(soundboard.soundList))
})
app.get('/play/:sound', async (req, res) => {
    await soundboard.play(req.params.sound)
    res.json({code: 200})
})
app.use(async (err, req, res, next) => {
    console.error(err.stack)
    res
        .status(500)
        .json({message: err.message, code: 500, label: "Internal Server Error"})
})

app.listen(port, async () => {
    console.log(`Soundboard listening on port ${port}`)
})
