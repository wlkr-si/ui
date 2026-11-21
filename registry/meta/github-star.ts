import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "GitHub star",
  category: "actions",
  description: "A small invitation to the source. Rolling digits, a green star, and one well-timed burst.",
  summary: "A native repository link with an app-supplied count, rolling digits, green star fill, and a bounded burst.",
  keywords: ["github", "repository", "stars", "count up", "rolling number", "burst", "sparkles"],
  since: "0.1.0",
  order: 50,
  usage: `import { GithubStar } from "@/components/wlkr/github-star"

// Supply the real count from your app’s GitHub data.
<GithubStar repository="your-org/your-repo" count={starCount} />

// If the count is unavailable, pass null; the repository link still works.
<GithubStar repository="your-org/your-repo" count={null} />

<GithubStar repository="your-org/your-repo" count={starCount} duration={1800} />`,
  api: [{
    props: [
      { name: "repository", type: "string", description: "A public repository in owner/name form. The link opens it on GitHub." },
      { name: "count", type: "number | null", description: "Star count from your own data. null or a non-finite value shows “GitHub” with no number. Clamped to whole numbers 0–999,999,999." },
      { name: "duration", type: "number", default: "1200", description: "Milliseconds for the count and star fill, 250–5000." },
      { name: "label", type: "string", description: "Accessible name for the link. Defaults to “View owner/name on GitHub, N stars”." },
      { name: "className", type: "string", description: "Merged onto the link." },
    ],
  }],
  notes: [
    "It is a plain link that opens the repository in a new tab. It never fetches stars or performs GitHub’s Star action.",
    "The count plays once when half the link is in view, then replays on hover and keyboard focus.",
    "The final number reserves its full width before the digits roll, so nothing shifts.",
    "The accessible name always holds the final count; rolling digits are hidden from screen readers.",
    "Reduced motion shows the final count and filled star with no roll or burst.",
  ],
  dependencies: ["lucide-react"],
  related: ["rolling-number", "text-link"],
}
