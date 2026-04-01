#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/ferc33/Documentos/00-Sistema presupuestos/tour-videos"
OUT_DIR="$ROOT/out/linkedin"
SRC="$ROOT/out/guia.mp4"
FONT_BOLD="/usr/share/fonts/TTF/DejaVuSansMNerdFont-Bold.ttf"
FONT_REGULAR="/usr/share/fonts/TTF/DejaVuSansMNerdFont-Regular.ttf"
MP4_OUT="$OUT_DIR/product-tour-linkedin-showcase-v3.mp4"
PALETTE_OUT="$OUT_DIR/product-tour-linkedin-showcase-v3-palette.png"
GIF_OUT="$OUT_DIR/product-tour-linkedin-showcase-v3.gif"

mkdir -p "$OUT_DIR"

ffmpeg -y \
  -i "$SRC" \
  -f lavfi -t 1.5 -i "color=c=0xF4F8FF:s=1080x1080:r=30" \
  -f lavfi -t 2 -i "color=c=0xF4F8FF:s=1080x1080:r=30" \
  -filter_complex "
[1:v]drawbox=x=86:y=128:w=18:h=154:color=0x2563EB:t=fill,
drawbox=x=86:y=350:w=460:h=76:color=0xDBEAFE:t=fill,
drawbox=x=86:y=350:w=460:h=76:color=0xBFDBFE:t=3,
drawtext=fontfile=${FONT_BOLD}:text='Product-tour v3':fontcolor=0x2563EB:fontsize=34:x=124:y=374,
drawtext=fontfile=${FONT_BOLD}:text='Narrativa visual del tour':fontcolor=0x0F172A:fontsize=58:x=86:y=182,
drawtext=fontfile=${FONT_REGULAR}:text='Mas claridad, mejor contraste y look LinkedIn.':fontcolor=0x475569:fontsize=30:x=88:y=462,
drawtext=fontfile=${FONT_REGULAR}:text='QuoteFlow · UI azul/white · 1080x1080':fontcolor=0x64748B:fontsize=24:x=88:y=922[intro];

[0:v]trim=start=0:end=15.5,setpts=PTS-STARTPTS,split=2[p1bg][p1fg];
[p1bg]scale=-2:1080,gblur=sigma=18,eq=brightness=0.08:contrast=1.05:saturation=1.18,crop=1080:1080[p1bgf];
[p1fg]scale=1080:-2,eq=brightness=0.03:contrast=1.08:saturation=1.14[p1fgf];
[p1bgf][p1fgf]overlay=(W-w)/2:(H-h)/2,
drawbox=x=44:y=44:w=430:h=72:color=0xFFFFFF@0.90:t=fill,
drawbox=x=44:y=44:w=430:h=72:color=0xD7E7FF:t=2,
drawtext=fontfile=${FONT_BOLD}:text='Skill Product-tour':fontcolor=0x0F172A:fontsize=32:x=72:y=66,
drawbox=x=44:y=130:w=370:h=54:color=0x2563EB@0.98:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Tour Presupuestos':fontcolor=white:fontsize=25:x=72:y=146,
drawbox=x=24:y=296:w=1032:h=488:color=0xFFFFFF@0.55:t=3,
drawbox=x=54:y=854:w=972:h=158:color=0xF8FBFF@0.97:t=fill,
drawbox=x=54:y=854:w=972:h=158:color=0xD7E7FF:t=3,
drawbox=x=54:y=854:w=16:h=158:color=0x2563EB:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,0,3.8)',
drawtext=fontfile=${FONT_BOLD}:text='Inicia el tour de Presupuestos':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,0,3.8)',
drawtext=fontfile=${FONT_REGULAR}:text='Presenta el acceso guiado desde el listado principal.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,0,3.8)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,0,3.8)',
drawtext=fontfile=${FONT_BOLD}:text='01 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,0,3.8)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,3.8,7.3)',
drawtext=fontfile=${FONT_BOLD}:text='Muestra busqueda y resumen':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,3.8,7.3)',
drawtext=fontfile=${FONT_REGULAR}:text='Destaca filtros, conteo total y lectura rapida del listado.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,3.8,7.3)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,3.8,7.3)',
drawtext=fontfile=${FONT_BOLD}:text='02 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,3.8,7.3)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,7.3,10.2)',
drawtext=fontfile=${FONT_BOLD}:text='Abre modal de nuevo presupuesto':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,7.3,10.2)',
drawtext=fontfile=${FONT_REGULAR}:text='El tour lleva del CTA superior al formulario de alta.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,7.3,10.2)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,7.3,10.2)',
drawtext=fontfile=${FONT_BOLD}:text='03 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,7.3,10.2)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,10.2,13.4)',
drawtext=fontfile=${FONT_BOLD}:text='Guia carga de cliente e items':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,10.2,13.4)',
drawtext=fontfile=${FONT_REGULAR}:text='Explica que completar y como describir los renglones.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,10.2,13.4)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,10.2,13.4)',
drawtext=fontfile=${FONT_BOLD}:text='04 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,10.2,13.4)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,13.4,15.5)',
drawtext=fontfile=${FONT_BOLD}:text='Cierra con guardado del presupuesto':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,13.4,15.5)',
drawtext=fontfile=${FONT_REGULAR}:text='Termina sobre el boton Guardar para reforzar el cierre.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,13.4,15.5)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,13.4,15.5)',
drawtext=fontfile=${FONT_BOLD}:text='05 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,13.4,15.5)',
fps=30,setsar=1,format=yuv420p[seg1];

[0:v]trim=start=26:end=39,setpts=PTS-STARTPTS,split=2[p2bg][p2fg];
[p2bg]scale=-2:1080,gblur=sigma=18,eq=brightness=0.08:contrast=1.05:saturation=1.18,crop=1080:1080[p2bgf];
[p2fg]scale=1080:-2,eq=brightness=0.03:contrast=1.08:saturation=1.14[p2fgf];
[p2bgf][p2fgf]overlay=(W-w)/2:(H-h)/2,
drawbox=x=44:y=44:w=430:h=72:color=0xFFFFFF@0.90:t=fill,
drawbox=x=44:y=44:w=430:h=72:color=0xD7E7FF:t=2,
drawtext=fontfile=${FONT_BOLD}:text='Skill Product-tour':fontcolor=0x0F172A:fontsize=32:x=72:y=66,
drawbox=x=44:y=130:w=320:h=54:color=0x2563EB@0.98:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Tour Clientes':fontcolor=white:fontsize=25:x=72:y=146,
drawbox=x=24:y=296:w=1032:h=488:color=0xFFFFFF@0.55:t=3,
drawbox=x=54:y=854:w=972:h=158:color=0xF8FBFF@0.97:t=fill,
drawbox=x=54:y=854:w=972:h=158:color=0xD7E7FF:t=3,
drawbox=x=54:y=854:w=16:h=158:color=0x2563EB:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,0,3)',
drawtext=fontfile=${FONT_BOLD}:text='Activa tour de Clientes':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,0,3)',
drawtext=fontfile=${FONT_REGULAR}:text='Abre la ayuda desde la cabecera del modulo.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,0,3)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,0,3)',
drawtext=fontfile=${FONT_BOLD}:text='01 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,0,3)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,3,5.7)',
drawtext=fontfile=${FONT_BOLD}:text='Explica busqueda y alta rapida':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,3,5.7)',
drawtext=fontfile=${FONT_REGULAR}:text='Marca donde filtrar y como empezar un nuevo registro.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,3,5.7)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,3,5.7)',
drawtext=fontfile=${FONT_BOLD}:text='02 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,3,5.7)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,5.7,8.7)',
drawtext=fontfile=${FONT_BOLD}:text='Abre alta de cliente':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,5.7,8.7)',
drawtext=fontfile=${FONT_REGULAR}:text='La narrativa acompana el salto al formulario principal.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,5.7,8.7)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,5.7,8.7)',
drawtext=fontfile=${FONT_BOLD}:text='03 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,5.7,8.7)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,8.7,11.4)',
drawtext=fontfile=${FONT_BOLD}:text='Guia carga de datos clave':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,8.7,11.4)',
drawtext=fontfile=${FONT_REGULAR}:text='Recorre nombre, email, tipo de inmueble y direccion.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,8.7,11.4)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,8.7,11.4)',
drawtext=fontfile=${FONT_BOLD}:text='04 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,8.7,11.4)',
drawtext=fontfile=${FONT_BOLD}:text='Paso actual':fontcolor=0x2563EB:fontsize=24:x=92:y=878:enable='between(t,11.4,13)',
drawtext=fontfile=${FONT_BOLD}:text='Cierra con guardado y listado':fontcolor=0x0F172A:fontsize=32:x=92:y=916:enable='between(t,11.4,13)',
drawtext=fontfile=${FONT_REGULAR}:text='Muestra donde queda visible el cliente para reutilizarlo.':fontcolor=0x475569:fontsize=25:x=92:y=962:enable='between(t,11.4,13)',
drawbox=x=908:y=882:w=94:h=40:color=0xDBEAFE:t=fill:enable='between(t,11.4,13)',
drawtext=fontfile=${FONT_BOLD}:text='05 / 05':fontcolor=0x1D4ED8:fontsize=21:x=928:y=892:enable='between(t,11.4,13)',
fps=30,setsar=1,format=yuv420p[seg2];

[2:v]drawbox=x=86:y=160:w=18:h=120:color=0x2563EB:t=fill,
drawtext=fontfile=${FONT_BOLD}:text='Resultado':fontcolor=0x0F172A:fontsize=68:x=86:y=178,
drawbox=x=86:y=352:w=600:h=72:color=0xDBEAFE:t=fill,
drawbox=x=86:y=352:w=600:h=72:color=0xBFDBFE:t=3,
drawtext=fontfile=${FONT_BOLD}:text='Narrativa visual por paso':fontcolor=0x2563EB:fontsize=32:x=122:y=374,
drawtext=fontfile=${FONT_REGULAR}:text='Recuadro mas grande, mejor contraste y paleta mas limpia.':fontcolor=0x475569:fontsize=28:x=88:y=470,
drawtext=fontfile=${FONT_REGULAR}:text='Entregable listo para LinkedIn y GIF comprimido.':fontcolor=0x64748B:fontsize=26:x=88:y=920[outro];

[intro][seg1][seg2][outro]concat=n=4:v=1:a=0[v]" \
  -map "[v]" \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -preset medium \
  -crf 18 \
  -movflags +faststart \
  "$MP4_OUT"

ffmpeg -y -i "$MP4_OUT" -vf "fps=10,scale=640:-1:flags=lanczos,palettegen=stats_mode=diff" -frames:v 1 -update 1 "$PALETTE_OUT"
ffmpeg -y -i "$MP4_OUT" -i "$PALETTE_OUT" -lavfi "fps=10,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a" "$GIF_OUT"

printf 'Generated:\n- %s\n- %s\n' "$MP4_OUT" "$GIF_OUT"
