import numpy as np,subprocess,json,glob,os
from analyze import SR
from process import ebur
def dec(f):
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,2).copy()
def probe(f):
    j=json.loads(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration,bit_rate,size:stream=codec_name,sample_rate,channels,bit_rate','-of','json',f],capture_output=True).stdout)
    s=j['streams'][0]; fm=j['format']
    return dict(codec=s['codec_name'],sr=int(s['sample_rate']),ch=s['channels'],kbps=round(int(s.get('bit_rate') or fm['bit_rate'])/1000),dur=round(float(fm['duration']),2),kb=round(int(fm['size'])/1024))
def flat(x):
    m=x.mean(1); n=4096; sp=[]
    for i in range(0,len(m)-n,n*8):
        P=np.abs(np.fft.rfft(m[i:i+n]*np.hanning(n)))**2+1e-12; P=P[5:]
        sp.append(np.exp(np.log(P).mean())/P.mean())
    return float(np.mean(sp))
def seam(x):
    # 10 ms RMS of sample-to-sample difference across the loop seam vs median elsewhere
    t=np.concatenate([x[-SR:],x[:SR]]); d=np.abs(np.diff(t,axis=0)).mean(1)
    w=int(0.01*SR); r=np.array([d[i:i+w].mean() for i in range(0,len(d)-w,w)])
    mid=len(r)//2; return float(r[mid-1:mid+1].max()/np.median(r))
def stv(x):
    n=SR*3; r=[20*np.log10(np.sqrt((x[i:i+n]**2).mean())+1e-9) for i in range(0,len(x)-n,n)]; return float(np.std(r))
rows=[]
for f in sorted(glob.glob('out/*.m4a')):
    x=dec(f); I,LRA,TP=ebur(x); p=probe(f)
    rows.append(dict(name=os.path.basename(f)[:-4],**p,I=I,LRA=LRA,TP=TP,flat=round(flat(x),3),stdev=round(stv(x),2),seam=round(seam(x),2),clip=int((np.abs(x)>0.999).sum())))
old=[]
for f in sorted(glob.glob('/workspace/7apps/Lulla/assets/sounds/*.mp3'))[:25]:
    x=dec(f); old.append((os.path.basename(f),round(flat(x),3),round(stv(x),2)))
json.dump(dict(rows=rows,old=old),open('verify.json','w'),indent=1)
for r in rows: print(r)
print(old)
