/**
 * Motor de Partículas Mágicas - Wonderland Canvas
 * Dibuja destellos dorados y esferas de luz cian/azul flotantes
 */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 65;

  const colors = [
    'rgba(250, 228, 168, ',  // Dorado Claro
    'rgba(223, 183, 88, ',   // Dorado Primario
    'rgba(56, 182, 255, ',   // Azul Resplandor
    'rgba(78, 205, 196, ',   // Cian Mágico
    'rgba(255, 255, 255, '   // Blanco Polvo de Hadas
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedY = Math.random() * 0.6 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.baseColor = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.6 + 0.2;
      this.fadeSpeed = Math.random() * 0.008 + 0.004;
      this.increasing = Math.random() > 0.5;
      this.isSparkle = Math.random() > 0.7;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      if (this.increasing) {
        this.alpha += this.fadeSpeed;
        if (this.alpha >= 0.85) this.increasing = false;
      } else {
        this.alpha -= this.fadeSpeed;
        if (this.alpha <= 0.15) this.increasing = true;
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor + this.alpha + ')';
      ctx.shadowBlur = this.isSparkle ? 12 : 5;
      ctx.shadowColor = this.baseColor + '0.9)';
      ctx.fill();

      // Dibujar destello en cruz para partículas especiales
      if (this.isSparkle && this.alpha > 0.5) {
        ctx.strokeStyle = this.baseColor + (this.alpha * 0.6) + ')';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size * 2.2, this.y);
        ctx.lineTo(this.x + this.size * 2.2, this.y);
        ctx.moveTo(this.x, this.y - this.size * 2.2);
        ctx.lineTo(this.x, this.y + this.size * 2.2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('DOMContentLoaded', init);
})();
