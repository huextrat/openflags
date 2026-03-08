import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"

import { source } from "@/lib/source"

type DocPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page) {
    notFound()
  }

  const MDXContent = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{
        enabled: true,
      }}
      footer={{
        enabled: true,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={{ 
          ...defaultMdxComponents,
          pre: ({ ref: _ref, ...props }: any) => (
            <CodeBlock {...props}>
              <Pre>{props.children}</Pre>
            </CodeBlock>
          )
        }} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page) {
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
