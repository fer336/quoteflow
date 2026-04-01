#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/ferc33/Documentos/00-Sistema presupuestos/tour-videos"
OUT_DIR="$ROOT/out/linkedin"
SRC="$ROOT/out/guia.mp4"
FONT_BOLD="/usr/share/fonts/TTF/DejaVuSansMNerdFont-Bold.ttf"
FONT_REGULAR="/usr/share/fonts/TTF/DejaVuSansMNerdFont-Regular.ttf"
MP4_OUT="$OUT_DIR/product-tour-linkedin-showcase.mp4"
PALETTE_OUT="$OUT_DIR/product-tour-linkedin-palette.png"
GIF_OUT="$OUT_DIR/product-tour-linkedin-showcase.gif"

mkdir -p "$OUT_DIR"

ffmpeg -y \
  -i "$SRC" \
  -f lavfi -t 2 -i "color=c=0x0B1020:s=1080x1080:r=30" \
  -f lavfi -t 2 -i "color=c=0x0B1020:s=1080x1080:r=30" \
  -filter_complex "
[1:v]drawbox=x=70:y=160:w=160:h=12:color=0x2563EB:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Skill Product-tour':fontcolor=white:fontsize=68:x=70:y=220,
drawtext=fontfile=${FONT_REGULAR}:text='Showcase para LinkedIn':fontcolor=0xCBD5E1:fontsize=36:x=72:y=315,
drawbox=x=70:y=392:w=610:h=70:color=0x2563EB@0.95:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Tour Clientes · Tour Presupuestos':fontcolor=white:fontsize=28:x=105:y=414,
drawtext=fontfile=${FONT_REGULAR}:text='Auto primera vez + Ver tour':fontcolor=0x94A3B8:fontsize=28:x=72:y=510,
drawtext=fontfile=${FONT_REGULAR}:text='Flujo real grabado desde assets existentes':fontcolor=0x64748B:fontsize=24:x=72:y=885[intro];

[0:v]trim=start=0:end=18,setpts=PTS-STARTPTS,split=2[p1bg][p1fg];
[p1bg]scale=-2:1080,gblur=sigma=28,crop=1080:1080[p1bgf];
[p1fg]scale=1080:-2[p1fgf];
[p1bgf][p1fgf]overlay=(W-w)/2:(H-h)/2,
drawbox=x=40:y=40:w=470:h=74:color=0x0B1020@0.82:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Skill Product-tour':fontcolor=white:fontsize=34:x=70:y=61,
drawbox=x=40:y=128:w=380:h=56:color=0x2563EB@0.96:t=fill:enable='between(t,0,6)',
drawtext=fontfile=${FONT_BOLD}:text='Tour Presupuestos':fontcolor=white:fontsize=26:x=70:y=144:enable='between(t,0,6)',
drawbox=x=40:y=128:w=330:h=56:color=0x2563EB@0.96:t=fill:enable='between(t,6,12)',
drawtext=fontfile=${FONT_BOLD}:text='Auto primera vez':fontcolor=white:fontsize=26:x=70:y=144:enable='between(t,6,12)',
drawbox=x=40:y=128:w=290:h=56:color=0x2563EB@0.96:t=fill:enable='between(t,12,18)',
drawtext=fontfile=${FONT_BOLD}:text='Ver tour':fontcolor=white:fontsize=26:x=70:y=144:enable='between(t,12,18)',
drawbox=x=40:y=926:w=700:h=76:color=0x0B1020@0.74:t=fill,
drawtext=fontfile=${FONT_REGULAR}:text='Creación guiada del presupuesto con ayuda contextual.':fontcolor=white:fontsize=28:x=68:y=952,
fps=30,setsar=1,format=yuv420p[seg1];

[0:v]trim=start=26:end=41.5,setpts=PTS-STARTPTS,split=2[p2bg][p2fg];
[p2bg]scale=-2:1080,gblur=sigma=28,crop=1080:1080[p2bgf];
[p2fg]scale=1080:-2[p2fgf];
[p2bgf][p2fgf]overlay=(W-w)/2:(H-h)/2,
drawbox=x=40:y=40:w=470:h=74:color=0x0B1020@0.82:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Skill Product-tour':fontcolor=white:fontsize=34:x=70:y=61,
drawbox=x=40:y=128:w=300:h=56:color=0x2563EB@0.96:t=fill:enable='between(t,0,8)',
drawtext=fontfile=${FONT_BOLD}:text='Tour Clientes':fontcolor=white:fontsize=26:x=70:y=144:enable='between(t,0,8)',
drawbox=x=40:y=128:w=430:h=56:color=0x2563EB@0.96:t=fill:enable='between(t,8,15.5)',
drawtext=fontfile=${FONT_BOLD}:text='Alta rápida + Ver tour':fontcolor=white:fontsize=26:x=70:y=144:enable='between(t,8,15.5)',
drawbox=x=40:y=926:w=690:h=76:color=0x0B1020@0.74:t=fill,
drawtext=fontfile=${FONT_REGULAR}:text='El tour hace visible el flujo sin tocar la lógica existente.':fontcolor=white:fontsize=28:x=68:y=952,
fps=30,setsar=1,format=yuv420p[seg2];

[2:v]drawbox=x=70:y=185:w=180:h=12:color=0x2563EB:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Resultado':fontcolor=white:fontsize=72:x=70:y=245,
drawtext=fontfile=${FONT_REGULAR}:text='Primera visita guiada + botón Ver tour':fontcolor=0xCBD5E1:fontsize=30:x=72:y=346,
drawtext=fontfile=${FONT_REGULAR}:text='Output listo para LinkedIn':fontcolor=0x94A3B8:fontsize=28:x=72:y=414,
drawtext=fontfile=${FONT_REGULAR}:text='MP4 social media + GIF optimizado':fontcolor=0x64748B:fontsize=24:x=72:y=885[outro];

[intro][seg1][seg2][outro]concat=n=4:v=1:a=0[v]" \
  -map "[v]" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -preset medium \
  -crf 20 \
  -movflags +faststart \
  "$MP4_OUT"

ffmpeg -y -i "$MP4_OUT" -vf "fps=10,scale=640:-1:flags=lanczos,palettegen=stats_mode=diff" "$PALETTE_OUT"
ffmpeg -y -i "$MP4_OUT" -i "$PALETTE_OUT" -lavfi "fps=10,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a" "$GIF_OUT"

printf 'Generated:\n- %s\n- %s\n' "$MP4_OUT" "$GIF_OUT"
