import { handleStoreClientUpload } from "@/lib/storage/handle-client-upload";

export async function POST(request: Request) {
  return handleStoreClientUpload(request, "profile");
}
