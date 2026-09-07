(() => {
  const tabs = [...document.querySelectorAll('.side-tab')];
  const panels = [...document.querySelectorAll('[data-side-panel]')];
  const tracks = [...document.querySelectorAll('.track')];
  const audios = [...document.querySelectorAll('audio')];

  function showSide(side) {
    tabs.forEach((tab) => {
      const active = tab.dataset.side === side;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    panels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.sidePanel !== side);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showSide(tab.dataset.side));
  });

  tracks.forEach((track) => {
    const audio = track.querySelector('audio');
    const load = track.querySelector('.load-track');

    if (!audio || !load) return;

    const setActive = (state) => track.classList.toggle('active', state);

    audio.addEventListener('play', () => {
      audios.forEach((other) => {
        if (other !== audio) other.pause();
      });
      tracks.forEach((other) => {
        if (other !== track) other.classList.remove('active');
      });
      setActive(true);
    });

    audio.addEventListener('pause', () => {
      if (audio.ended || audio.currentTime === 0) setActive(false);
    });

    audio.addEventListener('ended', () => setActive(false));

    load.addEventListener('click', () => {
      audios.forEach((other) => {
        if (other !== audio) other.pause();
      });
      tracks.forEach((other) => {
        if (other !== track) other.classList.remove('active');
      });
      audio.scrollIntoView({ behavior: 'smooth', block: 'center' });
      audio.focus({ preventScroll: true });
      setActive(true);
    });
  });

  // Add a restrained tactile tilt to the hero cassette without turning the page into a game.
  const cassette = document.querySelector('.microcassette');
  if (cassette && window.matchMedia('(pointer:fine)').matches) {
    cassette.addEventListener('pointermove', (event) => {
      const rect = cassette.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cassette.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg)`;
    });

    cassette.addEventListener('pointerleave', () => {
      cassette.style.transform = '';
    });
  }

  // Keyboard shortcut: A/B switches the cassette side.
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select, button')) return;
    if (event.key.toLowerCase() === 'a') showSide('A');
    if (event.key.toLowerCase() === 'b') showSide('B');
  });
})();
