const Twitter = require('twitter');
const { get } = require('lodash');

export class TwitterUtil {
    private client = null

    constructor() {
        this.client = new Twitter({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token_key: process.env.ACCESS_TOKEN_KEY,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET
        });
    }

    async getLatestTweetForUser(username: string) {
        const tweet = await this.client.get('statuses/user_timeline', { screen_name: username, count: 1 });
        return tweet[0];
    }

    getMediaFromTweet(tweet: any): {type: string, url: string} {
        let mediaType = null;
        mediaType = get(tweet, 'extended_entities.media[0].type') || get(tweet, 'retweeted_status.extended_entities.media[0].type');
        if (!mediaType) {
            throw new Error('No media found on this tweet, exiting...');
        }

        if (['video', 'animated_gif'].includes(mediaType)) {
            let videoURL = get(tweet, 'extended_entities.media[0].video_info.variants[0].url') || get(tweet, 'retweeted_status.extended_entities.media[0].video_info.variants[0].url');
            if (!videoURL) {
                throw new Error('Twitter specifies a video, but I couldnt find one, exiting...');
                return;
            }
            console.log("Video:", videoURL);

            return {type: 'video', url: videoURL};
            //fetchVideo(videoURL, `${videoProcessingDir}/${srcVideoFilename}`)
            //    .then(gotVideo);
        }
        else if (mediaType === 'photo') {
            console.log(tweet.extended_entities.media[0])
            let imageURL = get(tweet, 'extended_entities.media[0].media_url_https');
            if (!imageURL) {
                throw new Error('Twitter specifies a video, but I couldnt find one, exiting...');
            }
            console.log(`Image: ${imageURL}`);
            return {type: 'image', url: imageURL};
            // fetchVideo(imageURL, finishedVidPath)
            //     .then(copyToHost);
        }
        else {
            throw new Error(`Found an unprocessable media type "${mediaType}" in tweet, exiting`);
        }
    }
}
