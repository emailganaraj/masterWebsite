"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateAdSenseSettings,
  updateAdSlot,
  type AdSenseSettings,
} from "@/lib/actions/adsense";
import type { AdSlotData } from "@/lib/queries/ad-slots";

type Props = {
  slots: AdSlotData[];
  settings: AdSenseSettings;
};

export function SlotManager({ slots, settings }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [publisherId, setPublisherId] = useState(settings.publisherId);
  const [slotForms, setSlotForms] = useState(
    Object.fromEntries(
      slots.map((s) => [
        s.id,
        {
          enabled: s.enabled,
          slotUnitId: String(s.config.slotUnitId ?? ""),
        },
      ]),
    ),
  );

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateAdSenseSettings({ publisherId });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const saveSlot = (id: string) => {
    setError(null);
    const form = slotForms[id];
    if (!form) return;

    startTransition(async () => {
      const result = await updateAdSlot(id, form);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Publisher settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-4 max-w-lg">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="publisherId">AdSense Publisher ID</Label>
              <Input
                id="publisherId"
                placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                Also configurable via ADSENSE_PUBLISHER_ID env var.
              </p>
            </div>
            <Button type="submit" disabled={pending}>
              Save publisher ID
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {slots.map((slot) => {
          const form = slotForms[slot.id];
          if (!form) return null;

          return (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle className="capitalize">{slot.placement.replace(/_/g, " ")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) =>
                      setSlotForms((prev) => ({
                        ...prev,
                        [slot.id]: { ...form, enabled: e.target.checked },
                      }))
                    }
                  />
                  Enabled
                </label>
                <div className="space-y-2">
                  <Label>Ad unit slot ID</Label>
                  <Input
                    placeholder="1234567890"
                    value={form.slotUnitId}
                    onChange={(e) =>
                      setSlotForms((prev) => ({
                        ...prev,
                        [slot.id]: { ...form, slotUnitId: e.target.value },
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  onClick={() => saveSlot(slot.id)}
                >
                  Save slot
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OAuth reporting (scaffold)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600">
          <p>
            Google AdSense revenue reporting via OAuth (<code>adsense.readonly</code>) will sync
            nightly earnings, impressions, and RPM in a future update. Slot rendering is live
            when publisher ID and unit IDs are configured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
