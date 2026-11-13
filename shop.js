let ALL=[], CAT="All", Q="";
const grid=document.getElementById("p-grid");
function render(){
  const list=ALL.filter(p=>(CAT==="All"||p.category===CAT)&&(!Q||(p.name+" "+(p.shopName||"")+" "+(p.category||"")).toLowerCase().includes(Q)));
  document.getElementById("count").textContent=list.length+" product"+(list.length===1?"":"s");
  if(!list.length){grid.innerHTML='<div class="empty">No products found. New styles from local stores are added regularly.</div>';return;}
  grid.innerHTML=list.map(productCard).join("");
  grid.querySelectorAll(".p-card").forEach(c=>c.addEventListener("click",()=>openProduct(ALL.find(p=>p.id===c.dataset.id))));
}
function chips(){
  const cats=["All",...Array.from(new Set(ALL.map(p=>p.category).filter(Boolean)))];
  const box=document.getElementById("chips");
  box.innerHTML=cats.map(c=>`<button class="fchip ${c===CAT?"on":""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  box.querySelectorAll(".fchip").forEach(b=>b.addEventListener("click",()=>{CAT=b.dataset.c;chips();render();}));
}
function shops(list){
  const s=document.getElementById("shops"); if(!s) return;
  if(!list||!list.length){s.parentElement.style.display="none";return;}
  s.innerHTML=list.map(x=>`<div class="shop-card">${x.logo?`<img src="${esc(x.logo)}" alt="" loading="lazy">`:`<div class="ph sm">K</div>`}<b>${esc(x.name)}</b><small>${esc(x.city||"")}</small></div>`).join("");
}
document.getElementById("q").addEventListener("input",e=>{Q=e.target.value.trim().toLowerCase();render();});
fetchCatalog().then(d=>{ALL=d.products||[];chips();render();shops(d.shops);}).catch(()=>{
  grid.innerHTML='<div class="empty">We could not load the products right now. Please try again in a moment.</div>';
});
