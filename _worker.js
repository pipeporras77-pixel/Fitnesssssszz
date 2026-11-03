// FORMA AI · Cloudflare Pages (Advanced Mode)
// Workers AI binding: AI. No API tokens in the browser.
// Note: Public deployment is not authenticated. Cloudflare Access is recommended
// if only one person should have access to this website and its AI quota.
const MODEL='@cf/meta/llama-4-scout-17b-16e-instruct';
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const respond=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:JSON_HEADERS});
const safe=(v,max=200)=>String(v??'').slice(0,max);
const number=(v,max=9999)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(0,n)):0;};
const toInt=v=>Math.round(number(v));
function cleanAI(text){
  const source=typeof text==='string'?text:JSON.stringify(text||'');
  const start=source.indexOf('{'),end=source.lastIndexOf('}');
  if(start<0||end<=start)throw Error('La IA no devolvió información estructurada');
  const x=JSON.parse(source.slice(start,end+1));
  if(x.is_food===false||x.isFood===false)return {isFood:false};
  if(!x.dish&&!x.name)throw Error('La IA no pudo reconocer el plato');
  const items=Array.isArray(x.ingredients)?x.ingredients.slice(0,10).map(i=>({name:safe(i.name,65),amount:safe(i.amount,40),calories:toInt(i.calories),protein:number(i.protein,999),carbs:number(i.carbs,999),fat:number(i.fat,999)})):[];
  const total=x.total&&typeof x.total==='object'?x.total:x;
  return {isFood:true,name:safe(x.dish||x.name,80),calories:toInt(total.calories),protein:number(total.protein,999),carbs:number(total.carbs,999),fat:number(total.fat,999),ingredients:items,note:safe(x.note||'Estimación visual aproximada. Verifica porciones e ingredientes.',220)};
}
const MANIFEST={id:'/',name:'FORMA AI · Personal Fitness',short_name:'FORMA AI',description:'Tu diario privado de alimentación, actividad y progreso.',start_url:'/',scope:'/',display:'standalone',background_color:'#090d16',theme_color:'#090d16',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]};

// Serve the PWA icons directly from this Worker, so Android only uploads 2 files.
const BUNDLED_ICONS={
  '/icon-192.png':'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAFK0lEQVR4nO3drY5dVRjH4TVkTEXrGNHUIPAlJKiKCkKQmNZg0CQ1JCQNV4BvcAg03EEVop4KLoEgKqubFMMmO5NzZoYze33s9X8e1fRzZ/r+9rv2mdPp2Z27F+8LhPqg9wVATwIgmgCIJgCiCYBoAiCaAIgmAKIJgGgCIJoAiCYAogmAaAIgmgCIJgCiCYBoAiDaee8LaOHV22e9L2G3Ht170fsSqjqb7d8EG/b6ZopiigCuG/o37163uZAJXZw/vPLH9x7DbgM4NvSGvb5jUewxht0FcGjwDX0/h2LYUwi7CcDgj22vIQwfwOXBN/TjuxzDyCEMHcB6+A3+/qxDGDWCYT8RZvj3b/33NurL08NtAIM/p1G3wVAbwPDPa9RtMEwAhn9+I0YwxBFo+WAY/BzLkaj3caj7BjD8mZa/796boGsAhj/bCBF0C8DwU0r/CLoEYPhZ6xlB8wB6n/kYW+v56HYEcvdnrdc8NA3A0Yer9DgKNQvA8HMTrSNoEoBzP6doMTdNj0Du/txEyzmpHoCjD6dodRTq/lYI6KlqAO7+3EaLLWADEK1aAF75YUu15qn6BnD84TZqz48jENGqBODhly3VfBi2AYgmAKJtHoDjDzXUOgbZAEQTANGm+z/Cfv/17/LTd3/2voyTff/zw/LZlxe9LyOGDUC0TQPwAExNNR6EbQCiCYBoAiCaAIgmAKIJgGgCIJoAiCYAogmAaNO9GW4rz3/5pHz6+Ye9L4PKbACiCYBoAiCaAIgmAKIJgGgCIJoAiCYAogmAaAIgmgCI5s1wR/z4zR9N/7yvvv2ofP3Dx03/TGwAwgmAaAIgmgCIJgCiCYBoAiCaAIgmAKIJgGgCIJoAiObNcEf4ynAZbACiCYBoAiCaAIgmAKIJgGgCIJoAiCYAogmAaAIgmgCIJgCiCYBoAiCaAIgmAKIJgGgCIJoAiCYAogmAaAIgmq8LFO7Jg5cHv/+3v75ofCV9CCDUscG//OOzhyCAMNcN/rGfP2sIngGC/N/h3+rXjkwAIbYY4BkjEADRpnsGePz0fnn89H7vyxjKlnfuJw9eTvU8YAMQTQCTq3Fun+lZQABEEwDRBEA0ARBNAEQTwORqvGbv8wAwCQEE2PKOPdPdvxQBEG7TAB7de1FKKeXi/OGWvy0b2OLO3fvuv8zVMmdbsAGC3GaAew9/LdO9G5SrLYN80/fzzDr4CwGEui6E2Qd/IYBwKYN+zObPAB6EqaHGA3ApHoIJJwCiVQnAMYgt1Tr+lGIDEK56ALYAt1F7fqoFUGNdkavWPDkCEa1qAB6GuY2aD78LG4Bo1QOwBThFi7t/KY03gAi4iZZz0iQArwhxihZz02wDOApxE62OPoumRyARcJXWw19Kx1eBRMBar3loHoDnAa7Sej66bABHIdZ6HH0W3Y5AIqCUvsNfSufPBIsgW+/hL2WAt0KIINMIw19KKWd37l6873oF/3r19tl/337z7nW/C6Gq9Y2u9/CXMsAGWKw/GLbBnEYb/lIGCqAUEcxsxOEvZaAj0GWORHMYdfAXQ22ANdtg/0Yf/lIG3gCL9SYoxTbYg8s3rFGHv5QdBLC4HEIpYhjJoS098uAvdhPAQghj2evgL3YXwOJQCKWIoYVjz2R7GvzFbgNYOxbDQhSnu+4FiD0O/doUAaxdFwO3t/ehX5sugENEcbqZhv2QiADgmGE/EQYtCIBoAiCaAIgmAKIJgGgCIJoAiCYAogmAaAIgmgCIJgCiCYBoAiCaAIgmAKL9A3EFijDQLApgAAAAAElFTkSuQmCC',
  '/icon-512.png':'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'
};
const SW=`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',()=>{});`;
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(Object.prototype.hasOwnProperty.call(BUNDLED_ICONS,url.pathname)){
      const binary=atob(BUNDLED_ICONS[url.pathname]);
      const bytes=Uint8Array.from(binary,ch=>ch.charCodeAt(0));
      return new Response(bytes,{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=604800'}});
    }
    if(url.pathname==='/manifest.webmanifest')return new Response(JSON.stringify(MANIFEST),{headers:{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'public,max-age=3600'}});
    if(url.pathname==='/sw.js')return new Response(SW,{headers:{'Content-Type':'application/javascript; charset=utf-8','Service-Worker-Allowed':'/','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
    if(url.pathname==='/api/status')return respond({ok:true,aiConfigured:!!env.AI,model:MODEL});
    if(url.pathname==='/api/analyze'){
      if(request.method!=='POST')return respond({error:'Método no permitido.'},405);
      // Restrict browser requests from other domains (not a substitute for authentication).
      const origin=request.headers.get('Origin');
      if(origin&&origin!==url.origin)return respond({error:'Origen no autorizado.'},403);
      const secSite=request.headers.get('Sec-Fetch-Site');
      if(secSite==='cross-site')return respond({error:'Origen no autorizado.'},403);
      if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return respond({error:'Formato inválido.'},415);
      if(!env.AI)return respond({error:'Falta activar la conexión AI. En Cloudflare Pages abre Settings > Bindings > Add > Workers AI y usa el nombre AI. Después vuelve a desplegar el ZIP.'},503);
      const length=Number(request.headers.get('content-length')||0);
      if(length>1_500_000)return respond({error:'La imagen supera el tamaño permitido.'},413);
      try{
        const raw=await request.text();
        if(raw.length>1_500_000)return respond({error:'La imagen supera el tamaño permitido.'},413);
        const body=JSON.parse(raw),image=body.image;
        if(typeof image!=='string'||image.length<100||image.length>1_400_000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image))return respond({error:'Envía una imagen JPG comprimida desde la aplicación.'},400);
        const instruction=`Eres un analizador visual de platos de comida. Responde SOLAMENTE un objeto JSON válido sin markdown, en español. Analiza la fotografía, identifica un plato y estima porciones usando lo visible. No inventes certeza, balanzas ni ingredientes invisibles. Si no hay alimentos comestibles, responde {"is_food":false}. Si hay alimentos responde exactamente esta estructura: {"is_food":true,"dish":"nombre breve del plato","ingredients":[{"name":"ingrediente","amount":"porción aproximada en gramos o unidades","calories":120,"protein":5,"carbs":14,"fat":4}],"total":{"calories":350,"protein":17,"carbs":40,"fat":12},"note":"Razón de incertidumbre en porciones"}. Los macros en gramos y calorías son aproximaciones para todo el plato, usando estimaciones nutricionales razonables. Calcula el total de los ingredientes identificados, sin inventar información que la imagen no permita ver. Limita ingredients a 8. Responde exclusivamente JSON.`;
        const messages=[{role:'system',content:'Analiza fotografías de alimentos para un diario informativo. Los resultados son estimaciones y no recomendaciones dietarias.'},{role:'user',content:[{type:'text',text:instruction},{type:'image_url',image_url:{url:image}}]}];
        const response=await env.AI.run(MODEL,{messages,max_tokens:650,temperature:0.15});
        const cleaned=cleanAI(response?.response??response?.result??response);
        return respond(cleaned);
      }catch(err){
        console.error('FORMA AI error:',err?.message||err);
        return respond({error:'No se pudo interpretar la fotografía. Revisa que esté clara, o inténtalo de nuevo. Si es la primera vez, comprueba que Workers AI esté activado y tenga cuota disponible.'},502);
      }
    }
    if(url.pathname.startsWith('/api/'))return respond({error:'Ruta no encontrada.'},404);
    return env.ASSETS.fetch(request);
  }
};
