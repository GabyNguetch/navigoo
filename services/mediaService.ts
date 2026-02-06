// services/mediaService.ts
import { MediaDto } from "@/types";

// URL du PROXY Media
const MEDIA_PROXY = typeof window !== 'undefined' ? "/media-api" : "https://media-service.pynfi.com";

export class MediaService {
  /**
   * Upload un fichier
   * Endpoint: POST /media/upload (via proxy)
   */
  async uploadFile(file: File, context: string = "user_content"): Promise<MediaDto> {
    console.log(`📤 [MediaService] Uploading ${file.name} (${file.size} bytes)`);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("service", "NAVIGOO");
    formData.append("location", context); // ex: 'users', 'pois'

    const res = await fetch(`${MEDIA_PROXY}/media/upload`, {
      method: "POST",
      body: formData, // Laisse fetch mettre le boundary
    });

    if (!res.ok) {
      console.error(`❌ [MediaService] Upload Error ${res.status}`);
      throw new Error("Echec de l'upload du fichier");
    }

    const data: MediaDto = await res.json();
    console.log("✅ [MediaService] Upload ID:", data.id);
    return data;
  }

  /**
   * Génère l'URL d'affichage d'un média via le proxy
   * Utilisé pour <Image src={...} />
   */
  getMediaUrl(mediaId: string): string {
    if (!mediaId) return "";
    // On passe par notre proxy local /media-api qui pointe vers le vrai service
    return `${MEDIA_PROXY}/media/proxy/${mediaId}`;
  }
}

export const mediaService = new MediaService();