---
title: Page Metas
---

# Page Metas

Rouage is powered internally by Solid Meta. Most APIs are directly re-exported, while some are extended or newly added.

Installation of `@solidjs/meta` is not needed, all features are provided by `solid-rouage`.

:::info
No need to set up a MetaProvider, it is already included by default.
:::

## Basic Example

Below is an example showing how to use page meta components from solid-rouage. The Title, Link, and Meta components let you declaratively manage the page’s metadata.

```jsx
import { Title, Link, Meta } from 'solid-rouage'

export const HomePage = () => (
  <div class="Home">
    <Title>Title of page</Title>
    <Link rel="canonical" href="http://rouage.dev/" />
    <Meta name="example" content="whatever" />
    {/* ... */}
  </div>
)
```


## HTTP Metas

**HttpStatusCode:** Sets the HTTP response status code for SSR.

```jsx
<HttpStatusCode code={404} />;
```

**HttpHeader:** Sets custom headers for SSR responses.

```jsx
<HttpHeader name="x-robots-tag" value="noindex" />
```

## HTML Metas

| Component | Documentation                                                                                |
|-----------|----------------------------------------------------------------------------------------------|
| Base      | [/solid-meta/reference/meta/base](https://docs.solidjs.com/solid-meta/reference/meta/base) |
| Link      | [/solid-meta/reference/meta/link](https://docs.solidjs.com/solid-meta/reference/meta/link)   |
| Meta      | [/solid-meta/reference/meta/meta](https://docs.solidjs.com/solid-meta/reference/meta/meta)   |
| Style     | [/solid-meta/reference/meta/style](https://docs.solidjs.com/solid-meta/reference/meta/style) |
| Title     | [/solid-meta/reference/meta/title](https://docs.solidjs.com/solid-meta/reference/meta/title) |
