/* ============================================
   MAIN.JS
   Lógica del index
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Technology Advisory loaded');
});

function closeDevModal() {
    const modal = document.getElementById('dev-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('dev-modal');
    if (modal && event.target === modal) {
        closeDevModal();
    }
});
