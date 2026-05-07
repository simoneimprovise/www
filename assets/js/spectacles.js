// ========================================
// GESTION DES SPECTACLES - Simone Improvise
// ========================================

class GestionSpectacles {
    constructor() {
        this.spectacles = [];
        this.filtreActif = 'tous'; // tous, a-venir, passe
        this.init();
    }

    async init() {
        await this.chargerSpectacles();
        this.afficherSpectacles();
        this.initialiserLightbox();
    }

    /**
     * Charge la configuration des spectacles depuis spectacles/config.json
     */
    async chargerSpectacles() {
        try {
            const response = await fetch('spectacles/config.json');
            const data = await response.json();
            this.spectacles = data.spectacles || [];

            // ✨ Calcul automatique du statut basé sur la date
            const aujourdhui = new Date();
            aujourdhui.setHours(0, 0, 0, 0);

            this.spectacles.forEach(spectacle => {
                if (spectacle.statut !== 'complet') { // Ne pas écraser "complet"
                    const dateSpectacle = new Date(spectacle.date);
                    dateSpectacle.setHours(0, 0, 0, 0);
                    spectacle.statut = dateSpectacle < aujourdhui ? 'passe' : 'a-venir';
                }
            });    
                 
            // Trier par date (les plus récents en premier)
            this.spectacles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.warn('Config spectacles non trouvée, utilisation des données par défaut', error);
            // Spectacles par défaut
            this.spectacles = [
                {
                    id: 'exemple-spectacle',
                    type: 'spectacle',
                    titre: 'Spectacles Live',
                    date: '2026-04-01',
                    heure: '20h00',
                    lieu: 'À venir',
                    description: 'Venez assister à nos spectacles d\'improvisation ! Des histoires uniques créées en direct à partir de vos suggestions.',
                    prix: 'À définir',
                    statut: 'a-venir',
                    affiche: 'assets/images/IMG_20250405-WA0016-300x22.jpg',
                    photos: ['assets/images/IMG_20250405-WA0016-300x22.jpg']
                }
            ];
        }
    }

    /**
     * Affiche la grille des spectacles
     */
    afficherSpectacles(filtre = 'tous') {
        const container = document.getElementById('spectacles-grid');
        
        if (!container) {
            console.warn('Container spectacles-grid non trouvé');
            return;
        }
        
        // Filtrer les spectacles
        let spectaclesAffiches = this.spectacles;
        if (filtre === 'a-venir') {
            spectaclesAffiches = this.spectacles.filter(s => s.statut === 'a-venir');
        } else if (filtre === 'passe') {
            spectaclesAffiches = this.spectacles.filter(s => s.statut === 'passe');
        }

      // MODIFICATION : Limiter à 3 spectacles si on est sur index.html
        const isIndexPage = window.location.pathname.includes('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname.endsWith('/');
        if (isIndexPage && filtre === 'tous') {
            // Prendre seulement les 3 plus récents pour la page d'accueil
            spectaclesAffiches = spectaclesAffiches.slice(0, 3);
        }

        if (spectaclesAffiches.length === 0) {
            container.innerHTML = '<p class="no-spectacles-message">Aucun spectacle pour le moment. Revenez bientôt !</p>';
            return;
        }

        container.innerHTML = '';
        spectaclesAffiches.forEach(spectacle => {
            const card = this.creerCarteSpectacle(spectacle);
            container.appendChild(card);
        });

        // MODIFICATION : Ajouter le bouton "Voir tous les spectacles" sur la page d'accueil
        if (isIndexPage && filtre === 'tous' && this.spectacles.length > 3) {
            this.ajouterBoutonTousSpectacles(container);
        }
    }

    /**
     * NOUVEAU : Ajoute le bouton pour voir tous les spectacles
     */
    ajouterBoutonTousSpectacles(container) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'tous-spectacles-link';
        btnContainer.innerHTML = `
                <a href="spectacles.html" class="btn btn-spectacles">
                    Retrouver tous nos spectacles ici
                </a>
        `;
        container.appendChild(btnContainer);
    }

    /**
     * Crée une carte de spectacle
     */
    creerCarteSpectacle(spectacle) {
        const card = document.createElement('div');
        card.className = 'spectacle-card';
        
        // Icônes par type
        const icones = {
            'match': '🎭',
            'atelier': '🎪',
            'spectacle': '🎬',
            'evenement': '🎉'
        };
        
        const icone = icones[spectacle.type] || '🎭';
        
        // Déterminer si l'affiche est cliquable
        const aAffiche = spectacle.affiche && spectacle.affiche.trim() !== '';
        const imageHtml = aAffiche ? `
            <div class="spectacle-image-container">
                <img src="${spectacle.affiche}" 
                     alt="${spectacle.titre}" 
                     class="spectacle-affiche"
                     data-spectacle-id="${spectacle.id}">
                <div class="spectacle-image-overlay">
                    <span class="zoom-hint">🔍 Cliquer pour agrandir</span>
                </div>
            </div>
        ` : `
            <div class="spectacle-image-container no-image">
                <span class="spectacle-type-icon">${icone}</span>
            </div>
        `;
        
        // Labels de statut
        const statutLabels = {
            'a-venir': 'À venir',
            'passe': 'Passé',
            'complet': 'Complet'
        };
        
        card.innerHTML = `
            ${imageHtml}
            <span class="spectacle-badge ${spectacle.statut}">${statutLabels[spectacle.statut] || 'Info'}</span>
            
            <div class="spectacle-info">
                <span class="spectacle-type ${spectacle.type}">${spectacle.type}</span>
                <h3>${spectacle.titre}</h3>
                
                <div class="spectacle-details">
                    <div class="spectacle-detail-item">
                        <span class="icon">📅</span>
                        <span>${this.formaterDate(spectacle.date)} à ${spectacle.heure}</span>
                    </div>
                    <div class="spectacle-detail-item">
                        <span class="icon">📍</span>
                        <span>${spectacle.lieu}</span>
                    </div>
                </div>
                
                <p class="spectacle-description">${spectacle.description}</p>
                
                <div class="spectacle-footer">
                    <span class="spectacle-prix">${spectacle.prix}</span>
                    ${this.genererBoutonAction(spectacle)}
                </div>
            </div>
        `;

        // Ajouter l'événement de clic sur l'affiche si elle existe
        if (aAffiche) {
            const img = card.querySelector('.spectacle-affiche');
            img.addEventListener('click', () => this.afficherAfficheEnGrand(spectacle));
            img.style.cursor = 'pointer';
        }
        
        return card;
    }

    /**
     * Génère le bouton d'action selon le statut
     */
    genererBoutonAction(spectacle) {
        if (spectacle.statut === 'passe') {
            if (spectacle.photos && spectacle.photos.length > 0) {
                return `<button class="spectacle-btn" onclick="gestionSpectacles.afficherPhotos('${spectacle.id}')">
                    Voir les photos
                </button>`;
            }
            return '<button class="spectacle-btn disabled">Terminé</button>';
        }
        
        if (spectacle.statut === 'complet') {
            return '<button class="spectacle-btn disabled">Complet</button>';
        }
        
        if (spectacle.lienReservation) {
            return `<a href="${spectacle.lienReservation}" class="spectacle-btn" target="_blank">
                Réserver
            </a>`;
        }
        if (spectacle.lienPlusInfo) {
            return `<a href="${spectacle.lienPlusInfo}" class="spectacle-btn" target="_blank">
                Plus d\'infos
            </a>`;
        }
        /* return '<button class="spectacle-btn">Plus d\'infos</button>'; */
    }

    /**
     * Affiche l'affiche en grand dans le lightbox
     */
    afficherAfficheEnGrand(spectacle) {
        if (!spectacle.affiche) return;
        
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-image');
        const caption = document.querySelector('.lightbox-caption');
        const thumbnails = document.querySelector('.lightbox-thumbnails');
        
        if (!lightbox || !img) {
            console.warn('Lightbox non trouvé');
            return;
        }
        
        img.src = spectacle.affiche;
        img.alt = spectacle.titre;
        caption.textContent = spectacle.titre;
        
        // Masquer les miniatures et la navigation pour une seule image
        thumbnails.style.display = 'none';
        document.querySelector('.lightbox-prev').style.display = 'none';
        document.querySelector('.lightbox-next').style.display = 'none';
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Affiche les photos d'un spectacle passé
     */
    afficherPhotos(spectacleId) {
        const spectacle = this.spectacles.find(s => s.id === spectacleId);
        if (!spectacle || !spectacle.photos || spectacle.photos.length === 0) {
            alert('Aucune photo disponible pour ce spectacle.');
            return;
        }
        
        // Simuler un album pour réutiliser le système de galerie
        const album = {
            titre: spectacle.titre,
            photos: spectacle.photos
        };
        
        // Si la classe GaleriePhotos existe, on l'utilise
        if (window.GaleriePhotos) {
            const galerie = new window.GaleriePhotos();
            galerie.currentAlbum = album;
            galerie.albumPhotos = spectacle.photos.map(photo => ({
                url: photo,
                nom: photo.split('/').pop()
            }));
            galerie.afficherPhoto(0);
            document.getElementById('lightbox').classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            // Fallback : afficher la première photo
            this.afficherAfficheEnGrand({
                affiche: spectacle.photos[0],
                titre: spectacle.titre
            });
        }
    }

    /**
     * Initialise le lightbox (réutilisation du lightbox de la galerie)
     */
    initialiserLightbox() {
        const closeBtn = document.querySelector('.lightbox-close');
        const lightbox = document.getElementById('lightbox');
        
        if (!closeBtn || !lightbox) return;
        
        // Le bouton de fermeture est déjà géré par galerie.js
        // On s'assure juste qu'il fonctionne
        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Réafficher les éléments masqués
            const thumbnails = document.querySelector('.lightbox-thumbnails');
            if (thumbnails) thumbnails.style.display = 'flex';
            document.querySelector('.lightbox-prev').style.display = 'block';
            document.querySelector('.lightbox-next').style.display = 'block';
        });
        
        // Clic en dehors
        lightbox.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') {
                closeBtn.click();
            }
        });
    }

    /**
     * Formate une date au format français
     */
    formaterDate(dateStr) {
        try {
            const options = { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const date = new Date(dateStr).toLocaleDateString('fr-FR', options);
            return date.charAt(0).toUpperCase() + date.slice(1);
        } catch (error) {
            return dateStr;
        }
    }
}

// ========================================
// INITIALISATION
// ========================================

// Déclarer gestionSpectacles au niveau global
window.gestionSpectacles = null;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('spectacles-grid')) {
    window.gestionSpectacles = new GestionSpectacles();
  }
});