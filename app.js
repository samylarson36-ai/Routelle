(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* route preview */
  var route = $('#route'), done = $('#done'), courier = $('#courier'), pins = $('#pins');
  var list = $('#stops'), eta = $('#eta');
  var L = route.getTotalLength();
  var NS = 'http://www.w3.org/2000/svg';
  var stops = [
    { n: 'Bloom & Co.', t: 0.12, h: '09:10' },
    { n: 'Oakline Pharmacy', t: 0.28, h: '09:32' },
    { n: 'Marta\u2019s Bakery', t: 0.45, h: '09:58' },
    { n: 'Studio Nine', t: 0.62, h: '10:21' },
    { n: 'Harbor Books', t: 0.8, h: '10:47' },
    { n: 'Delmar Caf\u00e9', t: 0.97, h: '11:15' }
  ];
  stops.forEach(function (s, i) {
    var p = route.getPointAtLength(s.t * L);
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 7);
    c.setAttribute('fill', '#fff'); c.setAttribute('stroke', '#14123A'); c.setAttribute('stroke-width', 3);
    pins.appendChild(c); s.pin = c;
    var li = document.createElement('li');
    li.innerHTML = '<b></b><span>' + s.n.replace(/&/g, '&amp;') + '</span><time>' + s.h + '</time>';
    list.appendChild(li); s.li = li;
  });

  function render(p) {
    var pt = route.getPointAtLength(p * L);
    courier.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ')');
    done.style.strokeDasharray = (p * L) + ' ' + L;
    stops.forEach(function (s) {
      var d = p >= s.t;
      s.li.classList.toggle('done', d);
      s.pin.setAttribute('fill', d ? '#3B2BFF' : '#fff');
    });
    var left = Math.round((1 - p) * 92);
    eta.textContent = p > 0.99 ? 'Route complete' : left + ' min to the last stop';
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    render(0.62);
  } else {
    var DURATION = 16000, PAUSE = 2200, start = null;
    (function frame(ts) {
      if (start === null) start = ts;
      var el = (ts - start) % (DURATION + PAUSE);
      render(Math.min(el / DURATION, 1));
      requestAnimationFrame(frame);
    })(performance.now());
  }

  /* pricing toggle */
  var btns = $$('.toggle button');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var annual = b.dataset.mode === 'annual';
      btns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on);
      });
      $$('.price b[data-m]').forEach(function (el) {
        el.textContent = '$' + (annual ? el.dataset.a : el.dataset.m);
      });
    });
  });

  /* demo form: set data-endpoint on the form (Formspree, Web3Forms...) */
  var form = $('#demoForm'), msg = $('.msg', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), mail = form.email.value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(mail)) {
      msg.textContent = 'Please add your name and a valid email address.';
      return;
    }
    if (form.botcheck.value) return;
    var ok = function () {
      msg.textContent = 'Thanks ' + name.split(' ')[0] + '. We will email you within one working day.';
      form.reset();
    };
    var endpoint = form.dataset.endpoint;
    if (!endpoint) { ok(); return; }
    msg.textContent = 'Sending...';
    fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
      .then(function (r) { if (!r.ok) throw 0; ok(); })
      .catch(function () { msg.textContent = 'Something went wrong. Please try again or email hello@routelle.com.'; });
  });
})();
