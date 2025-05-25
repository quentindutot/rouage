export type HandleResponse<Content> = {
  status: number
  headers: Record<string, string>
  content: Content
}
