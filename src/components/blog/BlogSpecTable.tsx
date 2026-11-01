import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface BlogSpecItem {
  property: string;
  specification: React.ReactNode;
  note?: React.ReactNode;
}

export interface BlogSpecTableProps {
  headers?: [string, string, string?];
  items: BlogSpecItem[];
  caption?: string;
  className?: string;
}

export function BlogSpecTable({
  headers = ["Parameter", "Spesifikasi", "Keterangan"],
  items,
  caption,
  className,
}: BlogSpecTableProps) {
  const hasNotes = items.some((item) => item.note !== undefined);
  const showThirdColumn = headers.length > 2 && (hasNotes || headers[2]);

  return (
    <div className={cn("my-6 rounded-lg border border-border bg-card overflow-hidden", className)}>
      <Table>
        {caption && <TableCaption className="text-xs pb-3">{caption}</TableCaption>}
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-1/3 sm:w-1/4 text-xs font-semibold text-foreground py-2.5 px-3 sm:px-4">
              {headers[0]}
            </TableHead>
            <TableHead className="text-xs font-semibold text-foreground py-2.5 px-3 sm:px-4">
              {headers[1]}
            </TableHead>
            {showThirdColumn && headers[2] && (
              <TableHead className="hidden sm:table-cell w-1/3 text-xs font-semibold text-foreground py-2.5 px-3 sm:px-4">
                {headers[2]}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={idx} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
              <TableCell className="align-top py-2.5 px-3 sm:px-4 font-medium text-foreground text-xs sm:text-sm">
                {item.property}
              </TableCell>
              <TableCell className="align-top py-2.5 px-3 sm:px-4 text-foreground/90 text-xs sm:text-sm leading-relaxed">
                <div>{item.specification}</div>
                {showThirdColumn && item.note && (
                  <div className="sm:hidden text-xs text-muted-foreground mt-1 pt-1 border-t border-border/40">
                    {item.note}
                  </div>
                )}
              </TableCell>
              {showThirdColumn && (
                <TableCell className="hidden sm:table-cell align-top py-2.5 px-3 sm:px-4 text-xs text-muted-foreground leading-relaxed">
                  {item.note || "-"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default BlogSpecTable;

