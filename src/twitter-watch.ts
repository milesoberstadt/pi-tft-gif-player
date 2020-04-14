const dotenv = require('dotenv');
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require ('child_process').exec);
import { fetchFile, getVideoLength, lengthenVideo } from './util/video.util';
import { TwitterUtil } from './util/twitter.util';
import { copyFile } from 'fs';

dotenv.config();

const loopMinLength = 300; // Minimum length of video in seconds
const videoProcessingDir = './tmp'; // Temp dir for processing videos and tracking 
const watchedVideoDir = '/home/pi/videos'; // Dir that linux is watching for new videos to play

try {
    fs.mkdirSync(videoProcessingDir);
    fs.mkdirSync(watchedVideoDir);
}
catch(e) {
    // we don't care if the dir already exists
}

async function main() {
    const twitter = new TwitterUtil();
    const tweet = await twitter.getLatestTweetForUser('GifBot17643505');
    
    // Use a file to keep track of the latest tweet processed
    // tweet.id_str
    try{
        const lastShown = fs.readFileSync(`${videoProcessingDir}/latest`);
        if (lastShown === tweet.id_str){
            console.error("We already have the latest, exiting...")
            return;
        }
    }
    catch (e){
        // Ignore failures reading this file, that means this has never run (successfully)
    }
    const media = twitter.getMediaFromTweet(tweet);
    if (!['video', 'animated_gif'].includes(media.type))
        throw new Error('Video only for now, sorry');
    const origVidPath = `${videoProcessingDir}/current_short.mp4`;
    const longerVidPath = `${videoProcessingDir}/current.mp4`;
    const finalVidPath = `${watchedVideoDir}/current.mp4`;
    await fetchFile(media.url, origVidPath);

    const videoLength = await getVideoLength(origVidPath);
    if (videoLength < loopMinLength){
        await lengthenVideo(videoLength, loopMinLength, videoProcessingDir);
        console.log('length done')
        await fs.promises.copyFile(longerVidPath, finalVidPath);
    }
    else {
        await fs.promises.copyFile(origVidPath, finalVidPath);
    }
    console.log('DONE');
}

main();