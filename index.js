const OS = require('opensubtitles-api');
const request = require('request');
const zlib = require('zlib');
var fs = require('fs');
const path = require('path');
const config = require('./config.json')

const OpenSubtitles = new OS({
    useragent: config.opensubtitles.useragent,
    username: config.opensubtitles.username,
    password: require('crypto').createHash('md5').update(config.opensubtitles.password).digest('hex'),
    ssl: true
});

function downloadSubtitle(url, dest){
    console.log('Downloading file, dest', url, dest)
    request({
        url: url,
        encoding: null
    }, (error, response, data) => {
        if (error){
            console.error('Error on download file', error)
            return;
        };
        zlib.unzip(data, (error, buffer) => {
            if (error) {
                console.error('Error on unzip file', error)
                return;
            };
            console.log('Writing file: ' + dest);
            fs.writeFile(dest, buffer, function(err) {
                if(err) {
                    console.error('Erro on write file', err)
                    return;
                }
            }); 
        });
    });
}

function searchSubtitle(filePath){
    const file = path.parse(filePath)
    //console.log('Dir: ' + file.dir);
    console.log('Search subtitle for: ' + file.name);

    OpenSubtitles.search({
        sublanguageid: config.language,       // Can be an array.join, 'all', or be omitted.
        path: filePath,        // Complete path to the video file, it allows
        gzip: true                  // returns url to gzipped subtitles, defaults to false
    }).then(subtitles => {
        if(subtitles.pb){
            let sub = subtitles.pb;
            downloadSubtitle(sub.url, path.join(file.dir, file.name + '.srt'))
            //console.log('Subtitle found, downloading file');
        }else{
            console.log('Not found subtitle by hash for file ' + filePath, subtitles);
            searchSubtitleByName(filePath);
        }
    });
}

function searchSubtitleByName(filePath){
    const file = path.parse(filePath)
    //console.log('Dir: ' + file.dir);
    console.log('Search subtitle for: ' + file.name);
    let fileName = file.name;

    //Espera que o nome do arquivo esstaja no formato: Silicon Valley - S04E02
    //TODO implementar regra por regex
    let se = fileName.substring(fileName.indexOf(' - ') + 3, + fileName.indexOf(' - ') + 9);
    let showName = fileName.substring(0, fileName.indexOf(' - '));
    let season = se.substring(1, 3);
    let episode = se.substring(4, 6)
    OpenSubtitles.search({
        sublanguageid: config.language,       // Can be an array.join, 'all', or be omitted.
         filesize: fs.statSync(filePath),      // Total size, in bytes.
         season: season,
         episode: episode,
         limit: config.limit,                 // Can be 'best', 'all' or an
         query: showName,   // Text-based query, this is not recommended.
         gzip: true                  // returns url to gzipped subtitles, defaults to false
    }).then(subtitles => {
        if(subtitles.pb){
            if(Array.isArray(subtitles.pb)){
                subtitles.pb.forEach(function(sub){
                    downloadSubtitle(sub.url, path.join(file.dir, file.name + '.srt - ' + sub.filename))    
                })
            }else{
                let sub = subtitles.pb;
                downloadSubtitle(sub.url, path.join(file.dir, file.name + '.srt'))
            }
            //console.log('Subtitle found, downloading file');
        }else{
            console.log('Not found subtitle by hash for file ' + filePath, subtitles);
        }
    });
}

var processFolder = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
    files = fs.readdirSync(dir);
    files.forEach(function(file) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processFolder(fullPath, filelist);
        } else {
            let fileInfo = path.parse(fullPath);
            // //verifica se o arquivos é um video e se ja não tem legendas
            if(config.videoFormats.indexOf(fileInfo.ext) > -1 && 
                !fs.existsSync(path.join(fileInfo.dir, fileInfo.name + '.srt'))){
                filelist.push(fullPath);
            }
        }
    });
};

console.log('Starting subtitles download at ' + new Date().toISOString());

let files = [];
console.log('Looking for files that need subtitles..')
processFolder(config.folderToScan, files)

console.log('Files to serch subtitles: ' + files);

files.forEach(filePath => {
    searchSubtitle(filePath);
})
