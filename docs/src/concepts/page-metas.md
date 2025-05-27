---
title: Page Metas
---

# Page Metas

Rouage is powered internally by Solid Meta. Most APIs are directly re-exported, while some are extended or newly added.

Installation of `@solidjs/meta` is not needed, all features are provided by `solid-rouage`.

## HTML Metas

| Component | Documentation                                                                                |
|-----------|----------------------------------------------------------------------------------------------|
| Base      | [/solid-meta/reference/meta/base](https://docs.solidjs.com/solid-meta/reference/meta/base)   |
| Link      | [/solid-meta/reference/meta/link](https://docs.solidjs.com/solid-meta/reference/meta/link)   |
| Meta      | [/solid-meta/reference/meta/meta](https://docs.solidjs.com/solid-meta/reference/meta/meta)   |
| Style     | [/solid-meta/reference/meta/style](https://docs.solidjs.com/solid-meta/reference/meta/style) |
| Title     | [/solid-meta/reference/meta/title](https://docs.solidjs.com/solid-meta/reference/meta/title) |

**Example:**

```jsx
<Title>Title of page</Title>
<Link rel="canonical" href="http://rouage.dev/" />
<Meta name="example" content="whatever" />
```

## HTML Attributes

| Component | Description                                           |
|-----------|-------------------------------------------------------|
| Html      | Sets attributes on the html element                   |
| Head      | Sets attributes on the head element *(rarely needed)* |
| Body      | Sets attributes on the body element                   |

**Example:**

```jsx
<Html lang="en" />
<Body class="bg-gray-50" />
```

## HTTP Metas

| Component | Description                                 |
|-----------|---------------------------------------------|
| Status    | Sets the HTTP status code for SSR responses |
| Header    | Adds custom HTTP headers to SSR responses   |

**Example:**

```jsx
<Status code={404} />
<Header name="Cache-Control" value="no-store" />
```
