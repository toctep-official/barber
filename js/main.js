(() => {
  // ---------- Настройки: меняйте под клиента ----------
  const PHONE = '79661041166';            // для WhatsApp, без плюса
  const TIMEZONE = 'Europe/Moscow';

  const nowLocal = () => new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));

  // ---------- Меню на телефоне ----------
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open); // страница под меню не листается
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // ---------- Кнопки внизу экрана прячутся, когда блок записи уже на экране ----------
  const dock = document.getElementById('dock');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => dock.classList.toggle('is-hidden', entry.isIntersecting))
      .observe(document.getElementById('booking'));
  }

  // ---------- Прайс: будни / выходные ----------
  // У строк с разной ценой есть data-weekday и data-weekend, остальные не меняются
  const dayButtons = [...document.querySelectorAll('.days__btn')];
  const sums = document.querySelectorAll('.price__sum span[data-weekday]');
  const setDay = (day) => {
    dayButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.day === day)));
    sums.forEach((el) => {
      const value = el.dataset[day];
      if (el.textContent === value) return;
      el.textContent = value;
      // Короткая вспышка, чтобы было видно, какие цены поменялись
      el.classList.remove('is-changed');
      void el.offsetWidth;
      el.classList.add('is-changed');
    });
  };
  dayButtons.forEach((b, i) => {
    b.addEventListener('click', () => setDay(b.dataset.day));
    // Стрелки переключают, как в обычной группе радиокнопок
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = dayButtons[(i + 1) % dayButtons.length];
      setDay(next.dataset.day);
      next.focus();
    });
  });
  // Сегодня суббота или воскресенье — сразу показываем цены выходного дня
  const today = nowLocal().getDay();
  if (today === 0 || today === 6) setDay('weekend');

  // ---------- Запись: из выбранных кнопок собираем сообщение ----------
  const picker = document.getElementById('picker');
  const preview = document.getElementById('picker-preview');
  const sendWa = document.getElementById('send-wa');
  const sendTg = document.getElementById('send-tg');

  const message = () => {
    const data = new FormData(picker);
    return `Здравствуйте! Хочу записаться: ${data.get('service')}, ${data.get('when')}.`;
  };
  const update = () => {
    const text = message();
    preview.textContent = `«${text}»`;
    sendWa.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  };
  picker.addEventListener('change', update);
  picker.addEventListener('submit', (e) => e.preventDefault());
  update();

  // В Телеграм нельзя передать текст ссылкой — копируем его, чтобы осталось только вставить
  sendTg.addEventListener('click', () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(message()).then(() => {
      preview.textContent = `«${message()}» — текст скопирован, вставьте его в чат.`;
    }).catch(() => {});
  });
})();
