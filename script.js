// script.js - interacción de los regalos, modal y confetti (mejorado)
document.addEventListener('DOMContentLoaded', ()=> {
  const gifts = document.querySelectorAll('.gift');
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const modalOk = document.getElementById('modalOk');
  const modalClose = document.querySelector('.modal-close');
  const confettiContainer = document.getElementById('confetti-container');

  const messages = {
    left: "¡Has ganado 50 puntos navideños! 🎉 Úsalos para sorpresas.",
    right: "¡Sorpresa! Ganaste un cupón festivo del 10% 🎁. ¡Feliz Navidad!"
  };

  // Manejo accesible para botones
  gifts.forEach(btn => {
    btn.addEventListener('click', () => handleGift(btn.dataset.gift));
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleGift(btn.dataset.gift);
      }
    });
  });

  function handleGift(which){
    const text = messages[which] || "¡Felicidades!";
    showModal(text);
    launchConfetti(36);
    if (navigator.vibrate) navigator.vibrate([60,20,30]);
  }

  function showModal(text){
    modalMessage.textContent = text;
    modal.setAttribute('aria-hidden','false');
    // foco en botón para accesibilidad
    setTimeout(()=> modalOk.focus(), 60);
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
  }

  modalOk.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeModal();
  });

  // Confetti sencillo y ligero
  function launchConfetti(count = 30){
    const colors = ["#ff6b6f","#ffd358","#6bcf8c","#7bb8ff","#f08bff","#ffd1bf"];
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i=0;i<count;i++){
      const conf = document.createElement('div');
      conf.className = 'confetti';
      const size = 6 + Math.random()*16;
      conf.style.width = `${Math.round(size)}px`;
      conf.style.height = `${Math.round(size*1.3)}px`;
      conf.style.background = colors[Math.floor(Math.random()*colors.length)];
      // iniciar cerca del centro superior (por donde está Papá Noel)
      const startX = (w/2) + (Math.random()*260 - 130);
      conf.style.left = `${startX}px`;
      conf.style.top = `${-20 - Math.random()*40}px`;
      conf.style.opacity = '' + (0.85 + Math.random()*0.15);
      conf.style.animationDuration = `${900 + Math.random()*1000}ms`;
      conf.style.transform = `rotate(${Math.random()*360}deg)`;
      confettiContainer.appendChild(conf);
      // eliminar después de ejecutar
      setTimeout(()=> conf.remove(), 2400 + Math.random()*800);
    }
  }
});
