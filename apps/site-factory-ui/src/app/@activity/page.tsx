import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivitySlot() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        NDJSON events, logs, jobs… (bientôt).
      </CardContent>
    </Card>
  );
}
