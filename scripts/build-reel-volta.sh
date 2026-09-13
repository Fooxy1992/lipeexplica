#!/usr/bin/env bash
# Monta o reel "volta dos vídeos" a partir dos clipes gerados + frame de CTA.
# Uso: bash scripts/build-reel-volta.sh
# Saída: out/reels/reel-volta.mp4  (1080x1920, ~14s)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/out/reels"
cd "$DIR"
cp -n /c/Windows/Fonts/impact.ttf ./impact.ttf 2>/dev/null || true

FONT="impact.ttf"
W=1080
H=1920

# textos (arquivos evitam problemas de escape com acento)
printf 'OS VÍDEOS VOLTARAM' > t1.txt
printf 'TÉCNICA NOVA
TODA SEMANA' > t2.txt
printf '@LIPEEXPLICA' > t3.txt
printf 'lipeexplica.com' > t4.txt

norm="scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=30,format=yuv420p"
style="fontfile=${FONT}:fontcolor=white:borderw=8:bordercolor=black@0.75:x=(w-text_w)/2"

# ── cena 1: hook ──
ffmpeg -v error -y -i clip-01.mp4 \
  -vf "${norm},drawtext=${style}:textfile=t1.txt:fontsize=112:y=h*0.76:enable='gte(t,0.4)'" \
  -af "volume=1.0" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k s1.mp4

# ── cena 2: conteúdo ──
ffmpeg -v error -y -i clip-02.mp4 \
  -vf "${norm},drawtext=${style}:textfile=t2.txt:fontsize=96:line_spacing=12:y=h*0.74:enable='gte(t,0.3)'" \
  -af "volume=1.0" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k s2.mp4

# ── cena 3: CTA (frame estático com zoom lento + áudio silencioso) ──
ffmpeg -v error -y -loop 1 -t 4 -i frame-03.png -f lavfi -t 4 -i anullsrc=r=44100:cl=stereo \
  -vf "scale=${W}*2:-1,zoompan=z='min(zoom+0.0009,1.12)':d=120:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,format=yuv420p,drawtext=${style}:textfile=t3.txt:fontsize=120:y=h*0.70,drawtext=${style}:textfile=t4.txt:fontsize=62:y=h*0.79" \
  -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k -shortest s3.mp4

# ── concat ──
printf "file 's1.mp4'\nfile 's2.mp4'\nfile 's3.mp4'\n" > concat.txt
ffmpeg -v error -y -f concat -safe 0 -i concat.txt \
  -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k -movflags +faststart reel-volta.mp4

rm -f t1.txt t2.txt t3.txt t4.txt concat.txt s1.mp4 s2.mp4 s3.mp4
echo "✓ reel-volta.mp4"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 reel-volta.mp4
