import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// Shared MDXRemote options for every <MDXRemote source={...} /> site.
//
// - remarkGfm: pipe-table syntax in blog/lesson/static MDX renders as
//   HTML <table> instead of literal text.
// - rehypeSlug: every `##` heading gets an `id` attribute. The search
//   indexer slugifies heading text with the same github-slugger that
//   rehype-slug uses, so anchors round-trip between rendered pages and
//   search-result URLs (#anchor). See docs/search-architecture.md.
export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
};
