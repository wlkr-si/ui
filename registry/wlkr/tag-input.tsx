"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TagInputProps = Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** Most tags allowed. Further adds are refused. */
  max?: number
  disabled?: boolean
  "aria-label"?: string
}

const styles = `
.wlkr-tag-input{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0;width:100%;padding:6px 0;border-bottom:1px solid var(--border,currentColor);color:var(--foreground,currentColor);cursor:text}
.wlkr-tag-input:focus-within{border-bottom-color:var(--brand,#33f282);box-shadow:0 1px 0 0 var(--brand,#33f282)}
.wlkr-tag-input[data-disabled]{opacity:.5;cursor:not-allowed}
.wlkr-tag-input-list{display:contents;list-style:none;margin:0;padding:0}
.wlkr-tag-input-item{display:inline-flex}
.wlkr-tag-input-tag{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 2px 0 8px;border:1px solid var(--border,currentColor);border-radius:0;background:var(--background,#fff);font-family:var(--font-mono,ui-monospace,monospace);font-size:11px;letter-spacing:.06em;text-transform:uppercase;line-height:1;white-space:nowrap;max-width:100%;cursor:default}
.wlkr-tag-input-tag:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px}
.wlkr-tag-input-tag:focus{border-color:var(--brand,#33f282);background:var(--brand,#33f282);color:#000}
.wlkr-tag-input-text{overflow:hidden;text-overflow:ellipsis}
.wlkr-tag-input-remove{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:0;border-radius:0;background:none;color:inherit;font:inherit;cursor:pointer;opacity:.6}
.wlkr-tag-input-remove:hover{opacity:1;background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-tag-input-remove:focus-visible{outline:2px solid var(--brand,#33f282);outline-offset:2px;opacity:1}
.wlkr-tag-input-remove svg{width:8px;height:8px;shape-rendering:crispEdges}
.wlkr-tag-input-field{flex:1 1 80px;min-width:80px;height:24px;padding:0 2px;border:0;border-radius:0;background:none;color:inherit;font:inherit;font-size:14px;outline:none;caret-color:var(--brand,#33f282)}
.wlkr-tag-input-field::placeholder{color:var(--muted-foreground,#6b6b6b)}
.wlkr-tag-input-field:disabled{cursor:not-allowed}
.wlkr-tag-input-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes wlkr-tag-input-shake-a{0%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}100%{transform:translateX(0)}}
@keyframes wlkr-tag-input-shake-b{0%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}100%{transform:translateX(0)}}
.wlkr-tag-input-tag[data-shake]{border-color:var(--brand,#33f282)}
.wlkr-tag-input-tag[data-shake=a]{animation:wlkr-tag-input-shake-a 320ms steps(5,end)}
.wlkr-tag-input-tag[data-shake=b]{animation:wlkr-tag-input-shake-b 320ms steps(5,end)}
@media(prefers-reduced-motion:reduce){.wlkr-tag-input-tag[data-shake]{animation:none}}
`

const clean = (raw: string) => raw.replace(/\s+/g, " ").trim()

/** A token field. Type and press Enter or comma; tags are square, mono and uppercase. */
export function TagInput({ value, defaultValue, onValueChange, placeholder, max, disabled, className, "aria-label": ariaLabel = "Tags", onClick, ...props }: TagInputProps) {
  const id = React.useId()
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? [])
  const tags = value ?? inner
  const [draft, setDraft] = React.useState("")
  const [shake, setShake] = React.useState<{ tag: string; n: number } | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const tagRefs = React.useRef(new Map<number, HTMLSpanElement>())
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const full = max !== undefined && tags.length >= max

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const commit = (next: string[]) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  const flagDuplicate = (tag: string) => {
    setShake(s => ({ tag, n: (s?.n ?? 0) + 1 }))
    setAnnounce(`${tag} is already added`)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShake(null), 360)
  }

  const add = (parts: string[]) => {
    const next = [...tags]
    const lower = next.map(t => t.toLowerCase())
    let added = 0
    for (const raw of parts) {
      const tag = clean(raw)
      if (!tag) continue
      if (max !== undefined && next.length >= max) break
      if (lower.includes(tag.toLowerCase())) { flagDuplicate(next[lower.indexOf(tag.toLowerCase())]); continue }
      next.push(tag); lower.push(tag.toLowerCase()); added++
    }
    if (added) { commit(next); setAnnounce(`Added ${next.slice(-added).join(", ")}`) }
    return added > 0
  }

  const focusTag = (i: number) => {
    if (i < 0) return
    if (i >= tags.length) { inputRef.current?.focus(); return }
    tagRefs.current.get(i)?.focus()
  }

  const remove = (i: number, refocus: boolean) => {
    const tag = tags[i]
    if (tag === undefined || disabled) return
    commit(tags.filter((_, j) => j !== i))
    setAnnounce(`Removed ${tag}`)
    if (refocus) requestAnimationFrame(() => {
      if (i > 0) tagRefs.current.get(i - 1)?.focus()
      else inputRef.current?.focus()
    })
  }

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    if (e.key === "Enter" || e.key === ",") {
      if (!draft.trim()) { if (e.key === ",") e.preventDefault(); return }
      e.preventDefault()
      if (add([draft])) setDraft("")
      else if (!full) setDraft("")
    } else if (e.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0 && tags.length) {
      e.preventDefault()
      focusTag(tags.length - 1)
    } else if (e.key === "ArrowLeft" && el.selectionStart === 0 && el.selectionEnd === 0 && tags.length) {
      e.preventDefault()
      focusTag(tags.length - 1)
    }
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (!/[,\n]/.test(text)) return
    e.preventDefault()
    add((draft + text).split(/[,\n\r]+/))
    setDraft("")
  }

  const onTagKey = (e: React.KeyboardEvent<HTMLSpanElement>, i: number) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); focusTag(Math.max(0, i - 1)) }
    else if (e.key === "ArrowRight") { e.preventDefault(); focusTag(i + 1) }
    else if (e.key === "Home") { e.preventDefault(); focusTag(0) }
    else if (e.key === "End") { e.preventDefault(); focusTag(tags.length) }
    else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); remove(i, true) }
    else if (e.key === "Escape") { e.preventDefault(); inputRef.current?.focus() }
  }

  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel}
      className={cn("wlkr-tag-input", className)}
      data-disabled={disabled ? "" : undefined}
      onClick={e => { onClick?.(e); if (e.target === e.currentTarget) inputRef.current?.focus() }}
    >
      <style>{styles}</style>
      <ul className="wlkr-tag-input-list" aria-label={`${ariaLabel}, ${tags.length}${max !== undefined ? ` of ${max}` : ""}`}>
        {tags.map((tag, i) => (
          <li key={tag} className="wlkr-tag-input-item">
            <span
              ref={node => { if (node) tagRefs.current.set(i, node); else tagRefs.current.delete(i) }}
              className="wlkr-tag-input-tag"
              tabIndex={-1}
              aria-label={`${tag}. Press Backspace to remove.`}
              data-shake={shake?.tag === tag ? (shake.n % 2 ? "a" : "b") : undefined}
              onKeyDown={e => onTagKey(e, i)}
            >
              <span className="wlkr-tag-input-text" aria-hidden="true">{tag}</span>
              <button type="button" className="wlkr-tag-input-remove" tabIndex={-1} disabled={disabled} aria-label={`Remove ${tag}`} onClick={() => remove(i, false)}>
                <svg viewBox="0 0 8 8" aria-hidden="true"><path d="M0 0h2v2H0zM6 0h2v2H6zM2 2h4v4H2zM0 6h2v2H0zM6 6h2v2H6z" fill="currentColor" /></svg>
              </button>
            </span>
          </li>
        ))}
      </ul>
      <input
        ref={inputRef}
        id={`${id}-field`}
        className="wlkr-tag-input-field"
        value={draft}
        disabled={disabled}
        placeholder={full ? undefined : placeholder}
        aria-label={`Add to ${ariaLabel.toLowerCase()}`}
        aria-describedby={`${id}-hint`}
        readOnly={full}
        enterKeyHint="enter"
        onChange={e => setDraft(e.target.value.replace(/,/g, ""))}
        onKeyDown={onInputKey}
        onPaste={onPaste}
        onBlur={() => { if (draft.trim() && add([draft])) setDraft("") }}
      />
      <span id={`${id}-hint`} className="wlkr-tag-input-sr">Enter or comma adds a tag. Backspace on an empty field selects the last tag; press it again to remove.{full ? " The limit is reached." : ""}</span>
      <span className="wlkr-tag-input-sr" role="status" aria-live="polite">{announce}</span>
    </div>
  )
}
