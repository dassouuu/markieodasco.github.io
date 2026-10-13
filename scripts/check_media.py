"""Optional ffprobe/ffmpeg checks for the integrated MP4s, including full decode."""
from pathlib import Path
import json,subprocess,struct,concurrent.futures,sys
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'media-manifest.json').read_text())
if len(sys.argv)>1:
    selected=set(sys.argv[1:])
    items=[item for item in items if item['id'] in selected]
    assert len(items)==len(selected), 'Unknown project ID supplied'
def check(item):
    file=root/item['video']
    p=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)]))
    v=next(s for s in p['streams'] if s['codec_type']=='video')
    assert v['codec_name']=='h264' and v['pix_fmt']=='yuv420p',file.name
    assert any(s['codec_name']=='aac' for s in p['streams'] if s['codec_type']=='audio'),file.name
    assert abs(float(p['format']['duration'])-item['duration'])<.2,file.name
    assert file.stat().st_size<25*1024*1024,file.name
    positions={}
    with file.open('rb') as f:
        while f.tell()<file.stat().st_size:
            start=f.tell();raw=f.read(8)
            if len(raw)<8:break
            size,kind=struct.unpack('>I4s',raw)
            if size==1:size=struct.unpack('>Q',f.read(8))[0]
            if size==0:size=file.stat().st_size-start
            assert size>=8,file.name
            positions[kind]=start;f.seek(start+size)
    assert positions[b'moov']<positions[b'mdat'],file.name+' fast-start metadata'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-xerror','-threads','2','-i',str(file),'-map','0:v:0','-map','0:a:0','-f','null','-'],check=True,stdout=subprocess.DEVNULL)
    return f'{file.name}: decoded video/audio; {v["width"]}x{v["height"]}; H.264/AAC; fast-start; {file.stat().st_size/1024/1024:.1f} MiB'
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    for result in pool.map(check,items):print('PASS:',result,flush=True)
print(f'All {len(items)} files decode cleanly. These are media checks, not real-browser playback tests.')
