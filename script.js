// script.js - maneja la interacción de los regalos, modal y confetti
document.addEventListener('DOMContentLoaded', ()=> {
  const gifts = document.querySelectorAll('.gift');
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const modalOk = document.getElementById('modalOk');
  const modalClose = document.querySelector('.modal-close');
  const confettiContainer = document.getElementById('confetti-container');

  const messages = {
    left: "¡Has ganado 50 puntos navideños! 🎉 Disfruta de la recompensa.",
    right: "¡Sorpresa! Obtuviste un cupón especial de descuento. 🎁"
  };

  gifts.forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const which = btn.dataset.gift || 'left';
      showModal(messages[which] || "¡Felicidades!");
      launchConfetti(28);
      // pequeña vibración en móviles (si está disponible)
      if (navigator.vibrate) navigator.vibrate(80);
    });

    // keyboard accessibility: Enter y Space activan el regalo
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  function showModal(text){
    modalMessage.textContent = text;
    modal.setAttribute('aria-hidden','false');
    // trap focus briefly on the OK button
    modalOk.focus();
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
  }

  modalOk.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // cerrar con ESC
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeModal();
  });

  // Crear confetti simple y liviano
  function launchConfetti(count = 25){
    const colors = ["#ff6b6f","#ffd358","#6bcf8c","#7bb8ff","#f08bff","#ffd1bf"];
    const w = window.innerWidth;
    for (let i=0;i<count;i++){
      const conf = document.createElement('div');
      conf.className = 'confetti';
      const size = 6 + Math.random()*12;
      conf.style.width = `${size}px`;
      conf.style.height = `${Math.max(8, size*1.2)}px`;
      conf.style.background = colors[Math.floor(Math.random()*colors.length)];
      // position somewhere near the top center (where Santa is)
      const startX = (w/2) + (Math.random()*220 - 110);
      conf.style.left = `${startX}px`;
      conf.style.top = `${-20 - Math.random()*40}px`;
      conf.style.opacity = '' + (0.8 + Math.random()*0.2);
      // random rotation speed via animation duration modification
      conf.style.animationDuration = `${900 + Math.random()*800}ms`;
      conf.style.transform = `rotate(${Math.random()*360}deg)`;
      confettiContainer.appendChild(conf);
      // remove after animation
      setTimeout(()=> conf.remove(), 2200 + Math.random()*800);
    }
  }
});
