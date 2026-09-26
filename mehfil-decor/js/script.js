/* =========================================================
   MEHFIL — Master Site Scripts
   Mobile responsiveness, touch swipe, SEO/a11y & form handling
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile Navigation & Backdrop ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  var backdrop = document.querySelector('.nav-backdrop');

  // Create backdrop element if not in DOM
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openMenu() {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener('click', closeMenu);

    // Close when clicking nav links
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Reset when resizing to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 920 && nav.classList.contains('is-open')) {
        closeMenu();
      }
    }, { passive: true });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Active nav link by current page ---------- */
  var here = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.main-nav a[href]').forEach(function (a) {
    var target = (a.getAttribute('href').split('/').pop() || '').toLowerCase();
    if (target === here || (here === '' && target === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Back to top button ---------- */
  var toTop = document.querySelector('.back-to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Testimonial Carousel with Touch Swipe ---------- */
  var track = document.querySelector('.testimonial-slides');
  if (track) {
    var wrap = track.closest('.testimonial-wrap');
    var slides = track.querySelectorAll('.t-slide');
    var dotsWrap = document.querySelector('.t-controls');
    var index = 0;
    var total = slides.length;
    var timer = null;

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 't-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll('.t-dot');
        dots.forEach(function (d, di) { d.classList.toggle('is-active', di === index); });
      }
    }

    var prevBtn = document.querySelector('.t-prev');
    var nextBtn = document.querySelector('.t-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); resetTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); resetTimer(); });

    function startTimer() {
      if (!timer) {
        timer = setInterval(function () { goTo(index + 1); }, 6500);
      }
    }
    function stopTimer() {
      clearInterval(timer);
      timer = null;
    }
    function resetTimer() {
      stopTimer();
      startTimer();
    }

    startTimer();
    if (wrap) {
      wrap.addEventListener('mouseenter', stopTimer);
      wrap.addEventListener('mouseleave', startTimer);
    }

    // Touch Swipe Support for Mobile
    var touchStartX = 0;
    var touchStartY = 0;
    var touchDeltaX = 0;

    track.addEventListener('touchstart', function (e) {
      stopTimer();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      var currentX = e.touches[0].clientX;
      touchDeltaX = currentX - touchStartX;
    }, { passive: true });

    track.addEventListener('touchend', function () {
      if (Math.abs(touchDeltaX) > 40) {
        if (touchDeltaX < 0) {
          goTo(index + 1); // Swiped Left -> Next
        } else {
          goTo(index - 1); // Swiped Right -> Prev
        }
      }
      startTimer();
    }, { passive: true });
  }

  /* ---------- FAQ Accordion with Keyboard Support ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;

    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      var parentList = item.closest('.faq-list') || document;
      parentList.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        var otherA = other.querySelector('.faq-a');
        var otherQ = other.querySelector('.faq-q');
        if (otherA) otherA.style.maxHeight = null;
        if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Gallery Filter with URL Hash / Param Support ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    var cards = document.querySelectorAll('[data-category]');
    var buttons = filterBar.querySelectorAll('.filter-btn');

    function applyFilter(cat) {
      buttons.forEach(function (b) {
        var isMatch = b.getAttribute('data-filter') === cat;
        b.classList.toggle('is-active', isMatch);
      });
      cards.forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-category') === cat;
        card.style.display = show ? '' : 'none';
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-filter') || 'all';
        applyFilter(cat);
      });
    });

    // Check URL query param or hash on page load (e.g. gallery.html#birthday)
    var urlParams = new URLSearchParams(window.location.search);
    var filterParam = urlParams.get('category') || urlParams.get('filter') || window.location.hash.replace('#', '');
    if (filterParam) {
      var matchedBtn = filterBar.querySelector('[data-filter="' + filterParam.toLowerCase() + '"]');
      if (matchedBtn) {
        applyFilter(filterParam.toLowerCase());
      }
    }
  }

  /* ---------- Contact Form Handling & WhatsApp Integration ---------- */
  var form = document.getElementById('contact-form');
  var dateInput = document.getElementById('date');
  if (dateInput) {
    // Prevent booking past dates: Set min date to today in YYYY-MM-DD format
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  if (form) {
    // Clear error message when user starts typing or changes a field
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrap = field.closest('.form-field');
        if (wrap) wrap.classList.remove('has-error');
      });
      field.addEventListener('change', function () {
        var wrap = field.closest('.form-field');
        if (wrap) wrap.classList.remove('has-error');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll('[required]').forEach(function (field) {
        var wrap = field.closest('.form-field');
        var val = field.value.trim();
        var ok = val !== '';

        if (field.type === 'email' && ok) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        if (field.type === 'tel' && ok) {
          // Indian phone numbers / standard valid phone
          ok = /^[0-9+\-\s()]{7,15}$/.test(val);
        }

        if (wrap) wrap.classList.toggle('has-error', !ok);
        if (!ok) valid = false;
      });

      var success = document.getElementById('form-success');
      if (valid) {
        var name = (document.getElementById('name') || {}).value || '';
        form.reset();
        if (success) {
          success.classList.add('is-visible');
          success.innerHTML = '<strong>Booking Request Received!</strong> Thank you, ' +
            (name ? name + '. ' : '') +
            'Our local coordinator will call or message you within 60 minutes to confirm slot details.';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        if (success) success.classList.remove('is-visible');
        var firstErr = form.querySelector('.has-error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    // Direct WhatsApp booking helper
    var waBtn = document.getElementById('wa-book-btn');
    if (waBtn) {
      waBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var name = (document.getElementById('name') || {}).value || 'Guest';
        var phone = (document.getElementById('phone') || {}).value || '';
        var city = (document.getElementById('city') || {}).value || 'Not specified';
        var occasion = (document.getElementById('occasion') || {}).value || 'Event';
        var date = (document.getElementById('date') || {}).value || 'Upcoming';
        var budget = (document.getElementById('budget') || {}).value || '';
        var notes = (document.getElementById('message') || {}).value || '';

        var text = 'Hi Mehfil Decor! I want to book decoration:%0A' +
          '• Name: ' + encodeURIComponent(name) + '%0A' +
          '• Phone: ' + encodeURIComponent(phone) + '%0A' +
          '• Occasion: ' + encodeURIComponent(occasion) + '%0A' +
          '• City: ' + encodeURIComponent(city) + '%0A' +
          '• Date: ' + encodeURIComponent(date) +
          (budget ? '%0A• Budget: ' + encodeURIComponent(budget) : '') +
          (notes ? '%0A• Note: ' + encodeURIComponent(notes) : '');

        window.open('https://wa.me/911244567890?text=' + text, '_blank');
      });
    }
  }

  /* ---------- City Selector Quick Jump ---------- */
  var citySelect = document.getElementById('city-select');
  if (citySelect) {
    citySelect.addEventListener('change', function () {
      if (citySelect.value) {
        window.location.href = 'services.html?city=' + encodeURIComponent(citySelect.value);
      }
    });
  }
});
