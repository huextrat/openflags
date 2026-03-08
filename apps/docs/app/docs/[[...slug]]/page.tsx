import type { Metadata } from "next"
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { notFound } from "next/navigation"

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
        <MDXContent
          components={{
            ...defaultMdxComponents,
            h1: (props) => (
              <h1
                className="mt-8 mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl"
                {...props}
              />
            ),
            h2: (props) => (
              <h2
                className="mt-10 mb-5 text-2xl font-semibold tracking-tight text-white/90 border-b border-white/5 pb-2 border-dashed"
                {...props}
              />
            ),
            h3: (props) => (
              <h3
                className="mt-8 mb-4 text-xl font-semibold tracking-tight text-white/80"
                {...props}
              />
            ),
            p: (props) => <p className="mb-6 text-[16px] leading-[1.8] text-white/70" {...props} />,
            a: (props) => (
              <a
                className="text-cyan-400 font-medium underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-300 hover:decoration-cyan-400 transition-colors"
                {...props}
              />
            ),
            strong: (props) => <strong className="font-semibold text-white" {...props} />,
            ul: (props) => (
              <ul
                className="my-6 ml-6 list-disc space-y-2 text-white/70 marker:text-violet-500"
                {...props}
              />
            ),
            ol: (props) => (
              <ol
                className="my-6 ml-6 list-decimal space-y-2 text-white/70 marker:text-cyan-500"
                {...props}
              />
            ),
            li: (props) => <li className="leading-relaxed" {...props} />,
            blockquote: (props) => (
              <blockquote
                className="my-6 border-l-[3px] border-violet-500 bg-gradient-to-r from-violet-500/10 to-transparent pl-4 py-3 pr-4 rounded-r-xl text-white/80 italic font-medium shadow-sm"
                {...props}
              />
            ),
            pre: (props: any) => (
              <CodeBlock className="my-6 border border-white/10 shadow-2xl rounded-xl overflow-hidden bg-[#09090b]/80 backdrop-blur-md">
                <Pre
                  {...props}
                  className="max-h-[600px] overflow-auto text-[13px] leading-relaxed p-4"
                />
              </CodeBlock>
            ),
          }}
        />
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
