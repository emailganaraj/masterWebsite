"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateSiteSettings,
  type SiteSettingsForm,
} from "@/lib/actions/settings";

export function SettingsForm({ initial }: { initial: SiteSettingsForm }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(initial);
  const [socialJson, setSocialJson] = useState(
    JSON.stringify(initial.socialProfiles ?? {}, null, 2),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    let socialProfiles: Record<string, string> = {};
    try {
      socialProfiles = JSON.parse(socialJson || "{}");
    } catch {
      setError("Social profiles must be valid JSON.");
      return;
    }

    startTransition(async () => {
      const result = await updateSiteSettings({ ...form, socialProfiles });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-600">Settings saved.</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input
              id="siteName"
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site description</Label>
            <Textarea
              id="siteDescription"
              value={form.siteDescription}
              onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="UTC"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultSeoTitle">Default title</Label>
            <Input
              id="defaultSeoTitle"
              value={form.defaultSeoTitle}
              onChange={(e) => setForm({ ...form, defaultSeoTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultSeoDescription">Default description</Label>
            <Textarea
              id="defaultSeoDescription"
              value={form.defaultSeoDescription}
              onChange={(e) =>
                setForm({ ...form, defaultSeoDescription: e.target.value })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Profiles (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={socialJson}
            onChange={(e) => setSocialJson(e.target.value)}
            rows={6}
            className="font-mono text-xs"
            placeholder='{"twitter": "https://twitter.com/..."}'
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
