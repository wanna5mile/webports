/* -----------------------------------------
  FIXED: NON-REPEATING FULLSCREEN BACKGROUND
  + ADAPTIVE SCROLL SPEED W/O BUGGY RESIZE
----------------------------------------- */
(function () {
  const body = document.getElementById('pageBody');
  if (!body) return;

  let bgImg = new Image();
  let naturalW = 0, naturalH = 0;

  function getCurrentBG() {
    const cs = getComputedStyle(body);
    const url = cs.backgroundImage;
    if (!url || url === 'none') return null;
    return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
  }

  /* -----------------------------
      SCALE TO ALWAYS FILL VIEW
      (NO REPEAT, NO SCROLL GAP)
  ----------------------------- */
  function applyScaling() {
    if (!naturalW || !naturalH) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const imgRatio = naturalW / naturalH;
    const viewRatio = vw / vh;

    // Stretch width first
    let finalW = vw;
    let finalH = finalW / imgRatio;

    // If not tall enough, stretch height instead
    if (finalH < vh) {
      finalH = vh;
      finalW = finalH * imgRatio;
    }

    body.style.backgroundSize = `${finalW}px ${finalH}px`;
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center top";
  }

  /* -----------------------------------------
       ADAPTIVE SCROLLING THAT NEVER
       OUTSCROLLS THE BACKGROUND IMAGE
  ----------------------------------------- */
  let targetScroll = 0;
  let currentScroll = 0;
  let speedFactor = 0.4;

  function recalcScrollSpeed() {
    const totalHeight = document.body.scrollHeight;
    const viewport = window.innerHeight;

    // Ensures scrolling slows down near bottom
    const scrollRatio = totalHeight / viewport;

    // Clamp: slower scroll when page is short
    speedFactor = Math.max(0.2, Math.min(1.0, scrollRatio * 0.15));
  }

  function animateScroll() {
    currentScroll += (targetScroll - currentScroll) * 0.1;
    window.scrollTo(0, currentScroll);
    requestAnimationFrame(animateScroll);
  }
  animateScroll();

  window.addEventListener('wheel', e => {
    targetScroll += e.deltaY * speedFactor;

    // Never scroll past page
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (targetScroll < 0) targetScroll = 0;
    if (targetScroll > maxScroll) targetScroll = maxScroll;
  });

  /* -----------------------------
       INITIALIZE BACKGROUND
  ----------------------------- */
  function loadBGAndInit() {
    const url = getCurrentBG();
    if (!url) return;

    bgImg.onload = () => {
      naturalW = bgImg.naturalWidth;
      naturalH = bgImg.naturalHeight;

      applyScaling();
      recalcScrollSpeed();
    };

    bgImg.src = url;
  }

  window.addEventListener('resize', () => {
    applyScaling();
    recalcScrollSpeed();
  });

  loadBGAndInit();

  // Re-run when settings page changes background
  const observer = new MutationObserver(loadBGAndInit);
  observer.observe(body, { attributes: true, attributeFilter: ['class', 'style'] });

})();
