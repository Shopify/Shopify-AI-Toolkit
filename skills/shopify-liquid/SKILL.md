---
name: shopify-liquid
description: "Liquid is an open-source templating language created by Shopify. It is the backbone of Shopify themes and is used to load dynamic content on storefronts. Keywords: liquid, theme, shopify-theme, liquid-component, liquid-block, liquid-section, liquid-snippet, liquid-schemas, shopify-theme-schemas"
compatibility: Claude Code, Claude Desktop, Cursor
metadata:
  author: Shopify
  version: "1.0"
---

## Required Tool Calls (do not skip)

You have a `bash` tool. Every response must use it — in this order:
1. Call `bash` with `node scripts/search_docs.mjs "<tag, filter, or object name>"` — search before writing code
   **Search limit: max 2 searches. If both return `[]`, skip to step 2 using your built-in Liquid knowledge.**
2. Write the code using the search results (or built-in knowledge if search returned nothing)
3. Call `bash` with `node scripts/validate.mjs --filename <file.liquid> --filetype <sections|snippets|blocks|...> --code '<content>' --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION --artifact-id YOUR_ARTIFACT_ID --revision REVISION_NUMBER` — validate before returning
   (Always include these flags. Use your actual model name for YOUR_MODEL_NAME; use claude-code/cursor/etc. for YOUR_CLIENT_NAME. For YOUR_ARTIFACT_ID, generate a stable random ID per code block and reuse it across validation retries. For REVISION_NUMBER, start at 1 and increment on each retry of the same artifact.)
4. If validation fails: search for the error type, fix, re-validate (max 3 retries)
5. Return code only after validation passes

**You must run both search_docs.mjs and validate.mjs in every response. Do not return code to the user without completing step 3.**

---

# Your task

You are an experienced Shopify theme developer, implement user requests by generating theme components that are consistent with the 'Key principles' and the 'Theme architecture'.

## Theme Architecture

**Key principles: focus on generating snippets, blocks, and sections; users may create templates using the theme editor**

### Directory structure

```
.
├── assets          # Stores static assets (CSS, JS, images, fonts, etc.)
├── blocks          # Reusable, nestable, customizable components
├── config          # Global theme settings and customization options
├── layout          # Top-level wrappers for pages (layout templates)
├── locales         # Translation files for theme internationalization
├── sections        # Modular full-width page components
├── snippets        # Reusable Liquid code or HTML fragments
└── templates       # Templates combining sections and blocks to define page structures
```

#### `sections`

- Sections are `.liquid` files that allow you to create reusable modules that can be customized by merchants
- Sections can include blocks which allow merchants to add, remove, and reorder content within a section
- Sections are made customizable by including the required `{% schema %}` tag that exposes settings in the theme editor via a JSON object. Validate that JSON object using the `schemas/section.json` JSON schema
- Examples of sections: hero banners, product grids, testimonials, featured collections

#### `blocks`

- Blocks are `.liquid` files that allow you to create reusable small components that can be customized by merchants (they don't need to fit the full-width of the page)
- Blocks are ideal for logic that needs to be reused and also edited in the theme editor by merchants
- Blocks can include other nested blocks which allow merchants to add, remove, and reorder content within a block too
- Blocks are made customizable by including the required `{% schema %}` tag that exposes settings in the theme editor via a JSON object. Validate that JSON object using the `schemas/theme_block.json` JSON schema
- Blocks must have the `{% doc %}` tag as the header if you directly/staticly render them in other file via `{% content_for 'block', id: '42', type: 'block_name' %}`
- Examples of blocks: individual testimonials, slides in a carousel, feature items

#### `snippets`

- Snippets are reusable code fragments rendered in blocks, sections, and layouts files via the `render` tag
- Snippets are ideal for logic that needs to be reused but not directly edited in the theme editor by merchants
- Snippets accept parameters when rendered for dynamic behavior
- Snippets must have the `{% doc %}` tag as the header
- Examples of sections: buttons, meta-tags, css-variables, and form elements

#### `layout`

- Defines the overall HTML structure of the site, including `<head>` and `<body>`, and wraps other templates to provide a consistent frame
- Contains repeated global elements like navigation, cart drawer, footer, and usually includes CSS/JS assets and meta tags
- Must include `{{ content_for_header }}` to inject Shopify scripts in the `<head>` and `{{ content_for_layout }}` to render the page content

#### `config`

- `config/settings_schema.json` is a JSON file that defines schema for global theme settings. Validate the shape shape of this JSON file using the `schemas/theme_settings.json` JSON schema
- `config/settings_data.json` is JSON file that holds the data for the settings defined by `config/settings_schema.json`

#### `assets`

- Contains static files like CSS, JavaScript, and images—including compiled and optimized assets—referenced in templates via the `asset_url` filter
- Keep it here only `critical.css` and static files necessary for every page, otherwise prefer the usage of the `{% stylesheet %}` and `{% javascript %}` tags

#### `locales`

- Stores translation files organized by language code (e.g., `en.default.json`, `fr.json`) to localize all user-facing theme content and editor strings
- Enables multi-language support by providing translations accessible via filters like `{{ 'key' | t }}` in Liquid for proper internationalization
- Validate `locales` JSON files using the `schemas/translations.json` JSON schema

#### `templates`

- JSON file that define the structure, ordering, and which sections and blocks appear on each page type, allowing merchants to customize layouts without code changes

### CSS & JavaScript

- Write CSS and JavaScript per components using the `{% stylesheet %}` and `{% javascript %}` tags
- Note: `{% stylesheet %}` and `{% javascript %}` are only supported in `snippets/`, `blocks/`, and `sections/`

### LiquidDoc

Snippets and blocks (when blocks are statically rendered) must include the LiquidDoc header that documents the purpose of the file and required parameters. Example:

```liquid
{% doc %}
  Renders a responsive image that might be wrapped in a link.

  @param {image} image - The image to be rendered
  @param {string} [url] - An optional destination URL for the image

  @example
  {% render 'image', image: product.featured_image %}
{% enddoc %}

<a href="{{ url | default: '#' }}">{{ image | image_url: width: 200, height: 200 | image_tag }}</a>
```

## The `{% schema %}` tag on blocks and sections

**Key principles: follow the "Good practices" and "Validate the `{% schema %}` content" using JSON schemas**

### Good practices

When defining the `{% schema %}` tag on sections and blocks, follow these guidelines to use the values:

**Single property settings**: For settings that correspond to a single CSS property, use CSS variables:
```liquid
<div class="collection" style="--gap: {{ block.settings.gap }}px">
  Example
</div>

{% stylesheet %}
  .collection {
    gap: var(--gap);
  }
{% endstylesheet %}

{% schema %}
{
  "settings": [{
    "type": "range",
    "label": "gap",
    "id": "gap",
    "min": 0,
    "max": 100,
    "unit": "px",
    "default": 0,
  }]
}
{% endschema %}
```

**Multiple property settings**: For settings that control multiple CSS properties, use CSS classes:
```liquid
<div class="collection {{ block.settings.layout }}">
  Example
</div>

{% stylesheet %}
  .collection--full-width {
    /* multiple styles */
  }
  .collection--narrow {
    /* multiple styles */
  }
{% endstylesheet %}

{% schema %}
{
  "settings": [{
    "type": "select",
    "id": "layout",
    "label": "layout",
    "values": [
      { "value": "collection--full-width", "label": "t:options.full" },
      { "value": "collection--narrow", "label": "t:options.narrow" }
    ]
  }]
}
{% endschema %}
```

#### Mobile layouts

If you need to create a mobile layout and you want the merchant to be able to select one or two columns, use a select input:

```liquid
{% schema %}
{
  "type": "select",
  "id": "columns_mobile",
  "label": "Columns on mobile",
  "options": [
    { "value": 1, "label": "1" },
    { "value": "2", "label": "2" }
  ]
}
{% endschema %}
```

## Liquid

### Liquid delimiters

- **`{{ ... }}`**: Output – prints a value.
- **`{{- ... -}}`**: Output, trims whitespace around the value.
- **`{% ... %}`**: Logic/control tag (if, for, assign, etc.), does not print anything, no whitespace trim.
- **`{%- ... -%}`**: Logic/control tag, trims whitespace around the tag.

**Tip:**
Adding a dash (`-`) after `{%`/`{{` or before `%}`/`}}` trims spaces or newlines next to the tag.

**Examples:**
- `{{- product.title -}}` → print value, remove surrounding spaces or lines.
- `{%- if available -%}In stock{%- endif -%}` → logic, removes extra spaces/lines.

### Liquid operators

**Comparison operators:**
- ==
- !=
- >
- <
- >=
- <=

**Logical operators:**
- `or`
- `and`
- `contains` - checks if a string contains a substring, or if an array contains a string

#### Comparison and comparison tags

**Key condition principles:**
- For simplificity, ALWAYS use nested `if` conditions when the logic requires more than one logical operator
- Parentheses are not supported in Liquid
- Ternary conditionals are not supported in Liquid, so always use `{% if cond %}`

**Basic comparison example:**
```liquid
{% if product.title == "Awesome Shoes" %}
  These shoes are awesome!
{% endif %}
```

**Multiple Conditions:**
```liquid
{% if product.type == "Shirt" or product.type == "Shoes" %}
  This is a shirt or a pair of shoes.
{% endif %}
```

**Contains Usage:**
- For strings: `{% if product.title contains "Pack" %}`
- For arrays: `{% if product.tags contains "Hello" %}`
- Note: `contains` only works with strings, not objects in arrays

**{% elsif %} (used inside if/unless only)**
```liquid
{% if a %}
  ...
{% elsif b %}
  ...
{% endif %}
```

**{% unless %}**
```liquid
{% unless condition %}
  ...
{% endunless %}
```

**{% case %}**
```liquid
{% case variable %}
  {% when 'a' %}
    a
  {% when 'b' %}
    b
  {% else %}
    other
{% endcase %}
```

**{% else %} (used inside if, unless, case, or for)**
```liquid
{% if product.available %}
  In stock
{% else %}
  Sold out
{% endif %}
```
_or inside a for loop:_
```liquid
{% for item in collection.products %}
  {{ item.title }}
{% else %}
  No products found.
{% endfor %}
```

#### Variables and variable tags

```liquid
{% assign my_variable = 'value' %}

{% capture my_variable %}
  Contents of variable
{% endcapture %}

{% increment counter %}
{% decrement counter %}
```

### Liquid filters

You can chain filters in Liquid, passing the result of one filter as the input to the next.

See these filters:

- `upcase`: `{{ string | upcase }}` returns a **string**
- `split`: `{{ string | split: string }}` returns an **array** (as we may notice in the docs, `split` receives a string as its argument)
- `last`: `{{ array | last }}` returns **untyped**

Each filter can pass its return value to the next filter as long as the types match.

For example, `upcase` returns a string, which is suitable input for `split`, which then produces an array for `last` to use.

Here's how the filters are executed step by step to eventually return `"WORLD"`:

```liquid
{{ "hello world" | upcase | split: " " | last }}
```

- First, `"hello world"` is converted to uppercase: `"HELLO WORLD"`, which is a string
- Next, `split` can act on strings, so it splits the value by space into an array: `["HELLO", "WORLD"]`
- Finally, the `last` filter work with array, so `"WORLD"` is returned

#### Array
- `compact`: `{{ array | compact }}` returns `array`
- `concat`: `{{ array | concat: array }}` returns `array`
- `find`: `{{ array | find: string, string }}` returns `untyped`
- `find_index`: `{{ array | find_index: string, string }}` returns `number`
- `first`: `{{ array | first }}` returns `untyped`
- `has`: `{{ array | has: string, string }}` returns `boolean`
- `join`: `{{ array | join }}` returns `string`
- `last`: `{{ array | last }}` returns `untyped`
- `map`: `{{ array | map: string }}` returns `array`
- `reject`: `{{ array | reject: string, string }}` returns `array`
- `reverse`: `{{ array | reverse }}` returns `array`
- `size`: `{{ variable | size }}` returns `number`
- `sort`: `{{ array | sort }}` returns `array`
- `sort_natural`: `{{ array | sort_natural }}` returns `array`
- `sum`: `{{ array | sum }}` returns `number`
- `uniq`: `{{ array | uniq }}` returns `array`
- `where`: `{{ array | where: string, string }}` returns `array`

#### Cart
- `item_count_for_variant`: `{{ cart | item_count_for_variant: {variant_id} }}` returns `number`
- `line_items_for`: `{{ cart | line_items_for: object }}` returns `array`

#### Collection
- `link_to_type`: `{{ string | link_to_type }}` returns `string`
- `link_to_vendor`: `{{ string | link_to_vendor }}` returns `string`
- `sort_by`: `{{ string | sort_by: string }}` returns `string`
- `url_for_type`: `{{ string | url_for_type }}` returns `string`
- `url_for_vendor`: `{{ string | url_for_vendor }}` returns `string`
- `within`: `{{ string | within: collection }}` returns `string`
- `highlight_active_tag`: `{{ string | highlight_active_tag }}` returns `string`

#### Color
- `brightness_difference`: `{{ string | brightness_difference: string }}` returns `number`
- `color_brightness`: `{{ string | color_brightness }}` returns `number`
- `color_contrast`: `{{ string | color_contrast: string }}` returns `number`
- `color_darken`: `{{ string | color_darken: number }}` returns `string`
- `color_desaturate`: `{{ string | color_desaturate: number }}` returns `string`
- `color_difference`: `{{ string | color_difference: string }}` returns `number`
- `color_extract`: `{{ string | color_extract: string }}` returns `number`
- `color_lighten`: `{{ string | color_lighten: number }}` returns `string`
- `color_mix`: `{{ string | color_mix: string, number }}` returns `string`
- `color_modify`: `{{ string | color_modify: string, number }}` returns `string`
- `color_saturate`: `{{ string | color_saturate: number }}` returns `string`
- `color_to_hex`: `{{ string | color_to_hex }}` returns `string`
- `color_to_hsl`: `{{ string | color_to_hsl }}` returns `string`
- `color_to_oklch`: `{{ string | color_to_oklch }}` returns `string`
- `color_to_rgb`: `{{ string | color_to_rgb }}` returns `string`
- `hex_to_rgba`: `{{ string | hex_to_rgba }}` returns `string`

#### Customer
- `customer_login_link`: `{{ string | customer_login_link }}` returns `string`
- `customer_logout_link`: `{{ string | customer_logout_link }}` returns `string`
- `customer_register_link`: `{{ string | customer_register_link }}` returns `string`
- `avatar`: `{{ customer | avatar }}` returns `string`
- `login_button`: `{{ shop | login_button }}` returns `string`

#### Date
- `date`: `{{ date | date: string }}` returns `string`

#### Default
- `default_errors`: `{{ string | default_errors }}` returns `string`
- `default`: `{{ variable | default: variable }}` returns `untyped`
- `default_pagination`: `{{ paginate | default_pagination }}` returns `string`

#### Font
- `font_face`: `{{ font | font_face }}` returns `string`
- `font_modify`: `{{ font | font_modify: string, string }}` returns `font`
- `font_url`: `{{ font | font_url }}` returns `string`

#### Format
- `date`: `{{ string | date: string }}` returns `string`
- `json`: `{{ variable | json }}` returns `string`
- `structured_data`: `{{ variable | structured_data }}` returns `string`
- `unit_price_with_measurement`: `{{ number | unit_price_with_measurement: unit_price_measurement }}` returns `string`
- `weight_with_unit`: `{{ number | weight_with_unit }}` returns `string`

#### Hosted_file
- `asset_img_url`: `{{ string | asset_img_url }}` returns `string`
- `asset_url`: `{{ string | asset_url }}` returns `string`
- `file_img_url`: `{{ string | file_img_url }}` returns `string`
- `file_url`: `{{ string | file_url }}` returns `string`
- `global_asset_url`: `{{ string | global_asset_url }}` returns `string`
- `shopify_asset_url`: `{{ string | shopify_asset_url }}` returns `string`

#### Html
- `class_list`: `{{ settings.layout | class_list }}` returns `string`
- `time_tag`: `{{ string | time_tag: string }}` returns `string`
- `inline_asset_content`: `{{ asset_name | inline_asset_content }}` returns `string`
- `highlight`: `{{ string | highlight: string }}` returns `string`
- `link_to`: `{{ string | link_to: string }}` returns `string`
- `placeholder_svg_tag`: `{{ string | placeholder_svg_tag }}` returns `string`
- `preload_tag`: `{{ string | preload_tag: as: string }}` returns `string`
- `script_tag`: `{{ string | script_tag }}` returns `string`
- `stylesheet_tag`: `{{ string | stylesheet_tag }}` returns `string`

#### Localization
- `currency_selector`: `{{ form | currency_selector }}` returns `string`
- `translate`: `{{ string | t }}` returns `string`
- `format_address`: `{{ address | format_address }}` returns `string`

#### Math
- `abs`: `{{ number | abs }}` returns `number`
- `at_least`: `{{ number | at_least }}` returns `number`
- `at_most`: `{{ number | at_most }}` returns `number`
- `ceil`: `{{ number | ceil }}` returns `number`
- `divided_by`: `{{ number | divided_by: number }}` returns `number`
- `floor`: `{{ number | floor }}` returns `number`
- `minus`: `{{ number | minus: number }}` returns `number`
- `modulo`: `{{ number | modulo: number }}` returns `number`
- `plus`: `{{ number | plus: number }}` returns `number`
- `round`: `{{ number | round }}` returns `number`
- `times`: `{{ number | times: number }}` returns `number`

#### Media
- `external_video_tag`: `{{ variable | external_video_tag }}` returns `string`
- `external_video_url`: `{{ media | external_video_url: attribute: string }}` returns `string`
- `image_tag`: `{{ string | image_tag }}` returns `string`
- `media_tag`: `{{ media | media_tag }}` returns `string`
- `model_viewer_tag`: `{{ media | model_viewer_tag }}` returns `string`
- `video_tag`: `{{ media | video_tag }}` returns `string`
- `article_img_url`: `{{ variable | article_img_url }}` returns `string`
- `collection_img_url`: `{{ variable | collection_img_url }}` returns `string`
- `image_url`: `{{ variable | image_url: width: number, height: number }}` returns `string`
- `img_tag`: `{{ string | img_tag }}` returns `string`
- `img_url`: `{{ variable | img_url }}` returns `string`
- `product_img_url`: `{{ variable | product_img_url }}` returns `string`

#### Metafield
- `metafield_tag`: `{{ metafield | metafield_tag }}` returns `string`
- `metafield_text`: `{{ metafield | metafield_text }}` returns `string`

#### Money
- `money`: `{{ number | money }}` returns `string`
- `money_with_currency`: `{{ number | money_with_currency }}` returns `string`
- `money_without_currency`: `{{ number | money_without_currency }}` returns `string`
- `money_without_trailing_zeros`: `{{ number | money_without_trailing_zeros }}` returns `string`

#### Payment
- `payment_button`: `{{ form | payment_button }}` returns `string`
- `payment_terms`: `{{ form | payment_terms }}` returns `string`
- `payment_type_img_url`: `{{ string | payment_type_img_url }}` returns `string`
- `payment_type_svg_tag`: `{{ string | payment_type_svg_tag }}` returns `string`

#### String
- `hmac_sha1`: `{{ string | hmac_sha1: string }}` returns `string`
- `hmac_sha256`: `{{ string | hmac_sha256: string }}` returns `string`
- `md5`: `{{ string | md5 }}` returns `string`
- `sha1`: `{{ string | sha1: string }}` returns `string`
- `sha256`: `{{ string | sha256: string }}` returns `string`
- `append`: `{{ string | append: string }}` returns `string`
- `base64_decode`: `{{ string | base64_decode }}` returns `string`
- `base64_encode`: `{{ string | base64_encode }}` returns `string`
- `base64_url_safe_decode`: `{{ string | base64_url_safe_decode }}` returns `string`
- `base64_url_safe_encode`: `{{ string | base64_url_safe_encode }}` returns `string`
- `capitalize`: `{{ string | capitalize }}` returns `string`
- `downcase`: `{{ string | downcase }}` returns `string`
- `escape`: `{{ string | escape }}` returns `string`
- `escape_once`: `{{ string | escape_once }}` returns `string`
- `lstrip`: `{{ string | lstrip }}` returns `string`
- `newline_to_br`: `{{ string | newline_to_br }}` returns `string`
- `prepend`: `{{ string | prepend: string }}` returns `string`
- `remove`: `{{ string | remove: string }}` returns `string`
- `remove_first`: `{{ string | remove_first: string }}` returns `string`
- `remove_last`: `{{ string | remove_last: string }}` returns `string`
- `replace`: `{{ string | replace: string, string }}` returns `string`
- `replace_first`: `{{ string | replace_first: string, string }}` returns `string`
- `replace_last`: `{{ string | replace_last: string, string }}` returns `string`
- `rstrip`: `{{ string | rstrip }}` returns `string`
- `slice`: `{{ string | slice }}` returns `string`
- `split`: `{{ string | split: string }}` returns `array`
- `strip`: `{{ string | strip }}` returns `string`
- `strip_html`: `{{ string | strip_html }}` returns `string`
- `strip_newlines`: `{{ string | strip_newlines }}` returns `string`
- `truncate`: `{{ string | truncate: number }}` returns `string`
- `truncatewords`: `{{ string | truncatewords: number }}` returns `string`
- `upcase`: `{{ string | upcase }}` returns `string`
- `url_decode`: `{{ string | url_decode }}` returns `string`
- `url_encode`: `{{ string | url_encode }}` returns `string`
- `camelize`: `{{ string | camelize }}` returns `string`
- `handleize`: `{{ string | handleize }}` returns `string`
- `url_escape`: `{{ string | url_escape }}` returns `string`
- `url_param_escape`: `{{ string | url_param_escape }}` returns `string`
- `pluralize`: `{{ number | pluralize: string, string }}` returns `string`

#### Tag
- `link_to_add_tag`: `{{ string | link_to_add_tag }}` returns `string`
- `link_to_remove_tag`: `{{ string | link_to_remove_tag }}` returns `string`
- `link_to_tag`: `{{ string | link_to_tag }}` returns `string`

### Liquid objects

#### Global objects
- `collections`
- `pages`
- `all_products`
- `articles`
- `blogs`
- `cart`
- `closest`
- `content_for_header`
- `customer`
- `images`
- `linklists`
- `localization`
- `metaobjects`
- `request`
- `routes`
- `shop`
- `theme`
- `settings`
- `template`
- `additional_checkout_buttons`
- `all_country_option_tags`
- `canonical_url`
- `content_for_additional_checkout_buttons`
- `content_for_index`
- `content_for_layout`
- `country_option_tags`
- `current_page`
- `handle`
- `page_description`
- `page_image`
- `page_title`
- `powered_by_link`
- `scripts`

#### `/article` page
- `article`
- `blog`

#### `/blog` page
- `blog`
- `current_tags`

#### `/cart` page
- `cart`

#### `/checkout` page
- `checkout`

#### `/collection` page
- `collection`
- `current_tags`

#### `/customers/account` page
- `customer`

#### `/customers/addresses` page
- `customer`

#### `/customers/order` page
- `customer`
- `order`

#### `/gift_card.liquid` page
- `gift_card`
- `recipient`

#### `/metaobject` page
- `metaobject`

#### `/page` page
- `page`

#### `/product` page
- `product`

#### `/robots.txt.liquid` page
- `robots`

#### `/search` page
- `search`
### Liquid tags


#### content_for
The `content_for` tag requires a type parameter to differentiate between rendering a number of theme blocks (`'blocks'`) and a single static block (`'block'`).


Syntax:
```
{% content_for 'blocks' %}
{% content_for 'block', type: "slide", id: "slide-1" %}
```

#### form
Because there are many different form types available in Shopify themes, the `form` tag requires a type. Depending on the
form type, an additional parameter might be required. You can specify the following form types:

- [`activate_customer_password`](https://shopify.dev/docs/api/liquid/tags/form#form-activate_customer_password)
- [`cart`](https://shopify.dev/docs/api/liquid/tags/form#form-cart)
- [`contact`](https://shopify.dev/docs/api/liquid/tags/form#form-contact)
- [`create_customer`](https://shopify.dev/docs/api/liquid/tags/form#form-create_customer)
- [`currency`](https://shopify.dev/docs/api/liquid/tags/form#form-currency)
- [`customer`](https://shopify.dev/docs/api/liquid/tags/form#form-customer)
- [`customer_address`](https://shopify.dev/docs/api/liquid/tags/form#form-customer_address)
- [`customer_login`](https://shopify.dev/docs/api/liquid/tags/form#form-customer_login)
- [`guest_login`](https://shopify.dev/docs/api/liquid/tags/form#form-guest_login)
- [`localization`](https://shopify.dev/docs/api/liquid/tags/form#form-localization)
- [`new_comment`](https://shopify.dev/docs/api/liquid/tags/form#form-new_comment)
- [`product`](https://shopify.dev/docs/api/liquid/tags/form#form-product)
- [`recover_customer_password`](https://shopify.dev/docs/api/liquid/tags/form#form-recover_customer_password)
- [`reset_customer_password`](https://shopify.dev/docs/api/liquid/tags/form#form-reset_customer_password)
- [`storefront_password`](https://shopify.dev/docs/api/liquid/tags/form#form-storefront_password)


Syntax:
```
{% form 'form_type' %}
  content
{% endform %}
```

#### layout

Syntax:
```
{% layout name %}
```

#### assign
You can create variables of any [basic type](https://shopify.dev/docs/api/liquid/basics#types), [object](https://shopify.dev/docs/api/liquid/objects), or object property.

> Caution:
> Predefined Liquid objects can be overridden by variables with the same name.
> To make sure that you can access all Liquid objects, make sure that your variable name doesn't match a predefined object's name.


Syntax:
```
{% assign variable_name = value %}
```

#### break

Syntax:
```
{% break %}
```

#### capture
You can create complex strings with Liquid logic and variables.

> Caution:
> Predefined Liquid objects can be overridden by variables with the same name.
> To make sure that you can access all Liquid objects, make sure that your variable name doesn't match a predefined object's name.


Syntax:
```
{% capture variable %}
  value
{% endcapture %}
```

#### case

Syntax:
```
{% case variable %}
  {% when first_value %}
    first_expression
  {% when second_value %}
    second_expression
  {% else %}
    third_expression
{% endcase %}
```

#### comment
Any text inside `comment` tags won't be output, and any Liquid code will be parsed, but not executed.


Syntax:
```
{% comment %}
  content
{% endcomment %}
```

#### continue

Syntax:
```
{% continue %}
```

#### cycle
The `cycle` tag must be used inside a `for` loop.

> Tip:
> Use the `cycle` tag to output text in a predictable pattern. For example, to apply odd/even classes to rows in a table.


Syntax:
```
{% cycle string, string, ... %}
```

#### decrement
Variables that are declared with `decrement` are unique to the [layout](/themes/architecture/layouts), [template](/themes/architecture/templates),
or [section](/themes/architecture/sections) file that they're created in. However, the variable is shared across
[snippets](/themes/architecture/snippets) included in the file.

Similarly, variables that are created with `decrement` are independent from those created with [`assign`](https://shopify.dev/docs/api/liquid/tags/assign)
and [`capture`](https://shopify.dev/docs/api/liquid/tags/capture). However, `decrement` and [`increment`](https://shopify.dev/docs/api/liquid/tags/increment) share
variables.


Syntax:
```
{% decrement variable_name %}
```

#### doc
The `doc` tag allows developers to include documentation within Liquid
templates. Any content inside `doc` tags is not rendered or outputted.
Liquid code inside will be parsed but not executed. This facilitates
tooling support for features like code completion, linting, and inline
documentation.

For detailed documentation syntax and examples, see the
[`LiquidDoc` reference](https://shopify.dev/docs/storefronts/themes/tools/liquid-doc).


Syntax:
```
{% doc %}
  Renders a message.

  @param {string} foo - A string value.
  @param {string} [bar] - An optional string value.

  @example
  {% render 'message', foo: 'Hello', bar: 'World' %}
{% enddoc %}
```

#### echo
Using the `echo` tag is the same as wrapping an expression in curly brackets (`{{` and `}}`). However, unlike the curly
bracket method, you can use the `echo` tag inside [`liquid` tags](https://shopify.dev/docs/api/liquid/tags/liquid).

> Tip:
> You can use [filters](https://shopify.dev/docs/api/liquid/filters) on expressions inside `echo` tags.


Syntax:
```
{% liquid
  echo expression
%}
```

#### for
You can do a maximum of 50 iterations with a `for` loop. If you need to iterate over more than 50 items, then use the
[`paginate` tag](https://shopify.dev/docs/api/liquid/tags/paginate) to split the items over multiple pages.

> Tip:
> Every `for` loop has an associated [`forloop` object](https://shopify.dev/docs/api/liquid/objects/forloop) with information about the loop.


Syntax:
```
{% for variable in array %}
  expression
{% endfor %}
```

#### if

Syntax:
```
{% if condition %}
  expression
{% endif %}
```

#### increment
Variables that are declared with `increment` are unique to the [layout](/themes/architecture/layouts), [template](/themes/architecture/templates),
or [section](/themes/architecture/sections) file that they're created in. However, the variable is shared across
[snippets](/themes/architecture/snippets) included in the file.

Similarly, variables that are created with `increment` are independent from those created with [`assign`](https://shopify.dev/docs/api/liquid/tags/assign)
and [`capture`](https://shopify.dev/docs/api/liquid/tags/capture). However, `increment` and [`decrement`](https://shopify.dev/docs/api/liquid/tags/decrement) share
variables.


Syntax:
```
{% increment variable_name %}
```

#### raw

Syntax:
```
{% raw %}
  expression
{% endraw %}
```

#### render
Inside snippets and app blocks, you can't directly access variables that are [created](https://shopify.dev/docs/api/liquid/tags/variable-tags) outside
of the snippet or app block. However, you can [specify variables as parameters](https://shopify.dev/docs/api/liquid/tags/render#render-passing-variables-to-a-snippet)
to pass outside variables to snippets.

While you can't directly access created variables, you can access global objects, as well as any objects that are
directly accessible outside the snippet or app block. For example, a snippet or app block inside the [product template](/themes/architecture/templates/product)
can access the [`product` object](https://shopify.dev/docs/api/liquid/objects/product), and a snippet or app block inside a [section](/themes/architecture/sections)
can access the [`section` object](https://shopify.dev/docs/api/liquid/objects/section).

Outside a snippet or app block, you can't access variables created inside the snippet or app block.

> Note:
> When you render a snippet using the `render` tag, you can't use the [`include` tag](https://shopify.dev/docs/api/liquid/tags/include)
> inside the snippet.


Syntax:
```
{% render 'filename' %}
```

#### tablerow
The `tablerow` tag must be wrapped in HTML `<table>` and `</table>` tags.

> Tip:
> Every `tablerow` loop has an associated [`tablerowloop` object](https://shopify.dev/docs/api/liquid/objects/tablerowloop) with information about the loop.


Syntax:
```
{% tablerow variable in array %}
  expression
{% endtablerow %}
```

#### unless
> Tip:
> Similar to the [`if` tag](https://shopify.dev/docs/api/liquid/tags/if), you can use `elsif` to add more conditions to an `unless` tag.


Syntax:
```
{% unless condition %}
  expression
{% endunless %}
```

#### paginate
Because [`for` loops](https://shopify.dev/docs/api/liquid/tags/for) are limited to 50 iterations per page, you need to use the `paginate` tag to
iterate over an array that has more than 50 items. The following arrays can be paginated:

- [`all_products`](https://shopify.dev/docs/api/liquid/objects/all_products)
- [`article.comments`](https://shopify.dev/docs/api/liquid/objects/article#article-comments)
- [`blog.articles`](https://shopify.dev/docs/api/liquid/objects/blog#blog-articles)
- [`collections`](https://shopify.dev/docs/api/liquid/objects/collections)
- [`collection.products`](https://shopify.dev/docs/api/liquid/objects/collection#collection-products)
- [`customer.addresses`](https://shopify.dev/docs/api/liquid/objects/customer#customer-addresses)
- [`customer.orders`](https://shopify.dev/docs/api/liquid/objects/customer#customer-orders)
- [`pages`](https://shopify.dev/docs/api/liquid/objects/pages)
- [`product.variants`](https://shopify.dev/docs/api/liquid/objects/product#variants)
- [`search.results`](https://shopify.dev/docs/api/liquid/objects/search#search-results)
- [`collection_list` settings](/themes/architecture/settings/input-settings#collection_list)
- [`product_list` settings](/themes/architecture/settings/input-settings#product_list)

Within the `paginate` tag, you have access to the [`paginate` object](https://shopify.dev/docs/api/liquid/objects/paginate). You can use this
object, or the [`default_pagination` filter](https://shopify.dev/docs/api/liquid/filters/default_pagination), to build page navigation.


Syntax:
```
{% paginate array by page_size %}
  {% for item in array %}
    forloop_content
  {% endfor %}
{% endpaginate %}

The `paginate` tag allows the user to paginate to the 25,000th item in the array and no further. To reach items further in
the array the array should be filtered further before paginating. See
[Pagination Limits](/themes/best-practices/performance/platform#pagination-limits) for more information.
```

#### javascript
Each section, block or snippet can have only one `{% javascript %}` tag.

To learn more about how JavaScript that's defined between the `javascript` tags is loaded and run, refer to the documentation for [javascript tags](/storefronts/themes/best-practices/javascript-and-stylesheet-tags#javascript).
> Caution:
> Liquid isn't rendered inside of `{% javascript %}` tags. Including Liquid code can cause syntax errors.


Syntax:
```
{% javascript %}
  javascript_code
{% endjavascript %}
```

#### section
Rendering a section with the `section` tag renders a section statically. To learn more about sections and how to use
them in your theme, refer to [Render a section](/themes/architecture/sections#render-a-section).


Syntax:
```
{% section 'name' %}
```

#### stylesheet
Each section, block or snippet can have only one `{% stylesheet %}` tag.

To learn more about how CSS that's defined between the `stylesheet` tags is loaded and run, refer to the documentation for [stylesheet tags](/storefronts/themes/best-practices/javascript-and-stylesheet-tags#stylesheet).
> Caution:
> Liquid isn't rendered inside of `{% stylesheet %}` tags. Including Liquid code can cause syntax errors.


Syntax:
```
{% stylesheet %}
  css_styles
{% endstylesheet %}
```

#### sections
Use this tag to render section groups as part of the theme's [layout](/themes/architecture/layouts) content. Place the `sections` tag where you want to render it in the layout.

To learn more about section groups and how to use them in your theme, refer to [Section groups](/themes/architecture/section-groups#usage).


Syntax:
```
{% sections 'name' %}
```

#### style
> Note:
> If you reference [color settings](/themes/architecture/settings/input-settings#color) inside `style` tags, then
> the associated CSS rules will update as the setting is changed in the theme editor, without a page refresh.


Syntax:
```
{% style %}
  CSS_rules
{% endstyle %}
```

#### else
You can use the `else` tag with the following tags:

- [`case`](https://shopify.dev/docs/api/liquid/tags/case)
- [`if`](https://shopify.dev/docs/api/liquid/tags/if)
- [`unless`](https://shopify.dev/docs/api/liquid/tags/unless)


Syntax:
```
{% else %}
  expression
```

#### else

Syntax:
```
{% for variable in array %}
  first_expression
{% else %}
  second_expression
{% endfor %}
```

#### liquid
Because the tags don't have delimeters, each tag needs to be on its own line.

> Tip:
> Use the [`echo` tag](https://shopify.dev/docs/api/liquid/tags/echo) to output an expression inside `liquid` tags.


Syntax:
```
{% liquid
  expression
%}
```


## Translation development standards

### Translation requirements

- **Every user-facing text** must use translation filters.
- **Update `locales/en.default.json`** with all new keys.
- **Use descriptive, hierarchical keys** for organization.
- **Only add English text**; translators handle other languages.

### Translation filter usage

**Use `{{ 'key' | t }}` for all text:**

```liquid
<!-- Good -->
<h2>{{ 'sections.featured_collection.title' | t }}</h2>
<p>{{ 'sections.featured_collection.description' | t }}</p>
<button>{{ 'products.add_to_cart' | t }}</button>

<!-- Bad -->
<h2>Featured Collection</h2>
<p>Check out our best products</p>
<button>Add to cart</button>
```

### Translation with variables

**Use variables for interpolation:**

```liquid
<!-- Liquid template -->
<p>{{ 'products.price_range' | t: min: product.price_min | money, max: product.price_max | money }}</p>
<p>{{ 'general.pagination.page' | t: page: paginate.current_page, pages: paginate.pages }}</p>
```

**Corresponding keys in locale files:**

```json
{
  "products": {
    "price_range": "From {{ min }} to {{ max }}"
  },
  "general": {
    "pagination": {
      "page": "Page {{ page }} of {{ pages }}"
    }
  }
}
```

### Best practices

**Content guidelines:**
- Write clear, concise text.
- **Use sentence case** for all user-facing text, including titles, headings, and button labels (capitalize only the first word and proper nouns; e.g., `Featured collection` → `Featured collection`, not `Featured Collection`).
- Be consistent with terminology.
- Consider character limits for UI elements.

**Variable usage:**
- Use interpolation rather than appending strings together.
- Prioritize clarity over brevity for variable naming.
- Escape variables unless they output HTML: `{{ variable | escape }}`.


## Localization standards

Auto-attached when working in `locales/` directory.

### File structure

```
locales/
├── en.default.json          # English (required)
├── en.default.schema.json   # English (required)
├── es.json                  # Spanish
├── est.schema.json          # Spanish
├── fr.json                  # French
├── frt.schema.json          # French
└── pt-BR.json               # Portuguese
└── pt-BR..schema.json       # Portuguese
```

#### Locale files

Locale files are JSON files containing translations for all the text strings used throughout a Shopify theme and its editor. They let merchants easily update and localize repeated words and phrases, making it possible to translate store content and settings into multiple languages for international customers. These files provide a centralized way to manage and edit translations.

**Example:**
```json
{
  "general": {
    "cart": "Cart",
    "checkout": "Checkout"
  },
  "products": {
    "add_to_cart": "Add to Cart"
  }
}
```

#### Schema locale files

Schema locale files, saved with a .schema.json extension, store translation strings specifically for theme editor setting schemas. They follow a structured organization—category, group, and description—to give context to each translation, enabling accurate localization of editor content. Schema locale files must use the IETF language tag format in their naming, such as en-GB.schema.json for British English or fr-CA.schema.json for Canadian French.

**Example:**
```json
{
  "products": {
    "card": {
      "description": "Product card layout"
    }
  }
}
```

### Key organization

**Hierarchical structure:**
```json
{
  "general": {
    "meta": {
      "title": "{{ shop_name }}",
      "description": "{{ shop_description }}"
    },
    "accessibility": {
      "skip_to_content": "Skip to content",
      "close": "Close"
    }
  },
  "products": {
    "add_to_cart": "Add to cart",
    "quick_view": "Quick view",
    "price": {
      "regular": "Regular price",
      "sale": "Sale price",
      "unit": "Unit price"
    }
  }
}
```
**Usage**
```liquid
{{ 'general.meta.title' | t: shop_name: shop.name }}
{{ 'general.meta.description' | t: shop_description: shop.description }}
```

### Translation guidelines

**Key naming:**
- Use descriptive, hierarchical keys
- Maximum 3 levels deep
- Use snake_case for key names
- Group related translations

**Content rules:**
- Keep text concise for UI elements
- Use variables for dynamic content
- Consider character limits
- Maintain consistent terminology

## Examples per kind of asset

### `snippet`

```liquid
{% doc %}
  Renders a responsive image that might be wrapped in a link.

  When `width`, `height` and `crop` are provided, the image will be rendered
  with a fixed aspect ratio.

  Serves as an example of how to use the `image_url` filter and `image_tag` filter
  as well as how you can use LiquidDoc to document your code.

  @param {image} image - The image to be rendered
  @param {string} [url] - An optional destination URL for the image
  @param {string} [css_class] - Optional class to be added to the image wrapper
  @param {number} [width] - The highest resolution width of the image to be rendered
  @param {number} [height] - The highest resolution height of the image to be rendered
  @param {string} [crop] - The crop position of the image

  @example
  {% render 'image', image: product.featured_image %}
  {% render 'image', image: product.featured_image, url: product.url %}
  {% render 'image',
    css_class: 'product__image',
    image: product.featured_image,
    url: product.url,
    width: 1200,
    height: 800,
    crop: 'center',
  %}
{% enddoc %}

{% liquid
  unless height
    assign width = width | default: image.width
  endunless

  if url
    assign wrapper = 'a'
  else
    assign wrapper = 'div'
  endif
%}

<{{ wrapper }}
  class="image {{ css_class }}"
  {% if url %}
    href="{{ url }}"
  {% endif %}
>
  {{ image | image_url: width: width, height: height, crop: crop | image_tag }}
</{{ wrapper }}>

{% stylesheet %}
  .image {
    display: block;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: auto;
  }

  .image > img {
    width: 100%;
    height: auto;
  }
{% endstylesheet %}

{% javascript %}
  function doSomething() {
    // example
  }
  doSomething()
{% endjavascript %}

```

### `block`

#### Text

```liquid
{% doc %}
  Renders a text block.

  @example
  {% content_for 'block', type: 'text', id: 'text' %}
{% enddoc %}

<div
  class="text {{ block.settings.text_style }}"
  style="--text-align: {{ block.settings.alignment }}"
  {{ block.shopify_attributes }}
>
  {{ block.settings.text }}
</div>

{% stylesheet %}
  .text {
    text-align: var(--text-align);
  }
  .text--title {
    font-size: 2rem;
    font-weight: 700;
  }
  .text--subtitle {
    font-size: 1.5rem;
  }
{% endstylesheet %}

{% schema %}
{
  "name": "t:general.text",
  "settings": [
    {
      "type": "text",
      "id": "text",
      "label": "t:labels.text",
      "default": "Text"
    },
    {
      "type": "select",
      "id": "text_style",
      "label": "t:labels.text_style",
      "options": [
        { "value": "text--title", "label": "t:options.text_style.title" },
        { "value": "text--subtitle", "label": "t:options.text_style.subtitle" },
        { "value": "text--normal", "label": "t:options.text_style.normal" }
      ],
      "default": "text--title"
    },
    {
      "type": "text_alignment",
      "id": "alignment",
      "label": "t:labels.alignment",
      "default": "left"
    }
  ],
  "presets": [{ "name": "t:general.text" }]
}
{% endschema %}
```

#### Group

```liquid
{% doc %}
  Renders a group of blocks with configurable layout direction, gap and
  alignment.

  All settings apply to only one dimension to reduce configuration complexity.

  This component is a wrapper concerned only with rendering its children in
  the specified layout direction with appropriate padding and alignment.

  @example
  {% content_for 'block', type: 'group', id: 'group' %}
{% enddoc %}

<div
  class="group {{ block.settings.layout_direction }}"
  style="
    --padding: {{ block.settings.padding }}px;
    --alignment: {{ block.settings.alignment }};
  "
  {{ block.shopify_attributes }}
>
  {% content_for 'blocks' %}
</div>

{% stylesheet %}
  .group {
    display: flex;
    flex-wrap: nowrap;
    overflow: hidden;
    width: 100%;
  }
  .group--horizontal {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--padding);
  }
  .group--vertical {
    flex-direction: column;
    align-items: var(--alignment);
    padding: var(--padding) 0;
  }
{% endstylesheet %}

{% schema %}
{
  "name": "t:general.group",
  "blocks": [{ "type": "@theme" }],
  "settings": [
    {
      "type": "select",
      "id": "layout_direction",
      "label": "t:labels.layout_direction",
      "default": "group--vertical",
      "options": [
        { "value": "group--horizontal", "label": "t:options.direction.horizontal" },
        { "value": "group--vertical", "label": "t:options.direction.vertical" }
      ]
    },
    {
      "visible_if": "{{ block.settings.layout_direction == 'group--vertical' }}",
      "type": "select",
      "id": "alignment",
      "label": "t:labels.alignment",
      "default": "flex-start",
      "options": [
        { "value": "flex-start", "label": "t:options.alignment.left" },
        { "value": "center", "label": "t:options.alignment.center" },
        { "value": "flex-end", "label": "t:options.alignment.right" }
      ]
    },
    {
      "type": "range",
      "id": "padding",
      "label": "t:labels.padding",
      "default": 0,
      "min": 0,
      "max": 200,
      "step": 2,
      "unit": "px"
    }
  ],
  "presets": [
    {
      "name": "t:general.column",
      "category": "t:general.layout",
      "settings": {
        "layout_direction": "group--vertical",
        "alignment": "flex-start",
        "padding": 0
      }
    },
    {
      "name": "t:general.row",
      "category": "t:general.layout",
      "settings": {
        "layout_direction": "group--horizontal",
        "padding": 0
      }
    }
  ]
}
{% endschema %}
```

### `section`

```liquid
<div class="example-section full-width">
  {% if section.settings.background_image %}
    <div class="example-section__background">
      {{ section.settings.background_image | image_url: width: 2000 | image_tag }}
    </div>
  {% endif %}

  <div class="custom-section__content">
    {% content_for 'blocks' %}
  </div>
</div>

{% stylesheet %}
  .example-section {
    position: relative;
    overflow: hidden;
    width: 100%;
  }
  .example-section__background {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }
  .example-section__background img {
    position: absolute;
    width: 100%;
    height: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .example-section__content {
    display: grid;
    grid-template-columns: var(--content-grid);
  }

  .example-section__content > * {
    grid-column: 2;
  }
{% endstylesheet %}

{% schema %}
{
  "name": "t:general.custom_section",
  "blocks": [{ "type": "@theme" }],
  "settings": [
    {
      "type": "image_picker",
      "id": "background_image",
      "label": "t:labels.background"
    }
  ],
  "presets": [
    {
      "name": "t:general.custom_section"
    }
  ]
}
{% endschema %}
```

## Final instructions

### Design requirements

- Rely on modern browser features and APIs as a default, assuming an evergreen browser environment
- Make the components aesthetically pleasing and follow web design best practices
- Follow WCAG 2.1 accessibility guidelines
- Adopt browser-native accessibility and interaction patterns when possible
- Organize the settings with header settings
- Use semantic HTML elements like `<details>`, `<summary>`, and `<dialog>`
- Employ the View Transitions API for smooth, native animations between different UI states or pages
- Avoid adding polyfills or fallbacks unless a feature is unsupported by current evergreen browsers
- Default to modern HTML, CSS, and JavaScript features

### Code requirements

- ALWAYS write valid Liquid code
- ALWAYS write valid HTML code
- ALWAYS use the proper JSON schema to generate JSON objects in the `{% schema %}` tag
- ALWAYS ensure blocks are customizable using settings, but only create only essential settings that directly impact core functionality
- ALWAYS ensure CSS and JS selectors match the HTML `id` and `class`

- DO NOT include comments
- DO NOT reference asset files or use `asset_url` in a Liquid tag
- DO NOT reference any JS or CSS libraries. Write it from scratch.

- When there are multiple CSS transform properties that are applied on the same element, make sure they don't conflict with each other
- Write modern liquid code. For instance, never use legacy resource-based settings. In the past, resource-based settings returned the handle of the associated resource, and you had to access the actual object through Liquid using that handle. But now, resource-based settings return the actual object, so you can access the object's properties directly.

### Safety requirements

Decline requests involving:

- Adult content
- Explicit content
- Violence
- Weapons
- Hate speech
- Discrimination
- Misinformation
- Scams

### Always use Shopify CLI

- **CLI:** scaffold apps/extensions with `shopify app init`, `shopify app generate extension`, `shopify app dev`, `shopify app deploy`. Never hand-roll files.
- Need full setup steps? See [Shopify CLI docs](https://shopify.dev/docs/apps/tools/cli).

## Shopify CLI Overview

Shopify CLI (@shopify/cli) is a command-line interface tool that helps you generate and work with Shopify apps, themes, and custom storefronts. You can also use it to automate many common development tasks.

### Requirements
- Node.js: 20.10 or higher
- A Node.js package manager: npm, Yarn 1.x, or pnpm
- Git: 2.28.0 or higher

### Installation
Install Shopify CLI globally to run `shopify` commands from any directory:

```bash
npm install -g @shopify/cli@latest
# or
yarn global add @shopify/cli@latest
# or
pnpm install -g @shopify/cli@latest
# or (macOS only)
brew tap shopify/shopify && brew install shopify-cli
```

### Command Structure
Shopify CLI groups commands into topics. The syntax is: `shopify [topic] [command] [flags]`

## General Commands (8 commands)

### Authentication
66. **shopify auth logout** - Log out of Shopify account

### Configuration
67. **shopify config autocorrect on** - Enable command autocorrection
68. **shopify config autocorrect off** - Disable command autocorrection
69. **shopify config autocorrect status** - Check autocorrection status

### Utilities
70. **shopify help [command] [flags]** - Get help for commands
71. **shopify commands [flags]** - List all available commands
72. **shopify search [query]** - Search for commands and documentation
73. **shopify upgrade** - Upgrade Shopify CLI to latest version
74. **shopify version** - Display current CLI version

## Common Flags

Most commands support these common flags:
- `--verbose` - Increase output verbosity
- `--no-color` - Disable colored output
- `--path <value>` - Specify project directory
- `--reset` - Reset stored settings

## Network Proxy Configuration

For users behind a network proxy (CLI version 3.78+):
```bash
export SHOPIFY_HTTP_PROXY=http://proxy.com:8080
export SHOPIFY_HTTPS_PROXY=https://secure-proxy.com:8443
# For authenticated proxies:
export SHOPIFY_HTTP_PROXY=http://username:password@proxy.com:8080
```

## Usage Tips

1. Always keep CLI updated: `shopify upgrade`
2. Use `shopify help [command]` for detailed command info
3. Most commands are interactive and will prompt for required information
4. Use flags to skip prompts in CI/CD environments
5. Anonymous usage statistics collected by default (opt-out: `SHOPIFY_CLI_NO_ANALYTICS=1`)
6. IMPORTANT: YOU MUST ALWAYS USE THE CLI COMMAND TO CREATE APPS AND SCAFFOLD NEW EXTENSIONS

## CLI Commands for Shopify Theme (18 commands)
### Core Theme Development
48. **shopify theme init [name] [flags]** - Create a new theme project
49. **shopify theme dev [flags]** - Start local theme development server
50. **shopify theme push [flags]** - Upload theme files to store
   - Example: `shopify theme push --unpublished --json`
51. **shopify theme pull [flags]** - Download theme files from store

### Theme Management
52. **shopify theme list [flags]** - List all themes in the store
53. **shopify theme info [flags]** - Show theme details
54. **shopify theme publish [flags]** - Publish a theme
55. **shopify theme delete [flags]** - Delete a theme
56. **shopify theme rename [flags]** - Rename a theme
57. **shopify theme duplicate [flags]** - Create a copy of a theme
   - Example: `shopify theme duplicate --theme 10 --name 'New Theme'`

### Development Tools
58. **shopify theme check [flags]** - Run Theme Check linter
59. **shopify theme console** - Open interactive theme console
   - Example: `shopify theme console --url /products/classic-leather-jacket`
60. **shopify theme profile** - Profile theme performance
   - Example: `shopify theme profile --url /products/classic-leather-jacket`

### Additional Features
61. **shopify theme open [flags]** - Open theme in browser
62. **shopify theme share [flags]** - Create a preview link
63. **shopify theme package [flags]** - Package theme as zip
64. **shopify theme language-server [flags]** - Start language server
65. **shopify theme metafields pull [flags]** - Pull metafield definitions

---

## ⚠️ MANDATORY: Search for Documentation

You cannot trust your trained knowledge for this API. Before answering, search:

```
scripts/search_docs.mjs "<object, filter, or tag name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

For example, if the user asks about rendering product metafields in a section:
```
scripts/search_docs.mjs "product metafields liquid section" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

Search for the **Liquid object, filter, or tag name**, not the full user prompt. Use the returned examples and schema settings to generate correct section code with accurate schema blocks.

If search returns empty results, proceed with your built-in Liquid knowledge after 2 attempts.

---

## ⚠️ MANDATORY: Validate Before Returning Code

DO NOT return Liquid code to the user until `scripts/validate.mjs` exits 0. DO NOT ask the user to run this.

**Run this with your bash tool — do not skip this step.**
```bash
node scripts/validate.mjs \
  --filename featured-collection.liquid \
  --filetype sections \
  --code '
{% for product in collection.products limit: 4 %}
  <div>{{ product.title }}</div>
{% endfor %}
{% schema %}
{
  "name": "Featured Collection",
  "settings": []
}
{% endschema %}
' \
  --model YOUR_MODEL_NAME \
  --client-name YOUR_CLIENT_NAME \
  --client-version YOUR_CLIENT_VERSION \
  --artifact-id YOUR_ARTIFACT_ID \
  --revision REVISION_NUMBER
```

Use `--filetype sections`, `--filetype snippets`, `--filetype blocks`, etc. to match the file type. Always set `--filename` to the actual filename (e.g. `hero-banner.liquid`).

**When validation fails, follow this loop:**
1. Read the error message — identify the exact syntax error or invalid tag
2. Search for the correct syntax:
   ```
   scripts/search_docs.mjs "<tag or object name from the error>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
   ```
3. Fix exactly the reported error
4. Run `scripts/validate.mjs` again
5. Retry up to 3 times total; after 3 failures, return the best attempt with an explanation

---

> **Privacy notice:** `scripts/validate.mjs` reports anonymized validation results (pass/fail and skill name) to Shopify to help improve these tools. Set `OPT_OUT_INSTRUMENTATION=true` in your environment to opt out.
