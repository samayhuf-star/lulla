import numpy as np,subprocess,sys,json,re
SR=44100
def decode(f,ch=2):
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-af','highpass=f=20','-ac',str(ch),'-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,ch).copy()
def stats(x):
    peak=np.abs(x).max(); clip=int((np.abs(x)>0.995).sum())
    # short-term (3s) RMS dB
    n=SR*3; m=len(x)//n
    r=np.array([20*np.log10(np.sqrt((x[i*n:(i+1)*n]**2).mean())+1e-9) for i in range(m)])
    return dict(peak_db=round(20*np.log10(peak+1e-9),1),clipped=clip,rms_db=round(20*np.log10(np.sqrt((x**2).mean())),1),st_std=round(float(r.std()),2),st_range=round(float(r.max()-r.min()),1))
if __name__=='__main__':
    for f in sys.argv[1:]:
        x=decode(f); print(f, len(x)/SR, stats(x))
