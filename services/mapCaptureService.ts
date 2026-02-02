import html2canvas from 'html2canvas';

export const captureMap = async (): Promise<void> => {
  try {
    const mapContainer = document.querySelector('.maplibregl-map') as HTMLElement;
    
    if (!mapContainer) {
      alert("Impossible de capturer la carte");
      return;
    }

    // Masquer temporairement les contrôles
    const controls = document.querySelectorAll('.maplibregl-ctrl-top-right, .maplibregl-ctrl-bottom-right');
    controls.forEach(ctrl => (ctrl as HTMLElement).style.display = 'none');

    // Capture
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Réafficher les contrôles
    controls.forEach(ctrl => (ctrl as HTMLElement).style.display = 'block');

    // Téléchargement
    const link = document.createElement('a');
    link.download = `navigoo-carte-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    console.log("✅ Carte capturée avec succès");
  } catch (error) {
    console.error("❌ Erreur capture:", error);
    alert("Erreur lors de la capture de la carte");
  }
};

export const shareMap = async (): Promise<void> => {
  const url = window.location.href;
  const text = "Découvrez cette carte sur POI Navigoo !";

  try {
    if (navigator.share) {
      // API Web Share (mobile)
      await navigator.share({
        title: 'POI Navigoo',
        text,
        url
      });
    } else {
      // Fallback: copier dans le presse-papier
      await navigator.clipboard.writeText(url);
      alert("✅ Lien copié dans le presse-papier !");
    }
  } catch (error) {
    console.error("❌ Erreur partage:", error);
  }
};