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

  "dot-field": "import { DotField } from \"@/components/wlkr/dot-field\"\n\n<DotField className=\"h-[420px] w-full\" radius={140}>\n  <div className=\"flex h-full items-center justify-center\">\n    <h1>Brand Studio</h1>\n  </div>\n</DotField>\n// You size the field; the dots fill it.",
  "pixel-image": "import { PixelImage } from \"@/components/wlkr/pixel-image\"\n\n<PixelImage\n  src=\"/work/weathergoblin.jpg\"\n  alt=\"WeatherGoblin forecast on a phone\"\n  width={1600}\n  height={1000}\n  trigger=\"both\"\n  className=\"w-full\"\n/>\n// width and height reserve the space, so nothing shifts.",
  "dot-matrix": "import { DotMatrix } from \"@/components/wlkr/dot-matrix\"\n\n<DotMatrix text=\"NEXT: BRAND STUDIO 14:32  ·  ON TIME\" columns={64} />\n\n// Dots take the surrounding text colour.\n<span style={{ color: \"var(--success)\" }}>\n  <DotMatrix text=\"OK 200\" shape=\"round\" dotSize={5} />\n</span>",
  "pixel-progress": "import { PixelProgress } from \"@/components/wlkr/pixel-progress\"\n\n<PixelProgress label=\"Uploading assets\" value={percent} showValue />\n\n// No known length yet? Pass null.\n<PixelProgress label=\"Preparing upload\" value={null} />",
  "liquid-tabs": "import { LiquidTabs } from \"@/components/wlkr/liquid-tabs\"\n\nconst [view, setView] = React.useState(\"overview\")\n\n<LiquidTabs\n  label=\"Project view\"\n  value={view}\n  onValueChange={setView}\n  items={[\n    { value: \"overview\", label: \"Overview\" },\n    { value: \"activity\", label: \"Activity\" },\n    { value: \"files\", label: \"Files\" },\n  ]}\n/>",
  "ticker": "import { Ticker } from \"@/components/wlkr/ticker\"\n\n<Ticker label=\"Studio status\" speed={40}>\n  <span>Brand Studio — shipped</span>\n  <a href=\"/work/weathergoblin\">WeatherGoblin — in development</a>\n  <span>PatriBible — reading plan live</span>\n</Ticker>",
  "decode-text": "import { DecodeText } from \"@/components/wlkr/decode-text\"\n\n<DecodeText as=\"h2\" trigger=\"view\" text=\"Useful things, thoughtfully built.\" />\n\n// Inside a link, the whole link replays it on hover and focus.\n<a href=\"/work\">\n  <DecodeText trigger=\"hover\" glyphs=\"▚▞░▒▓\" text=\"Work\" />\n</a>",
  "rolling-number": "import { RollingNumber } from \"@/components/wlkr/rolling-number\"\n\n<RollingNumber value={total} />\n\n<RollingNumber\n  value={revenue}\n  format={{ style: \"currency\", currency: \"USD\" }}\n/>\n// Size, weight and colour come from the parent.",
  "hold-action": "import { HoldAction } from \"@/components/wlkr/hold-action\"\n\n<HoldAction\n  tone=\"destructive\"\n  confirmedLabel=\"Deleted\"\n  onConfirm={async () => {\n    await deleteProject(id)\n  }}\n>\n  Hold to delete\n</HoldAction>",
  "shortcut": "import { Shortcut } from \"@/components/wlkr/shortcut\"\n\n<button type=\"button\" onClick={openSearch}>\n  Search\n  <Shortcut keys=\"mod+k\" onTrigger={openSearch} />\n</button>\n\n// Without onTrigger it is a live hint only.\n<Shortcut keys=\"shift+?\" size=\"sm\" />",
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
    "@wlkr": "https://ui.wlkr.si/r/{name}.json"
  }
}`
