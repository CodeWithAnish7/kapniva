// ===== KapNiva public catalog (read-only). No login, no orders. =====
const API_URL = "https://yzojmjdfbpnxpdpweoqc.supabase.co/functions/v1/public-catalog";

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(n){return "\u20B9"+Number(n).toLocaleString("en-IN");}

async function fetchCatalog(){
  try{
    const cached = sessionStorage.getItem("kn_catalog");
    if(cached){const o=JSON.parse(cached); if(Date.now()-o.t<60000) return o.d;}
  }catch(e){}
  const res = await fetch(API_URL);
  if(!res.ok) throw new Error("catalog failed");
  const data = await res.json();
  try{sessionStorage.setItem("kn_catalog",JSON.stringify({t:Date.now(),d:data}));}catch(e){}
  return data;
}

function productCard(p){
  const img = p.images && p.images[0] ? `<img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy">` : `<div class="ph">K</div>`;
  const off = p.discount > 0 ? `<span class="off">${Math.round(p.discount)}% off</span>` : "";
  const old = p.discount > 0 ? `<s>${money(p.price)}</s>` : "";
  return `<article class="p-card reveal show" data-id="${esc(p.id)}">
    <div class="p-img">${img}${off}</div>
    <div class="p-body"><small>${esc(p.shopName||"Local store")}${p.city? " &middot; "+esc(p.city):""}</small>
    <h3>${esc(p.name)}</h3><div class="price"><b>${money(p.finalPrice)}</b>${old}</div></div></article>`;
}

// ----- popups -----
function ensureModal(){
  let m=document.getElementById("kn-modal");
  if(m) return m;
  m=document.createElement("div"); m.id="kn-modal"; m.className="kn-modal";
  m.innerHTML='<div class="kn-box"><button class="kn-x" aria-label="Close">&times;</button><div id="kn-content"></div></div>';
  document.body.appendChild(m);
  m.addEventListener("click",e=>{if(e.target===m||e.target.classList.contains("kn-x")) m.classList.remove("open");});
  document.addEventListener("keydown",e=>{if(e.key==="Escape") m.classList.remove("open");});
  return m;
}
function showModal(html){const m=ensureModal();document.getElementById("kn-content").innerHTML=html;m.classList.add("open");}

function openApp(kind){
  const text = kind==="seller"
    ? "To register your shop, please download the KapNiva app from the Play Store. You can create your seller account, submit your shop details and start selling after verification."
    : "To place an order, please use the KapNiva app. Browse here, order in the app.";
  showModal(`<span class="eyebrow">App required</span><h3 style="font-size:30px;margin-bottom:10px">Get the <em>KapNiva</em> app</h3>
    <p style="color:var(--soft);margin-bottom:20px">${text}</p>
    <span class="btn btn-soon" style="margin-bottom:14px">Play Store &middot; coming soon</span>
    <p style="font-size:13px;color:var(--soft)">Want to know when it launches? Write to <a href="mailto:kapniva@gmail.com" style="color:var(--gold);text-decoration:underline">kapniva@gmail.com</a></p>`);
}

function openProduct(p){
  const imgs = (p.images&&p.images.length?p.images:[]);
  const main = imgs[0]?`<img id="kn-main" src="${esc(imgs[0])}" alt="${esc(p.name)}">`:`<div class="ph big">K</div>`;
  const thumbs = imgs.length>1?`<div class="thumbs">${imgs.map((u,i)=>`<img src="${esc(u)}" data-src="${esc(u)}" class="${i===0?"on":""}" alt="">`).join("")}</div>`:"";
  const tag=(arr)=>arr&&arr.length?arr.map(x=>`<span class="tg">${esc(x)}</span>`).join(""):"";
  showModal(`<div class="kn-prod"><div class="kn-gal">${main}${thumbs}</div>
    <div class="kn-info"><small>${esc(p.shopName||"Local store")}${p.city?" &middot; "+esc(p.city):""}</small>
    <h3>${esc(p.name)}</h3>
    <div class="price big"><b>${money(p.finalPrice)}</b>${p.discount>0?`<s>${money(p.price)}</s><span class="off2">${Math.round(p.discount)}% off</span>`:""}</div>
    ${p.category?`<p class="meta">Category: <b>${esc(p.category)}</b></p>`:""}
    ${p.fabric?`<p class="meta">Fabric: <b>${esc(p.fabric)}</b></p>`:""}
    ${p.sizes&&p.sizes.length?`<p class="meta">Sizes</p><div>${tag(p.sizes)}</div>`:""}
    ${p.colors&&p.colors.length?`<p class="meta">Colours</p><div>${tag(p.colors)}</div>`:""}
    ${p.description?`<p class="desc">${esc(p.description)}</p>`:""}
    <button class="btn btn-primary" id="kn-order" style="margin-top:18px">Order in the KapNiva app &rarr;</button></div></div>`);
  const m=document.getElementById("kn-content");
  m.querySelectorAll(".thumbs img").forEach(t=>t.addEventListener("click",()=>{document.getElementById("kn-main").src=t.dataset.src;m.querySelectorAll(".thumbs img").forEach(x=>x.classList.remove("on"));t.classList.add("on");}));
  document.getElementById("kn-order").addEventListener("click",()=>openApp("order"));
}

document.addEventListener("click",e=>{
  const a=e.target.closest("[data-app]"); if(a){e.preventDefault();openApp(a.dataset.app);}
});
