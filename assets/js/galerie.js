// ========================================
// GALERIE PHOTOS DYNAMIQUE - Simone Improvise
// ========================================

class GaleriePhotos {
    constructor() {
        this.albums = [];
        this.currentAlbum = null;
        this.currentPhotoIndex = 0;
        this.albumPhotos = [];
        this.init();
    }

    async init() {
        await this.chargerAlbums();
        this.afficherAlbums();
        this.initialiserLightbox();
    }

    /**
     * Charge la configuration des albums depuis photos/config.json
     */
    async chargerAlbums() {
        try {
            const response = await fetch('photos/config.json');
            const data = await response.json();
            this.albums = data.albums || [];
        } catch (error) {
            console.warn('Config non trouvée, utilisation des données par défaut', error);
            // Albums par défaut - À personnaliser selon vos besoins
            this.albums = [
                {
                    id: 'exemple-soiree',
                    titre: 'Nos Premiers Spectacles',
                    description: 'Découvrez nos moments mémorables',
                    date: '2024-03-15',
                    thumbnail: 'assets/images/IMG_20241124-WA0177.jpg',
                    photos: [
                        'assets/images/IMG_20241124-WA0177.jpg',
                        'assets/images/IMG_20230524_120431_947.jpg',
                        'assets/images/IMG_20250405-WA0016-300x22.jpg',
                        'assets/images/IMG_20241215-WA0001.jpg',
                        'assets/images/IMG_20251007_082858_229.jpg',
                        'assets/images/IMG_20230831-WA0001.jpg'
                    ]
                }
            ];
        }
    }

    /**
     * Affiche la grille des albums sur la page
     */
    afficherAlbums() {
        const container = document.getElementById('albums-grid');
        
        if (!container) {
            console.warn('Container albums-grid non trouvé');
            return;
        }
        
        if (this.albums.length === 0) {
            container.innerHTML = '<p class="loading-message">Aucun album disponible pour le moment.</p>';
            return;
        }

        container.innerHTML = '';
        this.albums.forEach(album => {
            const card = this.creerCarteAlbum(album);
            container.appendChild(card);
        });
    }

    /**
     * Crée une carte d'album
     */
    creerCarteAlbum(album) {
        const card = document.createElement('div');
        card.className = 'album-card';
        
        const photoCount = album.photos ? album.photos.length : '...';
        
        card.innerHTML = `
            <img src="${album.thumbnail}" alt="${album.titre}" class="album-thumbnail" loading="lazy">
            <div class="album-info">
                <h3>${album.titre}</h3>
                <span class="album-date">${this.formaterDate(album.date)}</span>
                ${album.description ? `<p class="album-description">${album.description}</p>` : ''}
                <p class="album-photo-count">📸 ${photoCount} photo${photoCount > 1 ? 's' : ''}</p>
            </div>
        `;

        card.addEventListener('click', () => this.ouvrirAlbum(album));
        
        // Accessibilité
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.ouvrirAlbum(album);
            }
        });
        
        return card;
    }

    /**
     * Ouvre un album dans le lightbox
     */
    async ouvrirAlbum(album) {
        this.currentAlbum = album;
        this.currentPhotoIndex = 0;
        
        // Charger les photos de l'album
        if (album.photos && Array.isArray(album.photos)) {
            this.albumPhotos = album.photos.map(photo => ({
                url: photo,
                nom: photo.split('/').pop()
            }));
        } else {
            this.albumPhotos = [];
        }
        
        if (this.albumPhotos.length === 0) {
            alert('Aucune photo dans cet album pour le moment.');
            return;
        }
        
        // Afficher la première photo
        this.afficherPhoto(0);
        
        // Ouvrir le lightbox
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus sur le bouton de fermeture pour l'accessibilité
        setTimeout(() => {
            document.querySelector('.lightbox-close').focus();
        }, 100);
    }

    /**
     * Affiche une photo spécifique dans le lightbox
     */
    afficherPhoto(index) {
        // Gestion du bouclage
        if (index < 0) index = this.albumPhotos.length - 1;
        if (index >= this.albumPhotos.length) index = 0;
        
        this.currentPhotoIndex = index;
        const photo = this.albumPhotos[index];
        
        const img = document.getElementById('lightbox-image');
        img.src = photo.url;
        img.alt = photo.nom;
        
        // Légende
        const caption = document.querySelector('.lightbox-caption');
        caption.textContent = `${this.currentAlbum.titre} - ${index + 1}/${this.albumPhotos.length}`;
        
        // Mettre à jour les miniatures
        this.afficherMiniatures();
    }

    /**
     * Affiche les miniatures des photos dans le lightbox
     */
    afficherMiniatures() {
        const container = document.querySelector('.lightbox-thumbnails');
        container.innerHTML = '';
        
        this.albumPhotos.forEach((photo, index) => {
            const thumb = document.createElement('img');
            thumb.src = photo.url;
            thumb.alt = photo.nom;
            thumb.className = index === this.currentPhotoIndex ? 'active' : '';
            thumb.loading = 'lazy';
            thumb.addEventListener('click', () => this.afficherPhoto(index));
            
            // Accessibilité
            thumb.setAttribute('role', 'button');
            thumb.setAttribute('tabindex', '0');
            thumb.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.afficherPhoto(index);
                }
            });
            
            container.appendChild(thumb);
        });
    }

    /**
     * Initialise les événements du lightbox
     */
    initialiserLightbox() {
        // Bouton de fermeture
        const closeBtn = document.querySelector('.lightbox-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.fermerLightbox());
        }

        // Navigation précédent/suivant
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.afficherPhoto(this.currentPhotoIndex - 1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.afficherPhoto(this.currentPhotoIndex + 1));
        }

        // Touches clavier
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (!lightbox || !lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.fermerLightbox();
                    break;
                case 'ArrowLeft':
                    this.afficherPhoto(this.currentPhotoIndex - 1);
                    break;
                case 'ArrowRight':
                    this.afficherPhoto(this.currentPhotoIndex + 1);
                    break;
            }
        });

        // Clic en dehors de l'image pour fermer
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target.id === 'lightbox') {
                    this.fermerLightbox();
                }
            });
        }
    }

    /**
     * Ferme le lightbox
     */
    fermerLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    /**
     * Formate une date au format français
     */
    formaterDate(dateStr) {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateStr).toLocaleDateString('fr-FR', options);
        } catch (error) {
            return dateStr;
        }
    }
}

// ========================================
// INITIALISATION
// ========================================

// Initialiser la galerie au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('albums-grid')) {
        new GaleriePhotos();
    }
});