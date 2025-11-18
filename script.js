// ===== FULL MERGED SCRIPT (UPDATED) =====
window.addEventListener('DOMContentLoaded', function () {

  /* -------------------------
        YEAR UPDATE (OLD)
  ------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------
      LOADING OVERLAY (NEW)
  ------------------------- */
  var loadingOverlay = document.getElementById('loadingOverlay');
  var progressBar = document.getElementById('progressBar');
  var loadingPercent = document.getElementById('loadingPercent');

  function updateProgress(p) {
    p = Math.min(100, Math.max(0, p));
    progressBar.style.width = p + '%';
    loadingPercent.textContent = Math.round(p) + '%';
  }

  function completeLoading() {
    updateProgress(100);
    setTimeout(() => loadingOverlay.classList.add('hidden'), 400);
  }

  var progress = 0;
  var loadingInterval = setInterval(() => {
    if (progress >= 90) return clearInterval(loadingInterval);
    progress += Math.random() * 5 + 2;
    updateProgress(progress);
  }, 150);

  /* -------------------------
    BACKGROUND SAVING (NEW)
  ------------------------- */
  var pageBody = document.getElementById('pageBody');

  function applySavedBackground() {
    var bg = localStorage.getItem('selectedBackground');
    pageBody.className = (!bg || bg === 'background') ? '' : 'bg-' + bg;
  }
  applySavedBackground();

  /* -------------------------
       PAGE SWITCHING (NEW)
  ------------------------- */
  var homePage = document.getElementById('homePage');
  var aboutPage = document.getElementById('aboutPage');
  var settingsPage = document.getElementById('settingsPage');
  var contactPage = document.getElementById('contactPage');

  function showPage(p) {
    homePage.style.display = 'none';
    aboutPage.style.display = 'none';
    settingsPage.style.display = 'none';
    contactPage.style.display = 'none';
    p.style.display = 'block';
  }

  /* -------------------------
       DASHBOARD MERGED
  ------------------------- */
  const dashBtn = document.getElementById('dashBtn');
  const dashPanel = document.getElementById('dashboardPanel');

  function openPanel() {
    dashPanel.classList.add('open');
    dashPanel.setAttribute('aria-hidden', 'false');
    dashBtn.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    dashPanel.classList.remove('open');
    dashPanel.setAttribute('aria-hidden', 'true');
    dashBtn.setAttribute('aria-expanded', 'false');
  }
  function togglePanel() {
    dashPanel.classList.contains('open') ? closePanel() : openPanel();
  }

  if (dashBtn && dashPanel) {
    dashBtn.addEventListener('click', e => {
      e.stopPropagation();
      togglePanel();
    });
    document.addEventListener('click', e => {
      if (!dashPanel.contains(e.target) && !dashBtn.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });
  }

  /* -------------------------
        PORT LOADING MERGED
  ------------------------- */
  var portContainer = document.getElementById('portContainer');
  var allPorts = [];
  var portsLoaded = false;

  function createFallbackImage(img) {
    img.onerror = function () {
      this.onerror = null; 
      this.src = 'placeholder-icon.png';
    };
    return img;
  }

  function renderPorts(list) {
    portContainer.innerHTML = '';

    list.forEach(item => {
      try {
        var a = document.createElement('a');
        a.className = 'port-card-link';
        a.href = item.link?.trim() ? item.link : '#';
        if (item.link?.trim()) a.target = '_blank';
        a.rel = 'noopener noreferrer';

        var card = document.createElement('div');
        card.className = 'port-card';

        var img = document.createElement('img');
        img.src = item.image?.trim() ? item.image : 'placeholder-icon.png';
        img.alt = item.title || 'item';
        img.loading = 'eager';
        createFallbackImage(img);

        var h2 = document.createElement('h2');
        h2.textContent = item.title || '';

        card.appendChild(img);
        card.appendChild(h2);
        a.appendChild(card);
        portContainer.appendChild(a);

      } catch (err) {
        console.error('Card build error:', err, item);
      }
    });
  }

  fetch('ports.json', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('Network error for ports.json');
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('ports.json must be an array');
      allPorts = data;
      renderPorts(allPorts);
      portsLoaded = true;
      clearInterval(loadingInterval);
      completeLoading();
    })
    .catch(err => {
      console.warn('Failed loading ports.json:', err);
      portContainer.innerHTML = `
        <div class="port-card">
          <strong>Could not load ports.json</strong>
          <p>Check console. Must be array of {image,title,link}.</p>
        </div>`;
      portsLoaded = true;
      clearInterval(loadingInterval);
      completeLoading();
    });

  setTimeout(() => {
    if (!portsLoaded) {
      portsLoaded = true;
      clearInterval(loadingInterval);
      completeLoading();
    }
  }, 8000);

  /* -------------------------
      LIVE SEARCH (NEW)
  ------------------------- */
  document.getElementById('liveSearch').addEventListener('input', function (e) {
    var q = e.target.value.toLowerCase();
    renderPorts(allPorts.filter(p => p.title.toLowerCase().includes(q)));
  });

  /* -------------------------
         MENU LINKS
  ------------------------- */
  document.getElementById('homeLink').addEventListener('click', e => {
    e.preventDefault();
    showPage(homePage);
    renderPorts(allPorts);
  });

  document.getElementById('aboutLink').addEventListener('click', e => {
    e.preventDefault();
    showPage(aboutPage);
  });

  document.getElementById('settingsLink').addEventListener('click', e => {
    e.preventDefault();
    loadSettingsPage();
    showPage(settingsPage);
  });

  document.getElementById('contactLink').addEventListener('click', e => {
    e.preventDefault();
    showPage(contactPage);
  });

  /* -------------------------
      SETTINGS PAGE (NEW)
  ------------------------- */
  function loadSettingsPage() {
    settingsPage.innerHTML = `
      <div class="glass-panel">
        <h2>⚙️ Settings</h2>
        <p>Background Image Selection</p>
        <div class="bg-button-container">
          <button class="bg-button" data-bg="background">Default</button>
          <button class="bg-button" data-bg="graduation">Graduation</button>
          <button class="bg-button" data-bg="checkerboard">Checkerboard</button>
          <button class="bg-button" data-bg="creepybg">Creepy BG</button>
          <button class="bg-button" data-bg="sillybg">Silly BG</button>
        </div>
      </div>
    `;

    var bgButtons = settingsPage.querySelectorAll('.bg-button');
    var savedBG = localStorage.getItem('selectedBackground') || 'background';

    bgButtons.forEach(btn => {
      if (btn.dataset.bg === savedBG) btn.classList.add('active');
    });

    bgButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        pageBody.className = '';
        bgButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        var bgName = this.dataset.bg;
        if (bgName !== 'background') pageBody.classList.add('bg-' + bgName);
        localStorage.setItem('selectedBackground', bgName);
      });
    });
  }

  /* -------------------------
        PROFILE SYSTEM (NEW)
  ------------------------- */
  var profileIcon = document.getElementById('profileIcon');
  var profileModal = document.getElementById('profileModal');
  var profileLarge = document.getElementById('profileLarge');
  var profileImageElement = document.getElementById('profileImage');
  var profilePicInput = document.getElementById('profilePicInput');
  var cropContainer = document.getElementById('cropContainer');
  var cropPreview = document.getElementById('cropPreview');
  var cropConfirm = document.getElementById('cropConfirm');
  var cropCancel = document.getElementById('cropCancel');
  var removePicBtn = document.getElementById('removePicBtn');
  var usernameInput = document.getElementById('usernameInput');
  var saveProfileBtn = document.getElementById('saveProfileBtn');
  var closeProfileBtn = document.getElementById('closeProfileBtn');

  var defaultPic = 'profile.png';
  var cropper = null;
  var croppedImageData = null;

  function loadProfileData() {
    var savedPic = localStorage.getItem('profilePic') || defaultPic;
    var savedName = localStorage.getItem('nickname') || '';
    profileImageElement.src = savedPic;
    profileLarge.src = savedPic;
    usernameInput.value = savedName;
  }
  loadProfileData();

  profileIcon.addEventListener('click', function () {
    document.getElementById('mainContent').style.display = 'none';
    profileModal.style.display = 'flex';
  });

  function closeProfileModal() {
    profileModal.style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    if (cropper) cropper.destroy();
    cropper = null;
    cropContainer.style.display = 'none';
    profilePicInput.value = '';
    croppedImageData = null;
    loadProfileData();
  }

  closeProfileBtn.addEventListener('click', closeProfileModal);
  profileModal.addEventListener('click', e => {
    if (e.target === profileModal) closeProfileModal();
  });

  removePicBtn.addEventListener('click', function () {
    profileLarge.src = defaultPic;
    profileImageElement.src = defaultPic;
    localStorage.setItem('profilePic', defaultPic);
  });

  profilePicInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      cropContainer.style.display = 'block';
      cropPreview.src = ev.target.result;

      if (cropper) cropper.destroy();
      cropper = new Cropper(cropPreview, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        background: false,
        cropBoxResizable: true
      });
    };
    reader.readAsDataURL(file);
  });

  cropConfirm.addEventListener('click', function () {
    if (!cropper) return;
    var canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
    croppedImageData = canvas.toDataURL('image/png');
    profileLarge.src = croppedImageData;
    cropper.destroy();
    cropper = null;
    cropContainer.style.display = 'none';
    profilePicInput.value = '';
  });

  cropCancel.addEventListener('click', function () {
    if (cropper) cropper.destroy();
    cropper = null;
    cropContainer.style.display = 'none';
    profilePicInput.value = '';
  });

  saveProfileBtn.addEventListener('click', function () {
    var name = usernameInput.value.trim();
    if (name) localStorage.setItem('nickname', name);

    var finalImg = croppedImageData || profileLarge.src || defaultPic;
    localStorage.setItem('profilePic', finalImg);
    profileImageElement.src = finalImg;

    croppedImageData = null;
    closeProfileModal();
    setTimeout(updateWelcomeMessage, 150);
  });

  /* -------------------------
      WELCOME MESSAGE (NEW)
  ------------------------- */
  var welcomeEl = document.getElementById('welcomeMessage');

  function updateWelcomeMessage() {
    var username = localStorage.getItem('nickname') || 'User';

    fetch('site-info.json')
      .then(r => r.json())
      .then(info => {
        welcomeEl.textContent = info.message
          .replace('{username}', username)
          .replace('{version}', info.version);
      })
      .catch(() => {
        welcomeEl.textContent = 'Welcome ' + username + '!';
      });
  }
  updateWelcomeMessage();

  /* -------------------------
        DISCORD WIDGET
  ------------------------- */
  function initCrate() {
    if (typeof Crate !== 'undefined') {
      new Crate({
        server: '1439699996676063357',
        channel: '1439699997758066774'
      });
    } else {
      setTimeout(initCrate, 200);
    }
  }
  initCrate();

});
