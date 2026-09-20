import { CategoryManager } from "@/components/categories/category-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage hierarchical content categories."
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
