import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HealthSlot() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Services health</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Docker/WP/Next status (bientôt).
      </CardContent>
    </Card>
  );
}
