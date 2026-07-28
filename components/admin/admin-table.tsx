import type * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface AdminTableColumn<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  /**
   * Drop the column below `md`. Small screens keep the identifying columns and
   * the table itself scrolls horizontally for the rest.
   */
  hideOnMobile?: boolean
  alignEnd?: boolean
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  empty: string
}

/**
 * Read-only table shared by every admin data view. Server component: the admin
 * pages fetch and render on the server, so no data reaches the client bundle.
 */
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  empty,
}: AdminTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                column.hideOnMobile && "hidden md:table-cell",
                column.alignEnd && "text-right"
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.hideOnMobile && "hidden md:table-cell",
                    column.alignEnd && "text-right"
                  )}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
