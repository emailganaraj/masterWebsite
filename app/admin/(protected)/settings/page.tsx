import { SettingsForm } from "@/components/settings/settings-form";
import { PageHeader } from "@/components/admin/page-header";
import { getSiteSettings } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Settings"
        description="Global site name, SEO defaults, and social profiles."
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
