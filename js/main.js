(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  var hidePre = function () { $('#preloader').classList.add('done'); };
  window.addEventListener('load', function () { setTimeout(hidePre, 700); });
  setTimeout(hidePre, 4000);

  /* ---------- scroll: progress bar, nav, go-top ---------- */
  var topbar = $('#topbar'), nav = $('#nav'), bar = $('#progress'), goTop = $('#goTop');
  var links = $$('.menu a');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 40);
    if (topbar) topbar.classList.toggle('hide', y > 40);
    goTop.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- typed headline ---------- */
  var typed = $('#typed');
  if (typed) {
    var words = typed.dataset.words.split('|'), wi = 0, ci = 0, del = false;
    if (reduce) { typed.textContent = words[0]; }
    else (function tick() {
      var w = words[wi];
      typed.textContent = w.slice(0, ci);
      var wait = del ? 45 : 95;
      if (!del && ci === w.length) { del = true; wait = 1600; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; wait = 350; }
      else ci += del ? -1 : 1;
      setTimeout(tick, wait);
    })();
  }

  /* ---------- FAQ accordion ---------- */
  $$('.acc-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement, open = !item.classList.contains('open');
      $$('.acc').forEach(function (a) { a.classList.remove('open'); $('.acc-q', a).setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('open', open);
      q.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- 3D tilt on cards ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    /* magnetic buttons */
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- particle network (hero) ---------- */
  var cv = $('#particles');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, pts = [], mouse = { x: -999, y: -999 }, running = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(90, Math.floor(W * H / 16000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 1.8 + 0.6 });
    }
    size();
    window.addEventListener('resize', size);
    cv.parentElement.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    new IntersectionObserver(function (en) { running = en[0].isIntersecting; if (running) frame(); }).observe(cv);

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d = dx * dx + dy * dy;
        if (d < 14000) { p.x += dx * 0.012; p.y += dy * 0.012; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(147,197,253,.8)'; ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ax = p.x - q.x, ay = p.y - q.y, dd = ax * ax + ay * ay;
          if (dd < 14000) {
            ctx.strokeStyle = 'rgba(96,165,250,' + (0.3 * (1 - dd / 14000)) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------- contact form (opens the visitor's mail client) ---------- */
  var toast = $('#toast'), tt;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 4000); }
  var form = $('#contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var body = 'Name: ' + d.get('name') + '\nPhone: ' + (d.get('phone') || '-') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('message');
    window.location.href = 'mailto:info@velumaya.com?subject=' + encodeURIComponent(d.get('subject') || 'Website enquiry') + '&body=' + encodeURIComponent(body);
    say('Thank you! Opening your email app to send your message…');
    form.reset();
  });
})();
