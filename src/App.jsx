import {useEffect,useState} from 'react'
import {ROOT,listWorks,signIn,setupFolders,upload} from './drive'
const C={name:'Tu Nombre',tagline:'Edito reels, shorts y entrevistas que retienen a la audiencia.',whatsapp:'573000000000',instagram:'usuario',email:'correo@ejemplo.com'}
const thumb=id=>`https://drive.google.com/thumbnail?id=${id}&sz=w640`

function Admin(){
  const [ok,setOk]=useState(false),[cats,setCats]=useState([]),[root,setRoot]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  const [f,setF]=useState({file:null,folderId:'',title:'',description:''})
  const run=async fn=>{setBusy(true);setMsg('');try{await fn()}catch(e){setMsg('Error: '+e.message)}setBusy(false)}
  useEffect(()=>{ROOT&&listWorks().then(d=>{setCats(d.cats);setF(x=>({...x,folderId:d.cats[0]?.id||''}))}).catch(()=>{})},[])
  const input='w-full rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-fuchsia-500'
  return <main className="min-h-screen grid place-items-center p-6 text-white"><div className="w-full max-w-md space-y-4">
    <h1 className="text-2xl font-bold">Agregar trabajo</h1>
    {!ok?<button className="rounded-lg bg-fuchsia-600 px-4 py-2" onClick={()=>run(async()=>{await signIn();setOk(true)})}>Entrar con Google</button>
    :!ROOT?<div className="space-y-3"><button disabled={busy} className="rounded-lg bg-fuchsia-600 px-4 py-2" onClick={()=>run(async()=>setRoot(await setupFolders()))}>Crear carpetas en Drive</button>
      {root&&<p className="break-all text-sm">Guarda este ID como variable VITE_ROOT_FOLDER_ID (GitHub y .env): <b>{root}</b></p>}</div>
    :<div className="space-y-3">
      <input type="file" accept="video/*" className={input} onChange={e=>setF({...f,file:e.target.files[0]})}/>
      <select className={input+' bg-zinc-900'} value={f.folderId} onChange={e=>setF({...f,folderId:e.target.value})}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input className={input} placeholder="Título" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
      <textarea className={input} placeholder="Descripción" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/>
      <button disabled={busy||!f.file||!f.title||!f.folderId} className="rounded-lg bg-fuchsia-600 px-4 py-2 disabled:opacity-40"
        onClick={()=>run(async()=>{await upload(f);setMsg('Publicado. Puede tardar unos minutos en verse el thumbnail.');setF({...f,file:null,title:'',description:''})})}>{busy?'Subiendo…':'PUBLICAR'}</button></div>}
    {msg&&<p className="text-sm text-zinc-300 break-all">{msg}</p>}
  </div></main>
}

function Site(){
  const [d,setD]=useState({cats:[],works:[]}),[cat,setCat]=useState(''),[sel,setSel]=useState(null),[err,setErr]=useState(false)
  useEffect(()=>{ROOT&&listWorks().then(setD).catch(()=>setErr(true))},[])
  const shown=d.works.filter(w=>!cat||w.cat===cat)
  const chip=a=>`rounded-full px-4 py-1.5 text-sm capitalize transition ${a?'bg-white text-black':'bg-white/10 hover:bg-white/20'}`
  return <div className="min-h-screen bg-zinc-950 text-white">
    <header className="relative grid min-h-[85vh] place-items-center overflow-hidden px-6 text-center">
      <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-600/30 blur-3xl"/>
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"/>
      <div className="up relative max-w-2xl space-y-6">
        <p className="text-sm uppercase tracking-[.3em] text-fuchsia-400">Editor de contenido</p>
        <h1 className="text-5xl font-extrabold sm:text-7xl">{C.name}</h1>
        <p className="text-lg text-zinc-300">{C.tagline}</p>
        <div className="flex justify-center gap-3"><a href="#trabajos" className="rounded-full bg-white px-6 py-3 font-semibold text-black">Ver trabajos</a><a href="#contacto" className="rounded-full border border-white/30 px-6 py-3 font-semibold">Contacto</a></div>
      </div>
    </header>
    <section id="trabajos" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-wrap gap-2"><button className={chip(!cat)} onClick={()=>setCat('')}>Todos</button>{d.cats.map(c=><button key={c.id} className={chip(cat===c.name)} onClick={()=>setCat(c.name)}>{c.name.toLowerCase()}</button>)}</div>
      {err&&<p className="text-zinc-400">No se pudieron cargar los trabajos.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {shown.map(w=><button key={w.id} onClick={()=>setSel(w)} className="up group relative aspect-[9/16] overflow-hidden rounded-xl bg-zinc-900 text-left">
          <img loading="lazy" src={thumb(w.id)} alt={w.title} onError={e=>e.target.style.display='none'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent"/>
          <div className="absolute bottom-0 p-3"><span className="text-xs capitalize text-fuchsia-300">{w.cat.toLowerCase()}</span><p className="font-semibold leading-tight">{w.title}</p></div>
        </button>)}
      </div>
    </section>
    <section id="contacto" className="px-6 py-20 text-center"><h2 className="mb-6 text-3xl font-bold">Trabajemos juntos</h2>
      <div className="flex flex-wrap justify-center gap-3">{[['WhatsApp',`https://wa.me/${C.whatsapp}`],['Instagram',`https://instagram.com/${C.instagram}`],['Email',`mailto:${C.email}`]].map(([n,h])=><a key={n} href={h} className="rounded-full bg-white/10 px-6 py-3 hover:bg-white/20">{n}</a>)}</div></section>
    {sel&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={()=>setSel(null)}>
      <div className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
        <iframe title={sel.title} src={`https://drive.google.com/file/d/${sel.id}/preview`} allow="autoplay;fullscreen" className="h-[70vh] w-full rounded-xl"/>
        <p className="mt-3 font-semibold">{sel.title}</p>{sel.description&&<p className="text-sm text-zinc-400">{sel.description}</p>}
        <button className="mt-3 text-sm text-zinc-400" onClick={()=>setSel(null)}>Cerrar</button></div></div>}
  </div>
}

export default function App(){
  const [h,setH]=useState(location.hash)
  useEffect(()=>{const f=()=>setH(location.hash);addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[])
  return h==='#/admin'?<Admin/>:<Site/>
}
