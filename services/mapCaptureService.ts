// services/mapCaptureService.ts
import html2canvas from 'html2canvas';

/**
 * Capture la carte actuelle et permet de la télécharger
 */
export const captureMap = async () => {
  try {
    console.log("📸 Début capture de la carte...");

    // Trouver l'élément de la carte
    const mapContainer = document.querySelector('.mapboxgl-map') as HTMLElement;
    
    if (!mapContainer) {
      console.error("❌ Conteneur de carte non trouvé");
      alert("Impossible de capturer la carte pour le moment.");
      return;
    }

    // Masquer temporairement les éléments d'interface
    const uiElements = document.querySelectorAll('.mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left');
    uiElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Capturer avec html2canvas
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2, // Haute résolution
      logging: false,
    });

    // Réafficher les éléments d'interface
    uiElements.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    // Convertir en blob et télécharger
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `navigoo-carte-${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log("✅ Carte téléchargée avec succès");
        alert("📸 Carte téléchargée avec succès !");
      }
    }, 'image/png');

  } catch (error) {
    console.error("❌ Erreur lors de la capture:", error);
    alert("Erreur lors de la capture de la carte. Veuillez réessayer.");
  }
};

/**
 * Partage la carte actuelle
 */
export const shareMap = async () => {
  try {
    console.log("🔗 Partage de la carte...");

    const currentUrl = window.location.href;
    const shareData = {
      title: 'Navigoo - Carte interactive',
      text: 'Découvrez cette carte sur Navigoo !',
      url: currentUrl
    };

    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
      await navigator.share(shareData);
      console.log("✅ Carte partagée avec succès");
    } else {
      // Fallback : copier le lien
      await navigator.clipboard.writeText(currentUrl);
      alert("🔗 Lien copié dans le presse-papier !");
      console.log("✅ Lien copié");
    }
  } catch (error) {
    // L'utilisateur a annulé le partage
    if ((error as Error).name !== 'AbortError') {
      console.error("❌ Erreur lors du partage:", error);
      
      // Fallback : copier le lien
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("🔗 Lien copié dans le presse-papier !");
      } catch (clipboardError) {
        alert("Impossible de partager la carte pour le moment.");
      }
    }
  }
};

/**
 * Imprimer la carte actuelle
 */
export const printMap = async () => {
  try {
    console.log("🖨️ Préparation de l'impression...");

    const mapContainer = document.querySelector('.mapboxgl-map') as HTMLElement;
    
    if (!mapContainer) {
      alert("Impossible de préparer l'impression.");
      return;
    }

    // Capturer la carte
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les popups pour imprimer la carte.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Navigoo - Carte</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                margin: 0;
              }
              img {
                max-width: 100%;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL('image/png')}" />
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Attendre que l'image soit chargée avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };

    console.log("✅ Fenêtre d'impression ouverte");
  } catch (error) {
    console.error("❌ Erreur lors de l'impression:", error);
    alert("Erreur lors de la préparation de l'impression.");
  }
};