import * as React from "react"
import { cn } from "@/lib/utils"

export type CardProps = React.ComponentProps<"div">
export type CardHeaderProps = React.ComponentProps<"div">
export type CardTitleProps = React.ComponentProps<"h3">
export type CardToolsProps = React.ComponentProps<"div">
export type CardContentProps = React.ComponentProps<"div">
export type CardFooterProps = React.ComponentProps<"div">
export type CardCaptionProps = React.ComponentProps<"p">

const styles = `
.wlkr-card{box-sizing:border-box;position:relative;min-width:0;padding:14px 16px 12px;border:1px solid var(--border,#dedede);border-radius:12px;background:var(--card,#fff);color:var(--foreground,#010101);font-family:inherit}
.wlkr-card-header{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}.wlkr-card-title{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;margin:0;font-size:15px;font-weight:600;line-height:1.4;letter-spacing:-.012em;overflow-wrap:anywhere}.wlkr-card-tools{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-left:auto}.wlkr-card-content{position:relative;min-width:0;margin-top:6px;font-size:14px;line-height:1.5}.wlkr-card-footer{margin-top:14px}.wlkr-card-caption{max-width:76ch;margin:0;font-size:12px;font-style:italic;color:var(--muted-foreground,#696969);line-height:1.45}
.wlkr-card :focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
`

export function Card({ className, children, ...props }: CardProps) {
  return <div {...props} className={cn("wlkr-card", className)}><style>{styles}</style>{children}</div>
}
export function CardHeader({ className, ...props }: CardHeaderProps) { return <div {...props} className={cn("wlkr-card-header", className)} /> }
export function CardTitle({ className, ...props }: CardTitleProps) { return <h3 {...props} className={cn("wlkr-card-title", className)} /> }
export function CardTools({ className, ...props }: CardToolsProps) { return <div {...props} className={cn("wlkr-card-tools", className)} /> }
export function CardContent({ className, ...props }: CardContentProps) { return <div {...props} className={cn("wlkr-card-content", className)} /> }
export function CardFooter({ className, ...props }: CardFooterProps) { return <div {...props} className={cn("wlkr-card-footer", className)} /> }
export function CardCaption({ className, ...props }: CardCaptionProps) { return <p {...props} className={cn("wlkr-card-caption", className)} /> }
