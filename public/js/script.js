document.addEventListener('DOMContentLoaded', function() {
      const counters = document.querySelectorAll('.stat-number');
      
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };
        
        updateCounter();
      });
    });



     document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openTerms");
  const modal = document.getElementById("termsModal");
  const closeBtn = document.getElementById("closeTerms");

  if (openBtn && modal && closeBtn) {
    openBtn.onclick = () => modal.style.display = "block";

    closeBtn.onclick = () => modal.style.display = "none";

    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }
});
