import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Files
export const filesApi = {
  list: (params?: { folder?: string; type?: string; search?: string }) =>
    api.get("/api/files", { params }),
  upload: (formData: FormData, onProgress?: (progress: number) => void) =>
    api.post("/api/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }),
  delete: (id: string) => api.delete(`/api/files/${id}`),
  getDownloadUrl: (id: string) => api.get(`/api/files/${id}/download`),
  move: (id: string, folderId: string) =>
    api.patch(`/api/files/${id}/move`, { folderId }),
};

// Folders
export const foldersApi = {
  list: () => api.get("/api/folders"),
  create: (name: string, parentId?: string) =>
    api.post("/api/folders", { name, parentId }),
  delete: (id: string) => api.delete(`/api/folders/${id}`),
  rename: (id: string, name: string) =>
    api.patch(`/api/folders/${id}`, { name }),
};

// Storage stats
export const storageApi = {
  getStats: () => api.get("/api/storage/stats"),
};
