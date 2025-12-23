// script.js - interacciones de los regalos, modal y confetti
document.addEventListener('DOMContentLoaded', ()=> {
  const gifts = document.querySelectorAll('.gift');
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const modalOk = document.getElementById('modalOk');
  const modalClose = document.querySelector('.modal-close');
  const confettiContainer = document.getElementById('confetti-container');

  const messages = {
    left: "¡Has ganado 50 puntos navideños! 🎉 Úsalos con alegría.",
    right: "¡Felicidades! Ganaste un cupón especial del 10% 🎁. ¡Feliz Navidad!"
  };

  // función principal al abrir un regalo
  function handleGift(which) {
    const text = messages[which] || "¡Felicidades!";
    showModal(text);
    launchConfetti(36);
    if (navigator.vibrate) navigator.vibrate([60,20,40]);
  }

  // asignar listeners accesibles
  gifts.forEach(btn => {
    btn.addEventListener('click', ()=> handleGift(btn.dataset.gift));
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleGift(btn.dataset.gift);
      }
    });
  });

  // Modal
  function showModal(text){
    // crea contenido si no existe (por compatibilidad)
    let messageEl = modal.querySelector('#modalMessage');
    if (!messageEl) {
      messageEl = document.createElement('p');
      messageEl.id = 'modalMessage';
      modal.querySelector('.modal-content').insertBefore(messageEl, modalOk);
    }
    messageEl.textContent = text;
    modal.setAttribute('aria-hidden','false');
    // enfoque accesible
    setTimeout(()=> modalOk.focus(), 60);
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); }

  modalOk.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeModal();
  });

  // Confetti simple
  function launchConfetti(count = 30){
    const colors = ["#ff6b6f","#ffd358","#6bcf8c","#7bb8ff","#f08bff","#ffd1bf"];
    const w = window.innerWidth;
    for (let i=0;i<count;i++){
      const conf = document.createElement('div');
      conf.className = 'confetti';
      const size = 6 + Math.random()*16;
      conf.style.width = `${Math.round(size)}px`;
      conf.style.height = `${Math.round(size*1.3)}px`;
      conf.style.background = colors[Math.floor(Math.random()*colors.length)];
      const startX = (w/2) + (Math.random()*260 - 130);
      conf.style.left = `${startX}px`;
      conf.style.top = `${-20 - Math.random()*60}px`;
      conf.style.opacity = '' + (0.85 + Math.random()*0.15);
      conf.style.animationDuration = `${900 + Math.random()*1200}ms`;
      conf.style.transform = `rotate(${Math.random()*360}deg)`;
      confettiContainer.appendChild(conf);
      setTimeout(()=> conf.remove(), 2400 + Math.random()*1000);
    }
  }
});
