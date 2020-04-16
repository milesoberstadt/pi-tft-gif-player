# gif thing

This project is meant grab GIF media from Twitter, format it with ffmpeg and send it to a display for playback over ssh. I'm using a Pi Zero W with an adafruit TFT display.

## Install

0. Ensure `ffmpeg` is installed on your host
1. Verify you can do a non-interactive ssh session with the device you'll be copying your video to. I used `ssh-copy-id` to allow for public key authentication.
2. Clone this repo
3. Issue `npm install` to get all the dependencies installed
4. Setup your .env file
5. Run this command with your tweet URL `node index.js TWEET_URL` (example `node index.js https://twitter.com/PhotoGhibli/status/1162280445666447362`)
6. Add this to your crontab: `@reboot exec screen -d -m -S gif-player /bin/bash "/home/pi/pi-tft-gif-player/play_video_and_watch.sh"`

## .env file

This script expects a `.env` file to contain the bash variables for Twitter auth and a hostname to send the video to. 

Here's a list of all the expected variables:

```
CONSUMER_KEY=YOUR_TWITTER_CONSUMER_KEY
CONSUMER_SECRET=YOUR_TWITTER_CONSUMER_SECRET
ACCESS_TOKEN_KEY=YOUR_TWITTER_ACCESS_TOKEN_KEY
ACCESS_TOKEN_SECRET=YOUR_TWITTER_ACCESS_TOKEN_SECRET
GIF_PLAYER_SSH_HOST="USER@HOSTIP"
TWITTER_USER=USER_WITH_MEDIA_TO_USE
```

`GIF_PLAYER_SSH_HOST` should be include your username for logging in, something like `pi@192.168.1.2`


# TODO

* Delete JS stuff
* `ts-node src/twitter-watch.ts` 
* Add instructions for ts-node
* Add `ffmpeg` install details (https://johnvansickle.com/ffmpeg/) (/usr/bin)
* Add node details
* Fix build process
* Write crontab script
* Include / distinguish between this and the inotify 