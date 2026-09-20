import { AuthorManager } from "@/components/authors/author-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listAuthors } from "@/lib/actions/authors";

export default async function AuthorsPage() {
  const authors = await listAuthors();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        description="Manage author profiles linked to articles."
      />
      <AuthorManager authors={authors} />
    </div>
  );
}
