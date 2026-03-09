import ogImage from "./opengraph-image"

export const runtime = "edge"
export const alt = "OpenFlags - Open Source Feature Flags"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return ogImage()
}
