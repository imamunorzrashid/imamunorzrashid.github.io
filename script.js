const reveals=document.querySelectorAll(".reveal");
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
reveals.forEach(el=>observer.observe(el));

const progress=document.querySelector(".progress");
window.addEventListener("scroll",()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(scrollY/h*100)+"%"});

const menu=document.querySelector(".menu-btn"),links=document.querySelector(".nav-links");
menu.addEventListener("click",()=>links.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));

let counted=false;
const stats=document.querySelector(".stats");
const countObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!counted){counted=true;document.querySelectorAll("[data-count]").forEach(el=>{const target=+el.dataset.count;let start=0;const step=target/50;const timer=setInterval(()=>{start+=step;if(start>=target){start=target;clearInterval(timer)}el.textContent=target%1?start.toFixed(2):Math.floor(start)},25)})}},{threshold:.4});
countObserver.observe(stats);

// Highlight the navigation item for the section currently in view.
const navAnchors=[...document.querySelectorAll(".nav-links a[href^='#']")];
const sectionMap=navAnchors
  .map(a=>({a,section:document.querySelector(a.getAttribute("href"))}))
  .filter(item=>item.section);

const setActiveNav=()=>{
  const probe=window.scrollY+window.innerHeight*0.34;
  let current=sectionMap[0];
  sectionMap.forEach(item=>{
    if(item.section.offsetTop<=probe) current=item;
  });
  navAnchors.forEach(a=>a.classList.remove("active"));
  if(current) current.a.classList.add("active");
};
window.addEventListener("scroll",setActiveNav,{passive:true});
window.addEventListener("resize",setActiveNav);
setActiveNav();
