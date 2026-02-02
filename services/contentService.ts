import { Blog, Podcast } from "@/types";

const API_BASE_URL = "https://poi-navigoo.pynfi.com/api";

class ContentService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.status !== 204 ? response.json() : ({} as T);
  }

  // BLOGS
  async createBlog(blog: Partial<Blog>) {
    return this.request<Blog>("/blogs", {
      method: "POST",
      body: JSON.stringify(blog),
    });
  }

  async getBlogsByUser(userId: string) {
    return this.request<Blog[]>(`/blogs/user/${userId}`);
  }

  // PODCASTS
  async createPodcast(podcast: Partial<Podcast>) {
    return this.request<Podcast>("/podcasts", {
      method: "POST",
      body: JSON.stringify(podcast),
    });
  }

  async getPodcastsByUser(userId: string) {
    return this.request<Podcast[]>(`/podcasts/user/${userId}`);
  }
}

export const contentService = new ContentService();