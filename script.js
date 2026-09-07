(() => {
  const tabs = [...document.querySelectorAll('.side-tab')];
  const panels = [...document.querySelectorAll('[data-side-panel]')];
  const tracks = [...document.querySelectorAll('.track')];
  const audios = [...document.querySelectorAll('audio')];
  const status = document.querySelector('#playback-status');
  const revealButtons = [...document.querySelectorAll('.reveal-note')];
  const tinyTriggers = [...document.querySelectorAll('.tiny-trigger')];
  const archiveItems = [...document.querySelectorAll('.index-item')];
  const archiveOutput = document.querySelector('#archive-output');
  const archiveDetail = document.querySelector('#archive-detail');

  const archiveMessages = {
    '01': 'The pole does not close its eyes. It still sleeps. This was written twice.',
    '02': 'The test contains a test for whether the test has ended. It has not.',
    '03': 'Quiet noise was recorded at a level considered impossible.',
    '04': 'Something in the recording appears to answer before the question is spoken.',
    '05': 'The first tape is labeled 音１. A handwritten margin says: “not first.”',
    '06': '777 is listed as an error code, a room number, and once as a duration.',
    '07': 'A second song about the pole was found on a copy of the first tape.',
    '08': 'The archive calls this “音3”. No record marked 音2 has been recovered.',
    '09': 'The filename differs from the printed title. The source copy was not renamed.'
  };

  function showSide(side) {
    tabs.forEach((tab) => {
      const active = tab.dataset.side === side;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => panel.classList.toggle('hidden', panel.dataset.sidePanel !== side));
    if (status) status.textContent = `SIDE ${side} / READY`;
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => showSide(tab.dataset.side)));

  tracks.forEach((track) => {
    const audio = track.querySelector('audio');
    const load = track.querySelector('.load-track');
    if (!audio || !load) return;

    const setActive = (state) => track.classList.toggle('active', state);
    const stopOthers = () => {
      audios.forEach((other) => { if (other !== audio) other.pause(); });
      tracks.forEach((other) => { if (other !== track) other.classList.remove('active'); });
    };

    audio.addEventListener('play', () => {
      stopOthers();
      setActive(true);
      if (status) status.textContent = `${String(track.dataset.track).padStart(2, '0')} / PLAYING`;
    });
    audio.addEventListener('pause', () => {
      if (!audio.ended && audio.currentTime > 0 && status) status.textContent = `${String(track.dataset.track).padStart(2, '0')} / PAUSED`;
      if (audio.ended || audio.currentTime === 0) setActive(false);
    });
    audio.addEventListener('ended', () => {
      setActive(false);
      if (status) status.textContent = `${String(track.dataset.track).padStart(2, '0')} / COMPLETE`;
    });
    load.addEventListener('click', () => {
      stopOthers();
      setActive(true);
      audio.scrollIntoView({ behavior: 'smooth', block: 'center' });
      audio.focus({ preventScroll: true });
      if (status) status.textContent = `${String(track.dataset.track).padStart(2, '0')} / LOADED`;
    });
  });

  revealButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.story-card');
      const note = card?.querySelector('.secret-note');
      if (!note) return;
      const revealed = note.dataset.revealed === '1';
      note.textContent = revealed ? '' : 'MARGIN NOTE: The tape was not found in a hill. It was found already listening.';
      note.dataset.revealed = revealed ? '0' : '1';
      button.textContent = revealed ? 'REVEAL MARGIN NOTE' : 'HIDE MARGIN NOTE';
    });
  });

  tinyTriggers.forEach((button) => {
    button.addEventListener('click', () => {
      const answers = button.closest('.story-card')?.querySelector('.answers');
      if (!answers) return;
      answers.classList.toggle('flash');
      button.textContent = answers.classList.contains('flash') ? 'STATUS: STILL UNKNOWN' : 'CHECK AGAIN';
      window.setTimeout(() => answers.classList.remove('flash'), 850);
    });
  });

  archiveItems.forEach((item) => {
    item.addEventListener('click', () => {
      const key = item.dataset.archive;
      if (archiveOutput) archiveOutput.textContent = `${key} / ${item.querySelector('strong')?.textContent ?? 'UNKNOWN'}`;
      if (archiveDetail) archiveDetail.textContent = archiveMessages[key] ?? 'No note survived.';
      archiveItems.forEach((other) => other.classList.toggle('selected', other === item));
    });
  });

  const cassette = document.querySelector('.cassette-object');
  if (cassette && window.matchMedia('(pointer:fine)').matches) {
    cassette.addEventListener('pointermove', (event) => {
      const rect = cassette.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cassette.style.transform = `translate(-50%, -48%) perspective(900px) rotateX(${y * -2}deg) rotateY(${x * 3}deg) rotateZ(-1deg)`;
    });
    cassette.addEventListener('pointerleave', () => { cassette.style.transform = ''; });
  }

  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select, button')) return;
    const key = event.key.toLowerCase();
    if (key === 'a') showSide('A');
    if (key === 'b') showSide('B');
    if (key === 'm') document.querySelector('#record')?.scrollIntoView({ behavior: 'smooth' });
    if (key === 'p') document.querySelector('#tracks')?.scrollIntoView({ behavior: 'smooth' });
  });
})();
