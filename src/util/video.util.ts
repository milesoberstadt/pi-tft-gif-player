import { promisify } from "util";

const exec = promisify(require('child_process').exec);

const https = require('https');
const fs = require('fs');

export function fetchFile(url, savePath): Promise<null> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(savePath);
        https.get(url, res => {
            res.pipe(file);
            file.on('finish', () => {
                resolve();
            });
        });
    });
}

export async function getVideoLength(videoPath: string): Promise<number> {
    let { stdout } = await exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${videoPath}`);
    let vidLength = parseFloat(stdout);
    // In the event of NaN or 0 for some reason, give a default length
    vidLength = !!vidLength ? vidLength : 5;
    return vidLength;
}

export function convertVideo(inFilePath: string, outFilePath: string) {
    fs.unlinkSync(outFilePath);
    return exec(`ffmpeg -i ${inFilePath} -f mp4 ${outFilePath}`);
}

export async function lengthenVideo(vidLength: number, desiredLength: number, tempDir: string): Promise<null> {
    // This creates a list for ffmpeg to determine how many copies it needs in a row
    let concatList = '';
    for (let i = 0; vidLength * i < desiredLength; i++) {
        concatList += `file 'current_short.mp4'\n`;
    }
    console.log('Lengthening video ', concatList.split('\n').length)
    if (fs.existsSync(`${tempDir}/current.mp4`))
        fs.unlinkSync(`${tempDir}/current.mp4`);
    fs.writeFileSync(`${tempDir}/concat_list.txt`, concatList);
    return await exec(`ffmpeg -f concat -i ${tempDir}/concat_list.txt -c copy -f mp4 ${tempDir}/current.mp4`);
}