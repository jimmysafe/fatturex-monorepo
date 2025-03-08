import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export function Intro() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Iniziamo.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Ti ricordiamo che è fondamentale inserire informazioni accurate in quanto verranno utilizzate per la compilazione automatica di tutte le tue fatture e documenti.</p>
      </CardContent>
    </Card>
  );
}
