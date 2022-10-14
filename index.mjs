import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import sound from './src/sound.mjs'


const PORT = 8000;

const MIME_TYPES = {
    default: 'application/octet-stream',
    html: 'text/html; charset=UTF-8',
    js: 'application/javascript; charset=UTF-8',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpg',
    gif: 'image/gif',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
    mp3: 'audio/mpeg',
    json: 'applicaton/json'
};

const STATIC_PATH = path.join(process.cwd(), './static');
const sounds = fs.readdirSync(path.join(process.cwd(), './static/medias/music'))
    .map(filename => {
        const split = filename.split(".mp3")[0].split("-");
        return {
            theme: split[0].replace(/_/g, " "),
            title: split[1].replace(/_/g, " "),
            filename
        }
    })

const toBool = [() => true, () => false];

const buildIndex = (sounds) => {
    return `<!DOCTYPE html>
<head>
</head>
<body>
    ${sounds.map(({theme, title, filename}) => `<div>
<h3>${theme} - ${title}</h3>
<audio controls>
<source src="/medias/music/${filename}" />
</audio>
</div>`).join("\n")}
</body>
</html>`
}

const playSound = async ({theme, title, filename}) => {
    await sound.play(path.join(process.cwd(), `./static/medias/music/${filename}`))
}

const pattern = /\/play\/(?<theme>.*)\/(?<title>.*)/

const prepareFile = async (url) => {
    const paths = [STATIC_PATH, url];
    if (url.startsWith('/play')) {
        const matches = url.match(pattern)
        playSound(sounds.filter(({title, theme}) => title === matches.groups["title"] && theme === matches.groups["theme"])[0]);
        const stream = Readable()
        stream.push(JSON.stringify({status: "OK"}))
        stream.push(null) 
        return {found: true, ext: "json", stream}
    }
    if (url.endsWith('/')) {
        const response = buildIndex(sounds);
        console.log(response)
        const stream = Readable()
        stream.push(response)
        stream.push(null) 
        return {found: true, ext: "html", stream};
    }
    const filePath = path.join(...paths);
    const pathTraversal = !filePath.startsWith(STATIC_PATH);
    const exists = await fs.promises.access(filePath).then(...toBool);
    const found = !pathTraversal && exists;
    const streamPath = found ? filePath : STATIC_PATH + '/404.html';
    const ext = path.extname(streamPath).substring(1).toLowerCase();
    const stream = fs.createReadStream(streamPath);
    return { found, ext, stream };
};

http.createServer(async (req, res) => {
    const file = await prepareFile(decodeURI(req.url));
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    res.writeHead(statusCode, { 'Content-Type': mimeType });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${process.env.PORT || PORT}/`);