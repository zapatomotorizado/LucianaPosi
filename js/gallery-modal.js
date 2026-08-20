/**
 * Visor Lightbox para la Galería de Fotos de Luciana
 * Permite navegación en pantalla completa, teclas flechas y soporte táctil
 */

(function () {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightboxModal || !galleryItems.length) return;

  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('.gallery-img');
    return {
      src: img ? img.src : '',
      alt: img ? img.alt : ''
    };
  });

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateImage();
    lightboxModal.classList.add('lightbox-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal.classList.remove('lightbox-active');
    document.body.style.overflow = '';
  }

  function updateImage() {
    if (images[currentIndex] && lightboxImg) {
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('lightbox-active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
})();
