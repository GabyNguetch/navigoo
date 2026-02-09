// services/mediaService.ts
import { MediaDto } from "@/types";

/**
 * URL de base de l'API Media (via proxy Next.js)
 * Configuration dans next.config.ts:
 * '/media-api' -> 'http://localhost:8081' (dev)
 * '/media-api' -> 'https://media-service.pynfi.com' (prod)
 */
const MEDIA_API_BASE = "/media-api";

export class MediaService {
  /**
   * Upload un fichier unique
   * Endpoint: POST /media/upload
   * @param file - Le fichier à uploader
   * @param context - Le dossier de destination (location)
   * @param service - Le nom du service/bucket (default: "navigoo")
   * @returns MediaDto avec les métadonnées du fichier uploadé
   */
  async uploadFile(
    file: File, 
    context: string = "general",
    service: string = "navigoo"
  ): Promise<MediaDto> {
    // Nettoyer le context (location) - pas de slashes, espaces
    const cleanLocation = context.replace(/\//g, "_").trim();
    
    console.group(`📤 [MediaService] Upload File`);
    console.log("File:", file.name);
    console.log("Size:", `${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log("Type:", file.type);
    console.log("Service:", service);
    console.log("Location:", cleanLocation);

    // Construire le FormData selon la spec API
    const formData = new FormData();
    formData.append("file", file);           // Fichier binaire (requis)
    formData.append("service", service);      // Nom du service (requis)
    formData.append("location", cleanLocation); // Dossier destination (requis)

    try {
      const url = `${MEDIA_API_BASE}/media/upload`;
      console.log("URL:", url);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        // Ne PAS définir Content-Type manuellement - le navigateur le fait automatiquement
        // avec le bon boundary pour multipart/form-data
        headers: {
          "Accept": "application/json"
        }
      });

      console.log("Response Status:", res.status, res.statusText);

      if (!res.ok) {
        // Essayer de parser l'erreur
        let errorMessage = `Upload failed: ${res.status} ${res.statusText}`;
        
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
            
            // Log détaillé de l'erreur
            console.error("Error Response:", errorData);
          } else {
            const textError = await res.text();
            errorMessage = textError || errorMessage;
            console.error("Error Text:", textError);
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        console.groupEnd();
        throw new Error(errorMessage);
      }

      // Parse la réponse success
      const data: MediaDto = await res.json();
      
      console.log("✅ Upload Success!");
      console.log("Media ID:", data.id);
      console.log("Path:", data.path);
      console.log("URI:", data.uri);
      console.groupEnd();

      return data;

    } catch (error: any) {
      console.error("❌ Upload Exception:", error);
      console.groupEnd();
      
      // Erreurs réseau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error("Erreur réseau: Impossible de contacter le serveur média");
      }
      
      throw error;
    }
  }

  /**
   * Upload multiple fichiers
   * Endpoint: POST /media/upload-multiple
   * @param files - Tableau de fichiers à uploader
   * @param context - Le dossier de destination (location)
   * @param service - Le nom du service/bucket (default: "navigoo")
   * @returns Réponse avec métadonnées des fichiers uploadés
   */
  async uploadMultipleFiles(
    files: File[],
    context: string = "general",
    service: string = "navigoo"
  ): Promise<any> {
    const cleanLocation = context.replace(/\//g, "_").trim();
    
    console.group(`📤 [MediaService] Upload Multiple Files`);
    console.log("Files count:", files.length);
    console.log("Service:", service);
    console.log("Location:", cleanLocation);

    const formData = new FormData();
    
    // Ajouter tous les fichiers avec le même nom de champ "files"
    files.forEach(file => {
      formData.append("files", file);
    });
    
    formData.append("service", service);
    formData.append("location", cleanLocation);

    try {
      const url = `${MEDIA_API_BASE}/media/upload-multiple`;
      console.log("URL:", url);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      console.log("Response Status:", res.status, res.statusText);

      if (!res.ok) {
        let errorMessage = `Upload failed: ${res.status} ${res.statusText}`;
        
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const textError = await res.text();
            errorMessage = textError || errorMessage;
          }
        } catch {}

        console.groupEnd();
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("✅ Multiple Upload Success!");
      console.groupEnd();

      return data;

    } catch (error: any) {
      console.error("❌ Multiple Upload Exception:", error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Remplace un fichier existant
   * Endpoint: PUT /media/{id}
   * @param mediaId - UUID du fichier à remplacer
   * @param newFile - Le nouveau fichier
   * @param newLocation - Nouveau dossier (optionnel)
   * @returns MediaDto mis à jour
   */
  async replaceFile(
    mediaId: string,
    newFile: File,
    newLocation?: string
  ): Promise<MediaDto> {
    console.group(`🔄 [MediaService] Replace File`);
    console.log("Media ID:", mediaId);
    console.log("New File:", newFile.name);
    
    const formData = new FormData();
    formData.append("file", newFile);
    
    if (newLocation) {
      const cleanLocation = newLocation.replace(/\//g, "_").trim();
      formData.append("location", cleanLocation);
      console.log("New Location:", cleanLocation);
    }

    try {
      const url = `${MEDIA_API_BASE}/media/${mediaId}`;
      console.log("URL:", url);

      const res = await fetch(url, {
        method: "PUT",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      console.log("Response Status:", res.status, res.statusText);

      if (!res.ok) {
        let errorMessage = `Replace failed: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        
        console.groupEnd();
        throw new Error(errorMessage);
      }

      const data: MediaDto = await res.json();
      console.log("✅ Replace Success!");
      console.groupEnd();

      return data;

    } catch (error: any) {
      console.error("❌ Replace Exception:", error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * Récupère les métadonnées d'un média
   * Endpoint: GET /media/infos/metadata/{id}
   * @param mediaId - UUID du fichier
   * @returns MediaDto avec les métadonnées
   */
  async getMetadata(mediaId: string): Promise<MediaDto> {
    try {
      const url = `${MEDIA_API_BASE}/media/infos/metadata/${mediaId}`;
      
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to get metadata: ${res.status}`);
      }

      return await res.json();

    } catch (error: any) {
      console.error("❌ Get Metadata Error:", error);
      throw error;
    }
  }

  /**
   * Liste tous les médias d'un service
   * Endpoint: GET /media/infos/list?service={service}
   * @param service - Nom du service
   * @returns Tableau de MediaDto
   */
  async listMedias(service: string = "navigoo"): Promise<MediaDto[]> {
    try {
      const url = `${MEDIA_API_BASE}/media/infos/list?service=${encodeURIComponent(service)}`;
      
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to list medias: ${res.status}`);
      }

      return await res.json();

    } catch (error: any) {
      console.error("❌ List Medias Error:", error);
      throw error;
    }
  }

  /**
   * Recherche des médias par nom
   * Endpoint: GET /media/infos/search?name={name}&service={service}
   * @param name - Nom ou partie du nom à rechercher
   * @param service - Nom du service
   * @returns Tableau de MediaDto correspondants
   */
  async searchMedias(name: string, service: string = "navigoo"): Promise<MediaDto[]> {
    try {
      const url = `${MEDIA_API_BASE}/media/infos/search?name=${encodeURIComponent(name)}&service=${encodeURIComponent(service)}`;
      
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to search medias: ${res.status}`);
      }

      return await res.json();

    } catch (error: any) {
      console.error("❌ Search Medias Error:", error);
      throw error;
    }
  }

  /**
   * Supprime un média par son ID
   * Endpoint: DELETE /media/{id}
   * @param mediaId - UUID du fichier à supprimer
   */
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      const url = `${MEDIA_API_BASE}/media/${mediaId}`;
      
      const res = await fetch(url, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error(`Failed to delete media: ${res.status}`);
      }

      console.log("✅ Media deleted:", mediaId);

    } catch (error: any) {
      console.error("❌ Delete Media Error:", error);
      throw error;
    }
  }

  /**
   * Supprime un média par son chemin
   * Endpoint: DELETE /media/path/{*path}
   * @param path - Chemin complet (ex: "navigoo/blogs_images/file.jpg")
   */
  async deleteMediaByPath(path: string): Promise<void> {
    try {
      const url = `${MEDIA_API_BASE}/media/path/${encodeURIComponent(path)}`;
      
      const res = await fetch(url, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error(`Failed to delete media by path: ${res.status}`);
      }

      console.log("✅ Media deleted by path:", path);

    } catch (error: any) {
      console.error("❌ Delete Media By Path Error:", error);
      throw error;
    }
  }

  /**
   * Génère l'URL de téléchargement direct d'un média
   * Endpoint: GET /media/{id}
   * @param mediaId - UUID du fichier ou URL complète
   * @returns URL complète pour accéder au fichier
   */
  getMediaUrl(mediaId: string): string {
    if (!mediaId) {
      console.warn("⚠️ [MediaService] Empty mediaId provided");
      return "";
    }
    
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
      return mediaId;
    }
    
    // Générer l'URL via le proxy
    const fullUrl = `${window.location.origin}${MEDIA_API_BASE}/media/proxy/${mediaId}`;
    
    console.log(`🔗 [MediaService] Generated URL: ${fullUrl}`);
    
    return fullUrl;
  }

  /**
   * Génère l'URL de téléchargement via proxy
   * Endpoint: GET /media/proxy/{id}
   * @param mediaId - UUID du fichier
   * @returns URL complète du proxy
   */
  getProxyUrl(mediaId: string): string {
    if (!mediaId) {
      console.warn("⚠️ [MediaService] Empty mediaId provided");
      return "";
    }
    
    if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
      return mediaId;
    }
    
    return `${window.location.origin}${MEDIA_API_BASE}/media/proxy/${mediaId}`;
  }

  /**
   * Télécharge le contenu binaire d'un média
   * Endpoint: GET /media/{id}
   * @param mediaId - UUID du fichier
   * @returns Blob du fichier
   */
  async downloadMedia(mediaId: string): Promise<Blob> {
    try {
      const url = `${MEDIA_API_BASE}/media/${mediaId}`;
      
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to download media: ${res.status}`);
      }

      return await res.blob();

    } catch (error: any) {
      console.error("❌ Download Media Error:", error);
      throw error;
    }
  }
}

export const mediaService = new MediaService();