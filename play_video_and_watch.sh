#!/bin/bash
# This lets us use relative paths
CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CWD

# Enabling sleep here could be useful for showing device IP
#sleep 300
if [ -f "tmp/current.mp4" ]; then
    sudo killall mplayer
    sudo SDL_VIDEODRIVER=fbcon SDL_FBDEV=/dev/fb1 mplayer -noconsolecontrols -really-quiet 2>/dev/null -vo sdl -framedrop -xy 320 -loop 0 tmp/current.mp4 &
else
	mkdir -p tmp
fi

inotifywait -m -e close_write tmp/current.mp4 |
while read video_path _ file; do
    echo $video_path$file modified
    sudo killall mplayer
    sudo SDL_VIDEODRIVER=fbcon SDL_FBDEV=/dev/fb1 mplayer -noconsolecontrols -really-quiet 2>/dev/null -vo sdl -framedrop -xy 320 -loop 0 tmp/current.mp4 &
done
