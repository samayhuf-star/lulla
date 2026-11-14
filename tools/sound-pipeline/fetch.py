import re,json,urllib.request,os,sys,html,concurrent.futures as cf
H={'User-Agent':'Mozilla/5.0'}
def get(sid):
    r=urllib.request.urlopen(urllib.request.Request(f'https://freesound.org/s/{sid}/',headers=H))
    url=r.geturl(); s=r.read().decode()
    ogg=re.search(r'data-ogg="([^"]*)"',s).group(1).replace('-lq','-hq')
    lic=re.search(r'license text" href="([^"]*)"',s).group(1)
    title=html.unescape(re.search(r'data-title="([^"]*)"',s).group(1))
    user=url.split('/people/')[1].split('/')[0]
    # original file type/samplerate from page
    meta={}
    for k in ['Type','Duration','File size','Sample rate','Bit depth','Channels']:
        m=re.search(r'<dt[^>]*>\s*'+k+r'\s*</dt>\s*<dd[^>]*>\s*([^<]+)',s)
        if m: meta[k]=m.group(1).strip()
    fn=f'src/{sid}.ogg'
    if not os.path.exists(fn):
        open(fn,'wb').write(urllib.request.urlopen(urllib.request.Request(ogg,headers=H)).read())
    return dict(id=sid,page=url,user=user,title=title,license=lic,preview=ogg,meta=meta,file=fn)
ids=[x for l in open('cands.txt') for x in l.split()[1:]]
with cf.ThreadPoolExecutor(6) as ex: res=list(ex.map(get,ids))
json.dump({r['id']:r for r in res},open('meta.json','w'),indent=1)
for r in res: print(r['id'],r['user'],r['license'].split('/')[-3:-1],r['meta'],r['title'][:50])
