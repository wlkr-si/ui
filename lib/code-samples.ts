export const showcaseExamples: Record<string, string> = {
  "github-star": `import { GithubStar } from "@/components/wlkr/github-star"\n\n// Supply the real count from your app’s GitHub data.\n<GithubStar repository="your-org/your-repo" count={starCount} />\n// If the count is unavailable, pass null; the repository link still works.`,
  "copy-command": `import { CopyCommand } from "@/components/wlkr/copy-command"\n\n<CopyCommand command="pnpm dlx shadcn@latest add @wlkr/copy-command" />`,
  "async-action": `import { AsyncAction } from "@/components/wlkr/async-action"\n\n<AsyncAction\n  action={async () => {\n    const response = await fetch("/api/settings", { method: "POST" })\n    if (!response.ok) throw new Error("Save failed")\n  }}\n  pendingLabel="Saving changes…"\n  successLabel="Changes saved"\n  failureLabel="Try again"\n  errorLabel="Changes were not saved. Try again."\n>\n  Save changes\n</AsyncAction>`,
  "filter-list": `import { FilterList } from "@/components/wlkr/filter-list"\n\n<FilterList\n  label="Search projects"\n  items={[\n    { id: "studio", label: "Brand Studio", keywords: ["design"] },\n    { id: "weather", label: "WeatherGoblin", description: "Your forecast." },\n  ]}\n/>`,
  "pixel-object": `import { PixelObject, spherePoints } from "@/components/wlkr/pixel-object"\n\n<PixelObject label="Pixel sphere" points={spherePoints(420)} />\n\n// Or give it your own flat mask, with motion disabled.\n<PixelObject\n  mask={["  #  ", " ### ", "#####"]}\n  rotating={false}\n  label="Pixel triangle"\n/>`,
  "page-intro": `import { PageIntro } from "@/components/wlkr/page-intro"\n\n<PageIntro title={"Less.\\nBetter."} description="A clear starting point." />`,
  "index-row": `import { IndexRow } from "@/components/wlkr/index-row"\n\n<IndexRow number={7} title="Brand Studio" description="Considered tools for a clear identity." href="/projects/studio">In progress</IndexRow>`,
  "text-link": `import { TextLink } from "@/components/wlkr/text-link"\n\n<TextLink href="https://wlkr.si" preview={{ title: "WLKR.SI", description: "A small studio building useful things." }}>Explore the studio</TextLink>`,
  "theme-toggle": `import { ThemeToggle } from "@/components/wlkr/theme-toggle"\n\n<ThemeToggle showLabel />\n// Uses wlkr-theme storage; follows system preferences until selected.`,
  "footer-controls": `import { FooterControls } from "@/components/wlkr/footer-controls"\n\n<FooterControls agentHref="/llms.txt" />\n// Supply a real Markdown or plain-text page owned by your app.`,
  typography: `// Use the stylesheet path printed by the CLI.
import "@/styles/wlkr-typography.css"

export function Foundations() {
  return (
    <div className="wlkr-typography wlkr-layout">
      <h1 className="wlkr-display">Well set.</h1>
      <p className="wlkr-intro-copy">A little space to think.</p>
    </div>
  )
}`,

  primitives: `import { Button } from "@/components/ui/button"\nimport { Input } from "@/components/ui/input"\nimport { Switch } from "@/components/ui/switch"\n\n<Button variant="ghost">Continue</Button>\n<label htmlFor="name">Your name</label>\n<Input id="name" placeholder="Alex Walker" />\n<Switch aria-label="Enable notifications" />`,
}

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

export const tokenReference = `--background         Canvas
--foreground         Primary text
--muted-foreground   Supporting text
--primary            Primary action
--success            Successful completion
--destructive        Failure feedback
--ring               Keyboard focus
--brand              #33F282
--brand-foreground   #010101

Apply .dark to the document root for dark mode.
The theme leaves your app’s typography unchanged.`

export const registryConfig = `{
  "registries": {
    "@wlkr": "https://ui.wlkrlabs.com/r/{name}.json"
  }
}`
