/**
 * Gestor del Modal de Confirmación de Asistencia (RSVP)
 * Valida datos y genera enlace directo a WhatsApp con mensaje personalizado.
 */

(function () {
  const rsvpModal = document.getElementById('rsvp-modal');
  const openModalBtns = document.querySelectorAll('.js-open-rsvp');
  const closeModalBtns = document.querySelectorAll('.js-close-rsvp');
  const rsvpForm = document.getElementById('rsvp-form');

  // Configuración de WhatsApp oficial para confirmación de asistencia
  const WHATSAPP_PHONE = '59176185040'; // +591 76185040

  function openModal() {
    if (!rsvpModal) return;
    rsvpModal.classList.add('modal-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!rsvpModal) return;
    rsvpModal.classList.remove('modal-active');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  // Cerrar al hacer clic fuera del card o presionar ESC
  if (rsvpModal) {
    rsvpModal.addEventListener('click', (e) => {
      if (e.target === rsvpModal) {
        closeModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rsvpModal && rsvpModal.classList.contains('modal-active')) {
      closeModal();
    }
  });

  // Enviar a WhatsApp
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rsvp-name').value.trim();
      const attendance = document.getElementById('rsvp-attendance').value;
      const guests = document.getElementById('rsvp-guests').value;
      const message = document.getElementById('rsvp-message').value.trim();

      if (!name) {
        alert('Por favor ingresa tu nombre completo.');
        return;
      }

      let whatsappText = `✨ *CONFIRMACIÓN XV AÑOS - LUCIANA ARCE ALTAMIRANO* ✨\n\n`;
      whatsappText += `👤 *Nombre:* ${name}\n`;
      whatsappText += `💌 *Asistencia:* ${attendance}\n`;
      whatsappText += `👥 *Pases / Personas:* ${guests}\n`;

      if (message) {
        whatsappText += `\n💬 *Mensaje para Luciana:*\n"${message}"\n`;
      }

      whatsappText += `\n🍄 _¡Nos vemos en el País de las Maravillas!_ 👑`;

      const encodedText = encodeURIComponent(whatsappText);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

      // Abrir WhatsApp en nueva pestaña
      window.open(whatsappUrl, '_blank');
      closeModal();
    });
  }
})();
