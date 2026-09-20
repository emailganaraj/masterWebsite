import { TagManager } from "@/components/tags/tag-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listTags } from "@/lib/actions/tags";

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Flat taxonomy tags for articles."
      />
      <TagManager tags={tags} />
    </div>
  );
}
