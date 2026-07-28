import type * as React from "react"

interface AdminPageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
