"""Caption + frame App Store screenshots. Usage: python3 shots.py <spec.json> <outdir>
spec: {"bg":["#hex","#hex"],"fg":"#hex","shots":[{"src":"path","caption":"...","sub":"..."}]}
Outputs 6.9" (1320x2868) and 6.5" (1284x2778) PNGs (no alpha)."""
import json,sys,os
from PIL import Image,ImageDraw,ImageFont,ImageFilter
FB='/usr/share/fonts/truetype/sand-box/google/Poppins/Poppins-Bold.ttf'
FR='/usr/share/fonts/truetype/sand-box/google/Poppins/Poppins-Medium.ttf'
def hexc(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def grad(w,h,a,b):
    a,b=hexc(a),hexc(b); im=Image.new('RGB',(w,h)); d=ImageDraw.Draw(im)
    for y in range(h):
        t=y/h; d.line([(0,y),(w,y)],fill=tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3)))
    return im
def wrap(d,text,font,maxw):
    words=text.split(); lines=[]; cur=''
    for w in words:
        t=(cur+' '+w).strip()
        if d.textlength(t,font=font)<=maxw: cur=t
        else: lines.append(cur); cur=w
    lines.append(cur); return lines
def render(spec,shot,W,H):
    s=W/1320
    im=grad(W,H,*spec['bg']); d=ImageDraw.Draw(im); fg=hexc(spec.get('fg','#FFFFFF'))
    f1=ImageFont.truetype(FB,int(104*s)); f2=ImageFont.truetype(FR,int(52*s))
    y=int(170*s)
    for ln in wrap(d,shot['caption'],f1,W-int(160*s)):
        d.text((W/2,y),ln,font=f1,fill=fg,anchor='ma'); y+=int(122*s)
    if shot.get('sub'):
        y+=int(14*s)
        for ln in wrap(d,shot['sub'],f2,W-int(200*s)):
            d.text((W/2,y),ln,font=f2,fill=fg+(0,) if False else fg,anchor='ma'); y+=int(66*s)
    top=max(y+int(60*s),int(560*s))
    src=Image.open(shot['src']).convert('RGB')
    sw=int(W*0.80); sh=int(src.height*sw/src.width)
    src=src.resize((sw,sh),Image.LANCZOS)
    r=int(64*s); mask=Image.new('L',(sw,sh),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,sw,sh],r,fill=255)
    x=(W-sw)//2
    sha=Image.new('L',(W,H),0); ImageDraw.Draw(sha).rounded_rectangle([x,top+int(20*s),x+sw,top+sh+int(20*s)],r,fill=110)
    sha=sha.filter(ImageFilter.GaussianBlur(int(30*s))); im.paste(Image.new('RGB',(W,H),(0,0,0)),(0,0),sha)
    bez=int(14*s); ImageDraw.Draw(im).rounded_rectangle([x-bez,top-bez,x+sw+bez,top+sh+bez],r+bez,fill=(18,18,22))
    im.paste(src,(x,top),mask)
    return im
spec=json.load(open(sys.argv[1])); out=sys.argv[2]
for sz,(W,H) in {'6.9':(1320,2868),'6.5':(1284,2778)}.items():
    os.makedirs(f'{out}/{sz}',exist_ok=True)
    for i,sh in enumerate(spec['shots'],1):
        render(spec,sh,W,H).save(f'{out}/{sz}/{i:02d}.png',optimize=True)
print('done',out,len(spec['shots']))
