type SectionBounds = { id: string; top: number; bottom: number }

/** Follow the section at the reading line, or the first one entering the viewport. */
export function viewedSection(sections: readonly SectionBounds[], viewportHeight: number, readingLine: number): string | null {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return null
  const line = Math.max(0, Math.min(Number.isFinite(readingLine) ? readingLine : 0, viewportHeight - 1))
  const visible = sections.filter(section => Number.isFinite(section.top) && Number.isFinite(section.bottom) && section.bottom > section.top && section.bottom > line && section.top < viewportHeight)
  return visible.findLast(section => section.top <= line)?.id ?? visible[0]?.id ?? null
}
