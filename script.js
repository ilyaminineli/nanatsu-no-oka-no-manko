(() => {
  const audioEls = [...document.querySelectorAll('audio')];
  const tabs = [...document.querySelectorAll('.side-tab')];
  const panels = [...document.querySelectorAll('[data-side-panel]')];
  const status = document.querySelector('#playback-status');
  const timecode = document.querySelector('#timecode');
  const masterAudio = document.querySelector('#master-audio');
  const allPlayButtons = [...document.querySelectorAll('.load-record')];

  function showSide(side) {
    tabs.forEach(tab => {
      const active = tab.dataset.side === side;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    panels.forEach(panel => panel.classList.toggle('hidden', panel.dataset.sidePanel !== side));
  }
  tabs.forEach(tab => tab.addEventListener('click', () => showSide(tab.dataset.side)));

  // Turn the loose observation into a proper archived paper slip using the existing design system.
  const deskNote = document.querySelector('.desk-note');
  if (deskNote) deskNote.classList.add('loose-label', 'label-black');

  function stopAll() {
    [...audioEls, masterAudio].filter(Boolean).forEach(a => { a.pause(); a.currentTime = 0; });
    document.querySelectorAll('.track.active,.record-row.active').forEach(el => el.classList.remove('active'));
    if (status) status.textContent = 'STANDBY';
  }

  audioEls.forEach(audio => {
    const row = audio.closest('.track');
    audio.addEventListener('play', () => {
      audioEls.forEach(other => { if (other !== audio) other.pause(); });
      document.querySelectorAll('.track.active').forEach(el => el.classList.remove('active'));
      row?.classList.add('active');
      if (status) status.textContent = `PLAYING / ${row?.querySelector('h3')?.textContent || 'UNKNOWN'}`;
    });
    audio.addEventListener('ended', () => { row?.classList.remove('active'); if (status) status.textContent = 'STANDBY'; });
    audio.addEventListener('timeupdate', () => {
      if (!timecode) return;
      const mm = n => String(Math.floor(n / 60)).padStart(2, '0');
      const ss = n => String(Math.floor(n % 60)).padStart(2, '0');
      timecode.textContent = `${mm(audio.currentTime)}:${ss(audio.currentTime)} / ${Number.isFinite(audio.duration) ? `${mm(audio.duration)}:${ss(audio.duration)}` : '--:--'}`;
    });
  });

  document.querySelectorAll('.load-track').forEach(btn => btn.addEventListener('click', () => {
    const audio = btn.closest('.track')?.querySelector('audio');
    if (!audio) return;
    audioEls.forEach(other => { if (other !== audio) other.pause(); });
    audio.play().catch(() => {});
    audio.closest('.track')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));

  allPlayButtons.forEach(btn => btn.addEventListener('click', () => {
    if (!masterAudio) return;
    masterAudio.src = encodeURI(btn.dataset.src || '');
    allPlayButtons.forEach(b => b.closest('.record-row')?.classList.remove('active'));
    btn.closest('.record-row')?.classList.add('active');
    masterAudio.play().catch(() => {});
    if (status) status.textContent = `PLAYING / ${btn.dataset.title || 'UNKNOWN'}`;
    window.scrollTo({ top: document.querySelector('.machine')?.offsetTop - 90 || 0, behavior: 'smooth' });
  }));

  document.querySelector('#stop-all')?.addEventListener('click', stopAll);
  document.querySelector('#rewind')?.addEventListener('click', () => {
    if (masterAudio) masterAudio.currentTime = Math.max(0, masterAudio.currentTime - 10);
  });
  document.querySelector('#fast-forward')?.addEventListener('click', () => {
    if (masterAudio) masterAudio.currentTime = Math.min(masterAudio.duration || masterAudio.currentTime + 10, masterAudio.currentTime + 10);
  });
  masterAudio?.addEventListener('ended', () => {
    if (status) status.textContent = 'STANDBY';
    document.querySelectorAll('.record-row.active').forEach(x => x.classList.remove('active'));
  });

  document.querySelectorAll('.reveal-note').forEach(btn => btn.addEventListener('click', () => {
    const out = btn.parentElement.querySelector('.secret-note');
    if (out) out.textContent = 'The tape was not found in a hill. It was found already listening.';
    btn.textContent = 'MARGIN NOTE OPEN';
  }));

  document.querySelectorAll('.tiny-trigger').forEach(btn => btn.addEventListener('click', () => {
    btn.textContent = btn.textContent === 'CHECK AGAIN' ? 'NO CHANGE' : 'CHECK AGAIN';
    btn.closest('.pin-card')?.classList.toggle('inspection');
  }));

  document.querySelector('.turn-note')?.addEventListener('click', e => {
    const slip = document.querySelector('.secret-slip');
    if (!slip) return;
    slip.hidden = !slip.hidden;
    e.currentTarget.textContent = slip.hidden ? 'TURN OVER' : 'RETURN FACE DOWN';
  });

  document.querySelector('#reveal-seven')?.addEventListener('click', () => {
    const out = document.querySelector('#seven-result');
    if (!out) return;
    out.textContent = '七つ。……八つ？';
    localStorage.setItem('m7-counted', 'true');
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select,button')) return;
    if (e.key.toLowerCase() === 'a') showSide('A');
    if (e.key.toLowerCase() === 'b') showSide('B');
    if (e.code === 'Space' && masterAudio) { e.preventDefault(); masterAudio.paused ? masterAudio.play().catch(()=>{}) : masterAudio.pause(); }
  });
})();
