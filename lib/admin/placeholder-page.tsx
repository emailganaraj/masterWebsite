import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  phase: string;
  description: string;
}

export function PlaceholderPage({ title, phase, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{phase}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-600">
          This module will be implemented in an upcoming phase. The database schema
          and navigation are already in place.
        </CardContent>
      </Card>
    </div>
  );
}
