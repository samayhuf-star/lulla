import numpy as np,subprocess,sys,json,re,os
from analyze import decode,SR
X=4.0; MAXLIM=8.0; TARGET=-20.0; TPMAX=-1.2
os.makedirs('out',exist_ok=True)
def ebur(x):
    t=np.tile(x,(3,1)).astype(np.float32)
    p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-af','ebur128=peak=true','-f','null','-'],input=t.tobytes(),capture_output=True).stderr.decode()
    s=p[p.rfind('Summary'):]
    I=float(re.search(r'I:\s+(-?[\d.]+) LUFS',s).group(1)); LRA=float(re.search(r'LRA:\s+(-?[\d.]+) LU',s).group(1))
    TP=float(re.search(r'Peak:\s+(-?[\d.inf]+) dBFS',s).group(1))
    return I,LRA,TP
def pick_window(x,L):
    n=int((L+X)*SR); best=None
    clip=np.abs(x).max(axis=1)>0.99
    hop=SR
    r=np.array([np.sqrt((x[i:i+SR]**2).mean()) for i in range(0,len(x)-SR,SR)])
    rd=20*np.log10(r+1e-9)
    w=int(L+X)
    for s in range(0,max(1,len(rd)-w+1)):
        a=s*SR
        if a+n>len(x): break
        sc=rd[s:s+w].std()+100*clip[a:a+n].sum()
        if best is None or sc<best[0]: best=(sc,a)
    return best[1]
def limit(y):
    # run limiter over 3 tiled copies and keep the middle so the loop seam stays continuous
    n=len(y); t=np.tile(y,(3,1)).astype(np.float32)
    raw=subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-af','alimiter=limit=0.79:attack=5:release=80:level=0','-f','f32le','-'],input=t.tobytes(),capture_output=True).stdout
    z=np.frombuffer(raw,np.float32).reshape(-1,2)
    return z[n:2*n].copy()
def make_loop(x,L):
    n=int(L*SR); k=int(X*SR)
    seg=x[:n+k]
    t=np.arange(k)/k
    fin=np.sin(t*np.pi/2)[:,None]; fout=np.cos(t*np.pi/2)[:,None]
    out=seg[:n].copy()
    out[:k]=seg[:k]*fin+seg[n:n+k]*fout
    return out
def encode(x,fn,br='256k'):
    subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','aac','-b:a',br,'-ar',str(SR),'-movflags','+faststart',fn],input=x.astype(np.float32).tobytes(),check=True)
def run(name,x,src_note):
    dur=len(x)/SR; L=min(66.0,dur-X-0.5)
    assert L>=60, (name,dur)
    a=pick_window(x,L); x=x[a:]
    lp=make_loop(x,L)
    I,LRA,TP=ebur(lp); g=TARGET-I; lim=0.0
    if TP+g>TPMAX:
        lim=min(MAXLIM,TP+g-TPMAX)   # dB of peak limiting allowed for transient-heavy recordings
        g=min(g,TPMAX-TP+lim)
    y=lp*10**(g/20)
    if lim>0.5: y=limit(y)
    fn=f'out/{name}.m4a'
    br='256k'
    for _ in range(8):
        encode(y,fn,br)
        d=decode(fn); I2,LRA2,TP2=ebur(d)
        kb=int(json.loads(subprocess.run(['ffprobe','-v','error','-show_entries','stream=bit_rate','-of','json',fn],capture_output=True).stdout)['streams'][0]['bit_rate'])
        if kb<256000 and br=='256k': br='320k'; continue
        if TP2<=-1.1: break
        y*=10**((-1.3-TP2)/20)
    info=dict(name=name,src=src_note,window_start_s=round(a/SR,1),loop_s=round(L,2),gain_db=round(g,1),limit_db=round(lim,1),pre_I=I,pre_TP=TP)
    print(json.dumps(info)); return info
if __name__=='__main__':
    res={}
    only=sys.argv[1:]
    for line in open('picks.txt'):
        name,sid=line.split()
        if only and name not in only: continue
        x=decode(f'src/{sid}.ogg')
        # 20 Hz high-pass to remove DC / sub rumble
        res[name]=run(name,x,sid)
    json.dump(res,open('process_'+('_'.join(only) or 'all')+'.json','w'),indent=1)
