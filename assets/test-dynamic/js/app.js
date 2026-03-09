/**
 * Proscreen HTML5 ZIP Test — Application Logic
 *
 * Testaa: kello, säädata, paikallinen video/canvas, CSS-animaatiot,
 * ProscreenPlay()-callback, diagnostiikka.
 */
(function() {
  'use strict';

  var startTime = Date.now();
  var weatherState = { status: 'pending', lastFetch: null, data: null };

  // ─── Finnish day/month names ─────────────────────────────────
  var DAY_NAMES = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
  var MONTH_NAMES = [
    'tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta',
    'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta',
    'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'
  ];

  // ─── Clock ───────────────────────────────────────────────────
  function updateClock() {
    var now = new Date();
    var day = DAY_NAMES[now.getDay()];
    var date = now.getDate();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');

    var clockEl = document.getElementById('clock-time');
    var dateEl = document.getElementById('clock-date');
    if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;
    if (dateEl) dateEl.textContent = day + ' ' + date + '.' + month + '.' + year;
  }

  // ─── Weather (OpenWeatherMap, Helsinki default) ──────────────
  var WEATHER_API_KEY = ''; // Testaaja voi lisätä oman avaimen
  var WEATHER_CITY = 'Helsinki';
  var WEATHER_INTERVAL = 15 * 60 * 1000; // 15 min

  function fetchWeather() {
    var weatherEl = document.getElementById('weather-content');
    if (!weatherEl) return;

    // If no API key, show offline message immediately
    if (!WEATHER_API_KEY) {
      weatherState.status = 'no-key';
      renderWeatherOffline('API-avain puuttuu');
      return;
    }

    var url = 'https://api.openweathermap.org/data/2.5/weather?q=' +
      encodeURIComponent(WEATHER_CITY) +
      '&appid=' + WEATHER_API_KEY +
      '&units=metric&lang=fi';

    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          weatherState.status = 'ok';
          weatherState.lastFetch = new Date();
          weatherState.data = data;
          renderWeather(data);
        } catch (e) {
          weatherState.status = 'fail';
          renderWeatherOffline('Jäsennysvirhe');
        }
      } else {
        weatherState.status = 'fail';
        renderWeatherOffline('HTTP ' + xhr.status);
      }
    };
    xhr.onerror = function() {
      weatherState.status = 'fail';
      renderWeatherOffline('Verkkovirhe');
    };
    xhr.ontimeout = function() {
      weatherState.status = 'fail';
      renderWeatherOffline('Aikakatkaisu');
    };
    xhr.open('GET', url, true);
    xhr.send();
  }

  function renderWeather(data) {
    var el = document.getElementById('weather-content');
    if (!el) return;
    var temp = Math.round(data.main.temp);
    var desc = data.weather[0].description;
    var icon = data.weather[0].icon;
    el.innerHTML =
      '<img class="weather-icon" src="https://openweathermap.org/img/wn/' + icon + '@2x.png" alt="sää">' +
      '<span class="weather-temp">' + temp + '°C</span>' +
      '<div class="weather-desc">' + desc + '</div>';
  }

  function renderWeatherOffline(reason) {
    var el = document.getElementById('weather-content');
    if (!el) return;
    el.innerHTML = '<div class="weather-offline">Säädata ei saatavilla' +
      (reason ? ' (' + reason + ')' : '') + '</div>';
  }

  // ─── Canvas placeholder video ────────────────────────────────
  var placeholderCanvas = null;
  var placeholderCtx = null;
  var placeholderAnimId = null;

  function initPlaceholderVideo() {
    var videoEl = document.getElementById('local-video');
    var canvasEl = document.getElementById('placeholder-canvas');

    if (!canvasEl) return;
    placeholderCanvas = canvasEl;
    placeholderCtx = canvasEl.getContext('2d');
    canvasEl.width = 1920;
    canvasEl.height = 1080;

    // Try loading video first
    if (videoEl) {
      videoEl.addEventListener('canplay', function() {
        // Video loaded — hide canvas, show video
        canvasEl.style.display = 'none';
        videoEl.style.display = 'block';
      });
      videoEl.addEventListener('error', function() {
        // Video failed — show canvas animation
        videoEl.style.display = 'none';
        canvasEl.style.display = 'block';
        startPlaceholderAnimation();
      });

      // If no src or empty src, go straight to canvas
      if (!videoEl.querySelector('source') && !videoEl.src) {
        videoEl.style.display = 'none';
        canvasEl.style.display = 'block';
        startPlaceholderAnimation();
      }
    } else {
      startPlaceholderAnimation();
    }
  }

  function startPlaceholderAnimation() {
    if (!placeholderCtx) return;
    var startT = performance.now();

    function frame() {
      var t = performance.now() - startT;
      var w = placeholderCanvas.width;
      var h = placeholderCanvas.height;
      var ctx = placeholderCtx;

      // Dark gradient background
      ctx.fillStyle = '#0d0520';
      ctx.fillRect(0, 0, w, h);

      // Animated waves
      for (var wave = 0; wave < 5; wave++) {
        ctx.beginPath();
        var baseY = h * 0.3 + wave * (h * 0.12);
        ctx.moveTo(0, baseY);
        for (var x = 0; x <= w; x += 10) {
          var y = baseY + Math.sin((x / 200) + (t / 800) + wave * 1.2) * 40
                        + Math.sin((x / 100) + (t / 1200) + wave) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        var hue = (wave * 60 + t / 30) % 360;
        ctx.fillStyle = 'hsla(' + hue + ', 70%, 40%, 0.3)';
        ctx.fill();
      }

      // Floating particles
      for (var p = 0; p < 30; p++) {
        var px = ((p * 137.5 + t / 15) % w);
        var py = ((p * 97.3 + Math.sin(t / 1000 + p) * 80) % h);
        var size = 2 + Math.sin(t / 500 + p) * 2;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }

      // Center text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PROSCREEN — VIDEO PLACEHOLDER', w / 2, h / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Lisää MP4-tiedosto assets/ -kansioon', w / 2, h / 2 + 25);

      placeholderAnimId = requestAnimationFrame(frame);
    }

    placeholderAnimId = requestAnimationFrame(frame);
  }

  // ─── Diagnostics ─────────────────────────────────────────────
  function updateDiagnostics() {
    var uptimeMs = Date.now() - startTime;
    var uptimeS = Math.floor(uptimeMs / 1000);
    var m = Math.floor(uptimeS / 60);
    var s = uptimeS % 60;
    var uptimeStr = m + 'min ' + s + 's';

    setDiag('diag-uptime', uptimeStr);
    setDiag('diag-ua', navigator.userAgent.substring(0, 80));

    // Memory
    if (window.performance && performance.memory) {
      var used = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      var total = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
      setDiag('diag-memory', used + ' / ' + total + ' MB');
    } else {
      setDiag('diag-memory', 'ei saatavilla');
    }

    // Weather status
    var ws = weatherState.status;
    var wsEl = document.getElementById('diag-weather');
    if (wsEl) {
      var wsText = ws === 'ok' ? 'OK' : ws === 'no-key' ? 'EI AVAINTA' : ws === 'pending' ? 'ODOTTAA' : 'FAIL';
      if (weatherState.lastFetch) {
        wsText += ' (' + weatherState.lastFetch.toLocaleTimeString('fi-FI') + ')';
      }
      wsEl.textContent = wsText;
      wsEl.className = 'diag-value ' + (ws === 'ok' ? 'diag-ok' : ws === 'fail' ? 'diag-fail' : '');
    }
  }

  function setDiag(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ─── ProscreenPlay() callback ────────────────────────────────
  var started = false;

  function startEverything() {
    if (started) return;
    started = true;

    // Clock — update every second
    updateClock();
    setInterval(updateClock, 1000);

    // Weather
    fetchWeather();
    setInterval(fetchWeather, WEATHER_INTERVAL);

    // Video / canvas placeholder
    initPlaceholderVideo();

    // Play video if available
    var videoEl = document.getElementById('local-video');
    if (videoEl) {
      videoEl.play().catch(function() {});
    }

    // Diagnostics — update every 2s
    updateDiagnostics();
    setInterval(updateDiagnostics, 2000);
  }

  // Export ProscreenPlay globally
  window.ProscreenPlay = function() {
    startEverything();
  };

  // Fallback: if not called within 2s, start automatically
  setTimeout(function() {
    if (!started) {
      window.ProscreenPlay();
    }
  }, 2000);

})();
