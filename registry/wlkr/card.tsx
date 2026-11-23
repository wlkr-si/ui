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
.wlkr-card {
  box-sizing: border-box; position: relative; display: flex; flex-direction: column;
  min-width: 0; gap: var(--wlkr-space-3); padding: var(--wlkr-space-5);
  border: var(--wlkr-control-border) solid var(--wlkr-border-default); border-radius: var(--wlkr-radius-xl);
  background: var(--wlkr-surface-raised); color: var(--wlkr-content-primary); box-shadow: var(--wlkr-shadow-raised);
  font-family: inherit;
}
.wlkr-card-header {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--wlkr-space-2) var(--wlkr-space-3);
}
.wlkr-card-title {
  display: flex; align-items: center; flex: auto; gap: var(--wlkr-space-2); min-width: 0; margin: 0;
  font-size: var(--wlkr-text-md); font-weight: var(--wlkr-weight-semibold); line-height: 1.4; overflow-wrap: anywhere;
}
.wlkr-card-tools { display: flex; flex-wrap: wrap; align-items: center; gap: var(--wlkr-space-1_5); margin-inline-start: auto; }
.wlkr-card-content { position: relative; min-width: 0; font-size: var(--wlkr-text-md); line-height: 1.5; overflow-wrap: anywhere; }
.wlkr-card-caption {
  margin: 0; color: var(--wlkr-content-secondary); font-size: var(--wlkr-text-xs); line-height: 1.5; overflow-wrap: anywhere;
}
.wlkr-card:focus-visible, .wlkr-card :where(:focus-visible) {
  outline: var(--wlkr-focus-width) solid var(--wlkr-focus-ring); outline-offset: var(--wlkr-focus-offset);
}
`

export function Card({ className, children, ...props }: CardProps) {
  return <>
    <style href="wlkr-card" precedence="default">{styles}</style>
    <div {...props} className={cn("wlkr-card", className)}>{children}</div>
  </>
}
export function CardHeader({ className, ...props }: CardHeaderProps) { return <div {...props} className={cn("wlkr-card-header", className)} /> }
export function CardTitle({ className, ...props }: CardTitleProps) { return <h3 {...props} className={cn("wlkr-card-title", className)} /> }
export function CardTools({ className, ...props }: CardToolsProps) { return <div {...props} className={cn("wlkr-card-tools", className)} /> }
export function CardContent({ className, ...props }: CardContentProps) { return <div {...props} className={cn("wlkr-card-content", className)} /> }
export function CardFooter({ className, ...props }: CardFooterProps) { return <div {...props} className={cn("wlkr-card-footer", className)} /> }
export function CardCaption({ className, ...props }: CardCaptionProps) { return <p {...props} className={cn("wlkr-card-caption", className)} /> }
