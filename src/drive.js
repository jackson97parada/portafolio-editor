const KEY=import.meta.env.VITE_DRIVE_API_KEY, CID=import.meta.env.VITE_OAUTH_CLIENT_ID
export const ROOT=import.meta.env.VITE_ROOT_FOLDER_ID
const API='https://www.googleapis.com/drive/v3/files'
const list=async(p,o)=>{const r=await fetch(`${API}?q=${encodeURIComponent(p)}&fields=files(id,name,description,createdTime)&orderBy=createdTime%20${o}&pageSize=100&key=${KEY}`);if(!r.ok)throw new Error(r.status);return (await r.json()).files}
export async function listWorks(){
  const cats=await list(`'${ROOT}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,'asc')
  const works=(await Promise.all(cats.map(async c=>(await list(`'${c.id}' in parents and mimeType contains 'video/' and trashed=false`,'desc')).map(f=>({...f,title:f.name.replace(/\.[^.]+$/,''),cat:c.name}))))).flat()
  return {cats,works:works.sort((a,b)=>b.createdTime.localeCompare(a.createdTime))}
}
let tok
export const signIn=()=>new Promise((res,rej)=>{
  const go=()=>google.accounts.oauth2.initTokenClient({client_id:CID,scope:'https://www.googleapis.com/auth/drive.file',callback:r=>r.access_token?(tok=r.access_token,res()):rej(new Error(r.error))}).requestAccessToken()
  if(window.google?.accounts)return go()
  const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=go;document.head.append(s)
})
const auth=o=>({...o,headers:{...o.headers,Authorization:'Bearer '+tok}})
const post=async(u,b)=>{const r=await fetch(u,auth({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}));if(!r.ok)throw new Error(await r.text());return r.json()}
export async function setupFolders(){
  const mk=async(name,parent)=>{const f=await post(API,{name,mimeType:'application/vnd.google-apps.folder',...(parent&&{parents:[parent]})});await post(`${API}/${f.id}/permissions`,{role:'reader',type:'anyone'});return f.id}
  const root=await mk('PORTAFOLIO')
  for(const n of ['REELS','SHORTS','ENTREVISTAS','OTROS'])await mk(n,root)
  return root
}
export async function upload({file,title,description,folderId}){
  const ext=file.name.includes('.')?file.name.slice(file.name.lastIndexOf('.')):''
  const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',auth({method:'POST',headers:{'Content-Type':'application/json','X-Upload-Content-Type':file.type||'video/mp4'},body:JSON.stringify({name:title+ext,description,parents:[folderId]})}))
  if(!r.ok)throw new Error(await r.text())
  const u=await fetch(r.headers.get('Location'),{method:'PUT',body:file})
  if(!u.ok)throw new Error(await u.text())
}
