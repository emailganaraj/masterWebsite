import { MediaLibrary } from "@/components/media/media-library";
import { PageHeader } from "@/components/admin/page-header";
import { listMedia } from "@/lib/actions/media";
import { isR2Configured } from "@/lib/media/config";

export default async function MediaPage() {
  const items = await listMedia(100);
  const storageMode = isR2Configured()
    ? "Cloudflare R2"
    : "Local (data/media)";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Upload images with Sharp variants. Use Copy URL in the TipTap editor."
      />
      <MediaLibrary items={items} storageMode={storageMode} />
    </div>
  );
}
