export function getPrototypeCode(duration = 8, morph = true) {
  return `import { PixelObject } from "@/components/wlkr/pixel-object"

export function ProjectPreview() {
  return (
    <PixelObject
      size={160}
      dotShape="circle"
      dotSize={3}
      gap={3}
      pattern="wave"
      flickerAmount={0.65}
      rotationSpeed={0.2}${morph ? `
      morph={{
        shapes: ["sphere", "cube", "torus"],
        duration: ${duration},
      }}` : ""}
      label="An object, taking shape"
    />
  )
}`
}
export const prototypeCode = getPrototypeCode()

export const registryConfig = `{
  "registries": {
    "@wlkr": "https://ui.wlkr.si/r/{name}.json"
  }
}`
