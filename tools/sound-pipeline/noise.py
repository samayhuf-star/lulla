import numpy as np,subprocess,json
from process import run,SR
res={}
for name,color,af in [('white_noise','white','highshelf=f=8000:g=-3'),('pink_noise','pink',None),('brown_noise','brown',None)]:
    chans=[]
    for seed in (11,29):
        cmd=['ffmpeg','-v','error','-f','lavfi','-i',f'anoisesrc=color={color}:amplitude=0.25:seed={seed}:sample_rate={SR}:duration=72']
        if af: cmd+=['-af',af]
        cmd+=['-f','f32le','-ac','1','-']
        chans.append(np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,np.float32))
    x=np.stack(chans,1).copy()
    # 20 Hz high-pass for DC (brown noise drifts)
    raw=subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-af','highpass=f=20','-f','f32le','-'],input=x.tobytes(),capture_output=True).stdout
    x=np.frombuffer(raw,np.float32).reshape(-1,2).copy()
    res[name]=run(name,x,f'generated:{color}')
json.dump(res,open('process_noise.json','w'),indent=1)
