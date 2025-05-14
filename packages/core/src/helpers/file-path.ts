const PATH_TRAVERSAL_REGEX = /(?:^|[\/\\])\.\.(?:$|[\/\\])/
const LEADING_SLASH_REGEX = /^\.?[\/\\]/
const BACKSLASH_REGEX = /\\/
const TRAILING_SLASH_REGEX = /\/$/
const LEADING_DOT_SLASH_REGEX = /^\.?\//

export const getFilePath = (root: string, path: string) => {
  // Prevent path traversal attacks by rejecting paths containing ".."
  if (PATH_TRAVERSAL_REGEX.test(path)) {
    return
  }

  // /foo.html => foo.html
  const normalizedPath = path.replace(LEADING_SLASH_REGEX, '')

  // foo\bar.txt => foo/bar.txt
  const forwardSlashPath = normalizedPath.replace(BACKSLASH_REGEX, '/')

  // assets/ => assets
  const normalizedRoot = root.replace(TRAILING_SLASH_REGEX, '')

  // ./assets/foo.html => assets/foo.html
  let filePath = normalizedRoot ? `${normalizedRoot}/${forwardSlashPath}` : forwardSlashPath
  filePath = filePath.replace(LEADING_DOT_SLASH_REGEX, '')

  return `/${filePath}`
}
