const Twitter = require('twitter');
const dotenv = require('dotenv');
const {get} = require('lodash');
const https = require('https');
const fs = require('fs');
const {promisify} = require('util');
const exec = promisify(require ('child_process').exec);

dotenv.config();

const loopMinLength = 300; // Minimum length of video in seconds
const shortVidPath = 'videos/current_short.mp4'; // Location to store original video
const finishedVidPath = 'videos/current.mp4'; // Location to store original video
const gifPlayerSSH = process.env.GIF_PLAYER_SSH_HOST;

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

if (!process.argv[2]){
    console.error('Error, must specify a Tweet URL (ex. https://twitter.com/PhotoGhibli/status/1166352160348618755)');
    return;
}
const urlParts = process.argv[2].split('/');
const tweetID = urlParts[urlParts.length-1];
console.log("Fetching tweet with id", tweetID)

let mediaType = null;

getVideo();

async function getVideo(){
    const result = await client.get('statuses/show', { id: tweetID });
    mediaType = get(result, 'extended_entities.media[0].type');
    if (!mediaType){
        console.log('No media found on this tweet, exiting...');
        return
    }

    if (['video', 'animated_gif'].includes(mediaType)) {
        let videoURL = get(result, 'extended_entities.media[0].video_info.variants[0].url');
        if (!videoURL) {
            console.error('Twitter specifies a video, but I couldnt find one, exiting...');
            return;
        }
        console.log("Video:", videoURL);
        
        const videoFile = fs.createWriteStream(shortVidPath);
        https.get(videoURL, (res) => { gotVideo(res, videoFile); });
    }
    else if (mediaType === 'photo') {
        console.log(result.extended_entities.media[0])
        let imageURL = get(result, 'extended_entities.media[0].media_url_https');
        if (!imageURL){
            console.error('Twitter specifies a video, but I couldnt find one, exiting...');
            return;
        }
        console.log(`Image: ${imageURL}`);

        const imageFile = fs.createWriteStream(finishedVidPath);
        https.get(imageURL, (res) => copyToHost());
    }
    else {
        console.log(`Found an unprocessable media type "${mediaType}" in tweet, exiting`);
    }
}

async function gotVideo(res, videoFile) {
    res.pipe(videoFile);
    // Get the runtime of this video
    let {stdout} = await exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${shortVidPath}`);
    let vidLength = parseFloat(stdout);
    console.log(`Original video length: ${vidLength}`);

    // This is a little trick to make the video longer...
    let concatList = '';
    for(let i=0; vidLength*i<loopMinLength; i++){
        concatList += `file 'current_short.mp4'\n`;
    }
    if (concatList === ""){
        console.log('Original file is long enough in current form, skipping concat');
        await fs.promises.copyFile('shortVidPath', finishedVidPath);
    }
    else {
        console.log('Lengthing loop...')
        fs.unlinkSync(finishedVidPath);
        fs.writeFileSync('videos/concat_list.txt', concatList);
        let output = await exec(`ffmpeg -f concat -i videos/concat_list.txt -c copy -f mp4 ${finishedVidPath}`);
        console.log(output);
    }
    copyToHost();
}

async function copyToHost(){
    console.log('Copying file to host');
    await exec(`scp ${finishedVidPath} ${gifPlayerSSH}:~/videos`);
}