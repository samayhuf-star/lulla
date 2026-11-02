#!/bin/bash
# usage: make_video.sh <image-glob-prefix> <WxH> <out.mp4>   (images order: grid mix timer playing paywall)
set -e
P="$1"; SZ="$2"; OUT="$3"; W=${SZ%x*}; H=${SZ#*x}
IN=(); for k in grid mix timer playing paywall; do IN+=(-loop 1 -t 4 -i "${P}_${k}.png"); done
FILTER=""
for i in 0 1 2 3 4; do FILTER+="[$i:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x150a2e,setsar=1,fps=30,format=yuv420p[v$i];"; done
FILTER+="[v0][v1]xfade=transition=fadeblack:duration=0.5:offset=3.5[x1];[x1][v2]xfade=transition=fadeblack:duration=0.5:offset=7.0[x2];[x2][v3]xfade=transition=fadeblack:duration=0.5:offset=10.5[x3];[x3][v4]xfade=transition=fadeblack:duration=0.5:offset=14.0[vout]"
ffmpeg -y -loglevel error "${IN[@]}" -stream_loop -1 -i /root/lulla/app/assets/sounds/rain.mp3 -stream_loop -1 -i /root/lulla/app/assets/sounds/ocean.mp3 \
  -filter_complex "${FILTER};[5:a]volume=0.8[a1];[6:a]volume=0.5[a2];[a1][a2]amix=inputs=2:duration=longest,aformat=sample_rates=44100:channel_layouts=stereo,afade=t=in:d=1,afade=t=out:st=16:d=2[aout]" \
  -map "[vout]" -map "[aout]" -t 18 -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -movflags +faststart "$OUT"
