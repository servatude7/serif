import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {Icon ? <Icon className="size-4" /> : null}
          {label}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}
