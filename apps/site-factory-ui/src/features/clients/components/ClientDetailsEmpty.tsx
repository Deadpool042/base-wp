"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  title?: string;
  description?: string;
  showActions?: boolean;
};

export function ClientDetailsEmpty({
  title = "Détails du client",
  description = "Sélectionnez un client à gauche pour voir ses projets et actions.",
  showActions = true,
}: Props) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">Clients</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        <Separator />

        {showActions ? (
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline">
              <Link href="/clients">Voir les clients</Link>
            </Button>

            <Button
              asChild
              variant="ghost">
              <Link href="/projects">Aller aux projets</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
