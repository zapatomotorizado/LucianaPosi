/**
 * Lógica Principal - Invitación XV Años Luciana Arce Altamirano
 * Cuenta regresiva dinámica, apertura teatral, scroll reveals, calendario y toasts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. APERTURA TEATRAL / PORTAL
  const portalOverlay = document.getElementById('portal-overlay');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');

  if (btnOpenInvitation && portalOverlay) {
    btnOpenInvitation.addEventListener('click', () => {
      // Iniciar música automáticamente
      if (window.wonderlandAudio) {
        window.wonderlandAudio.play();
      }

      // Animación de desvanecimiento
      portalOverlay.classList.add('portal-hidden');
      
      // Permitir scroll después de abrir
      setTimeout(() => {
        portalOverlay.style.display = 'none';
      }, 1200);
    });
  }

  // 2. CUENTA REGRESIVA (5 de Septiembre de 2026 a las 19:00:00)
  const eventDate = new Date('2026-09-05T19:00:00').getTime();

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      if (elDays) elDays.textContent = '00';
      if (elHours) elHours.textContent = '00';
      if (elMinutes) elMinutes.textContent = '00';
      if (elSeconds) elSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 3. INTEGRACIÓN CON CALENDARIO (Google Calendar y Descarga ICS)
  const btnGoogleCalendar = document.getElementById('btn-add-calendar');
  if (btnGoogleCalendar) {
    btnGoogleCalendar.addEventListener('click', (e) => {
      e.preventDefault();
      
      const title = encodeURIComponent('XV Años - Luciana Arce Altamirano 👑');
      const details = encodeURIComponent('¡Celebración mágica de los 15 Años de Luciana! Recepción en Salón Princes.');
      const location = encodeURIComponent('Salón Princes, https://maps.app.goo.gl/zEunKEA5UZ9e9R8E9');
      const dates = '20260905T230000Z/20260906T070000Z'; // 7:00 PM local time approx
      
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank');
    });
  }

  // 4. COPIAR CÓDIGO QR / IMAGEN AL PORTAPAPELES
  const btnCopyQr = document.getElementById('btn-copy-qr');
  const qrImg = document.getElementById('qr-regalo-img');
  const toast = document.getElementById('toast-notification');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast-visible');
    setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 3000);
  }

  if (btnCopyQr && qrImg) {
    btnCopyQr.addEventListener('click', async () => {
      try {
        // Cargar imagen en un canvas para copiar el PNG directamente al portapapeles
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = qrImg.src;

        img.onload = () => {
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 400;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(async (blob) => {
            if (blob && typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob })
                ]);
                showToast('✨ ¡Imagen del Código QR copiada!');
                return;
              } catch (clipErr) {
                console.log('ClipboardItem fallback:', clipErr);
              }
            }
            // Fallback de enlace
            const fullUrl = new URL(qrImg.getAttribute('src'), window.location.href).href;
            await navigator.clipboard.writeText(fullUrl);
            showToast('✨ ¡Código QR listo! (O pulsa Descargar QR)');
          }, 'image/png');
        };

        if (img.complete) {
          img.onload();
        }
      } catch (err) {
        showToast('✨ ¡Puedes guardar el código con el botón Descargar QR!');
      }
    });
  }

  // 5. ANIMACIONES DE REVELADO EN SCROLL (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
});
