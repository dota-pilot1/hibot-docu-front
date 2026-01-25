import { api } from "@/shared/api";

export async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드할 수 있습니다.");
    return null;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    alert("파일 크기는 10MB 이하여야 합니다.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/images/upload?folder=lexical", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
}
