// Configuration EmailJS
// REMPLACEZ CES VALEURS PAR VOS IDENTIFIANTS EMAILJS
const EMAIL_CONFIG = {
    publicKey: 'qWlAuiSZx-YkfxX1S',      // Ex: 'user_abc123xyz'
    serviceID: 'service_3bb8j2k',      // Ex: 'service_abc123'
    templateID: 'template_5spvsmt'     // Ex: 'template_xyz789'
};

// Initialisation d'EmailJS au chargement de la page
(function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAIL_CONFIG.publicKey);
        console.log('✅ EmailJS initialisé avec succès');
    } else {
        console.error('❌ EmailJS n\'est pas chargé. Vérifiez le CDN.');
    }
})();

// Fonction pour gérer la soumission du formulaire
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Récupération des éléments du DOM
    const form = event.target;
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');
    
    // Désactiver le bouton et afficher un message de chargement
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    statusDiv.innerHTML = '<p style="color: #0066cc;">📤 Envoi du message...</p>';
    
    // Envoi du formulaire via EmailJS
    emailjs.sendForm(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, form)
        .then(function(response) {
            // Succès
            console.log('✅ Email envoyé avec succès!', response.status, response.text);
            statusDiv.innerHTML = '<p style="color: #28a745; font-weight: bold;">✅ Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</p>';
            form.reset();
            
            // Réactiver le bouton après 2 secondes
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Envoyer';
            }, 2000);
            
        }, function(error) {
            // Erreur
            console.error('❌ Erreur lors de l\'envoi:', error);
            statusDiv.innerHTML = '<p style="color: #dc3545; font-weight: bold;">❌ Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.</p>';
            
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer';
        });
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Gestionnaire de formulaire attaché');
    } else {
        console.error('❌ Formulaire avec id "contact-form" introuvable');
    }
});