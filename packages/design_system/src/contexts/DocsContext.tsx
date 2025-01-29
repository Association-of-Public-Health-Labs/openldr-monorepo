import React from "react";
import { MDXProvider } from "@mdx-js/react";

const components = {
  // h1: props => <h1 style={{color: "hotpink"}} {...props}/>,
}

export function DocsProvider ({children}) {
  return (
    <MDXProvider components={components}>
      {children}
    </MDXProvider>
  )
}