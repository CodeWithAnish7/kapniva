// Fresh products on the home page (hidden if nothing to show)
const box=document.getElementById("home-products");
if(box){
  fetchCatalog().then(d=>{
    const list=(d.products||[]).slice(0,8);
    if(!list.length) return;
    document.getElementById("home-products-section").style.display="block";
    box.innerHTML=list.map(productCard).join("");
    box.querySelectorAll(".p-card").forEach(c=>c.addEventListener("click",()=>openProduct(list.find(p=>p.id===c.dataset.id))));
  }).catch(()=>{});
}
