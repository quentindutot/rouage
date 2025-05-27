---
title: Page Metas
---

# Page Metas

Rouage is powered internally by Solid Meta. Most APIs are directly re-exported, while some are extended or newly added.

Installation of `@solidjs/meta` is not needed, all features are provided by `solid-rouage`.

## Basic Example

Below is an example showing how to use page meta components from solid-rouage. The Title, Link, and Meta components let you declaratively manage the page’s metadata.

```jsx
import { Title, Link, Meta } from 'solid-rouage'

export const HomePage = () => (
  <>
    <Title>Title of page</Title>
    <Link rel="canonical" href="http://rouage.dev/" />
    <Meta name="example" content="whatever" />

    {/* ... */}
  </>
)
```

## HTML Metas

| Component | Documentation                                                                                |
|-----------|----------------------------------------------------------------------------------------------|
| Base      | [/solid-meta/reference/meta/base](https://docs.solidjs.com/solid-meta/reference/meta/base) |
| Link      | [/solid-meta/reference/meta/link](https://docs.solidjs.com/solid-meta/reference/meta/link)   |
| Meta      | [/solid-meta/reference/meta/meta](https://docs.solidjs.com/solid-meta/reference/meta/meta)   |
| Style     | [/solid-meta/reference/meta/style](https://docs.solidjs.com/solid-meta/reference/meta/style) |
| Title     | [/solid-meta/reference/meta/title](https://docs.solidjs.com/solid-meta/reference/meta/title) |


## HTTP Metas

**Status:** Sets the HTTP response status code for SSR.

```jsx
<Status code={404} />;
```

**Header:** Sets custom headers for SSR responses.

```jsx
<Header name="x-robots-tag" value="noindex" />
```