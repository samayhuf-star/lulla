import re,sys,urllib.request,urllib.parse,html
def fs(q,mind=60,lic='Creative Commons 0',n=15):
    f=f'license:"{lic}" duration:[{mind} TO 1200]'
    u='https://freesound.org/search/?'+urllib.parse.urlencode({'q':q,'f':f,'s':'Num downloads (most first)'})
    s=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode()
    out=[]
    for m in re.finditer(r'class="bw-player"(.*?)tabindex',s,re.S):
        b=m.group(1); g=lambda k:(re.search(k+r'="([^"]*)"',b) or [None,''])[1]
        out.append(dict(id=g('data-sound-id'),user=g('data-username'),title=html.unescape(g('data-title')),dur=float(g('data-duration') or 0),sr=g('data-samplerate'),dl=int(g('data-num-downloads') or 0),ogg=g('data-ogg').replace('-lq','-hq'),mp3=g('data-mp3').replace('-lq','-hq')))
    return out[:n]
if __name__=='__main__':
    for q in sys.argv[1:]:
        print('=====',q)
        for r in fs(q): print(f"{r['id']:>7} {r['dur']:6.0f}s {r['dl']:6d}dl {r['user'][:16]:16s} {r['title'][:60]}")
