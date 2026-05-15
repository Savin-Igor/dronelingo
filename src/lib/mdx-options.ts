import remarkGfm from "remark-gfm";

// Shared MDXRemote options for every <MDXRemote source={...} /> site.
// Without remarkGfm, pipe-table syntax in blog/lesson/static MDX renders
// as literal text instead of HTML <table>.
export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};
