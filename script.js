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




// Robust section-aware navigation highlighting.
const trackedLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
const trackedSections = trackedLinks
  .map(link => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter(item => item.section);

function activateNav(id) {
  trackedLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (visible.length) activateNav(visible[0].target.id);
}, {
  rootMargin: "-18% 0px -58% 0px",
  threshold: [0, .1, .25, .5]
});

trackedSections.forEach(({ section }) => sectionObserver.observe(section));

// =========================================================
// Photo Gallery Carousel
// =========================================================
(function () {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = [...track.children];
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dotsContainer = document.querySelector('.carousel-dots');
  let current = 0;
  let autoTimer = null;

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = [...dotsContainer.children];

  function goTo(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const gallery = document.querySelector('.gallery-carousel');
    const rect = gallery.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  // Touch / swipe support
  let startX = 0;
  let isDragging = false;
  const viewport = document.querySelector('.carousel-viewport');

  viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAuto();
    }
  });

  // Auto-play: advances every 5 seconds, pauses on hover
  function startAuto() { autoTimer = setInterval(next, 5000); }
  function stopAuto() { clearInterval(autoTimer); }
  function resetAuto() { stopAuto(); startAuto(); }

  const carouselEl = document.querySelector('.gallery-carousel');
  carouselEl.addEventListener('mouseenter', stopAuto);
  carouselEl.addEventListener('mouseleave', startAuto);
  startAuto();
})();
