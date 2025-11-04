/* BrightSmile Clinic — Booking + UI interactions */
const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

const bookingModal = qs('#bookingModal');
const bookingForm  = qs('#bookingForm');
const toast        = qs('#toast');

// Mobile nav
qs('#hamburger').addEventListener('click', () => qs('#navLinks').classList.toggle('show'));

// Open booking handlers
['#openBooking', '#ctaBook', ...qsa('.open-book')].forEach(sel => {
  const el = typeof sel === 'string' ? qs(sel) : sel;
  el && el.addEventListener('click', () => openModal());
});

// Close booking modal
bookingModal.addEventListener('click', e => {
  if (e.target.matches('[data-close], .modal-backdrop')) closeModal();
});

function openModal(){
  bookingModal.classList.add('active');
  bookingModal.setAttribute('open','');
  initDateTime();
}
function closeModal(){
  bookingModal.classList.remove('active');
  bookingModal.removeAttribute('open');
}

// Reveal-on-scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en => {
    if (en.isIntersecting) en.target.classList.add('visible');
  });
}, {threshold:.15});
qsa('.reveal').forEach(x => io.observe(x));

// Carousel
(() => {
  const track = qs('#carousel .carousel-track');
  const prev  = qs('#prev'); const next  = qs('#next');
  next.addEventListener('click',()=> track.scrollBy({left: track.clientWidth*.8, behavior:'smooth'}));
  prev.addEventListener('click',()=> track.scrollBy({left: -track.clientWidth*.8, behavior:'smooth'}));
})();

// Year in footer
qs('#year').textContent = new Date().getFullYear();

// Booking form
const STORAGE_KEY = 'brightsmile:appointments';

function initDateTime(){
  const date = qs('#date');
  const time = qs('#time');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  date.min = `${yyyy}-${mm}-${dd}`;

  // Generate time slots (09:00 - 19:30 every 30 min)
  time.innerHTML = '<option value="" disabled selected>Select a time</option>';
  for (let h=9; h<=19; h++){
    for (let m of [0,30]){
      const label = `${String(h).padStart(2,'0')}:${m===0?'00':'30'}`;
      time.innerHTML += `<option>${label}</option>`;
    }
  }
}

function setError(input, msg){
  const small = input.closest('.field').querySelector('.err');
  small.textContent = msg || '';
  input.style.borderColor = msg ? '#fda4af' : 'rgba(255,255,255,.12)';
}

bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(bookingForm).entries());
  let ok = true;

  if (!data.fullName || data.fullName.trim().length < 2) { setError(qs('#fullName'), 'Enter your full name'); ok=false; } else setError(qs('#fullName'));
  const phoneRe = /^\+?\d[\d\s-]{7,}$/;
  if (!phoneRe.test(data.phone||'')) { setError(qs('#phone'), 'Enter a valid phone'); ok=false; } else setError(qs('#phone'));
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setError(qs('#email'), 'Enter a valid email'); ok=false; } else setError(qs('#email'));
  if (!data.service) { setError(qs('#service'), 'Please choose a service'); ok=false; } else setError(qs('#service'));
  if (!data.date) { setError(qs('#date'), 'Pick a date'); ok=false; } else setError(qs('#date'));
  if (!data.time) { setError(qs('#time'), 'Pick a time'); ok=false; } else setError(qs('#time'));
  if (!qs('#policy').checked){ alert('Please accept the privacy policy.'); ok=false; }

  if (!ok) return;

  const record = {
    ...data,
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  list.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  toast.textContent = '🎉 Booking confirmed! Check your email for details.';
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2200);

  bookingForm.reset();
  closeModal();
});

// Accessibility: close modal on Escape
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && bookingModal.classList.contains('active')) closeModal();
});

// Fill time slots at load for safety
initDateTime();
