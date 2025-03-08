import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

interface ContabilitaCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
};

export function ContabilitaCard(props: ContabilitaCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          { props.title }
        </CardTitle>
        <props.icon className="text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{props.value}</div>
        { props.description && <p className="text-xs text-muted-foreground">{props.description}</p> }
      </CardContent>
    </Card>

  );
}
