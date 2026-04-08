#!/usr/bin/env node
// AUTO-GENERATED — do not edit directly.
// Edit src/agent-skills/scripts/ in shopify-dev-tools and run: npm run generate_agent_skills

// src/agent-skills/scripts/validate_components.ts
import { readFileSync } from "fs";
import { parseArgs } from "util";

// src/types/api-constants.ts
var GRAPHQL_APIs = {
  ADMIN: "admin",
  STOREFRONT: "storefront-graphql",
  PARTNER: "partner",
  CUSTOMER: "customer",
  PAYMENTS_APPS: "payments-apps"
};
var FUNCTION_GRAPHQL_SCHEMAS = {
  FUNCTIONS_CART_CHECKOUT_VALIDATION: "functions_cart_checkout_validation",
  FUNCTIONS_CART_TRANSFORM: "functions_cart_transform",
  FUNCTIONS_DELIVERY_CUSTOMIZATION: "functions_delivery_customization",
  FUNCTIONS_DISCOUNT: "functions_discount",
  FUNCTIONS_DISCOUNTS_ALLOCATOR: "functions_discounts_allocator",
  FUNCTIONS_FULFILLMENT_CONSTRAINTS: "functions_fulfillment_constraints",
  FUNCTIONS_LOCAL_PICKUP_DELIVERY_OPTION_GENERATOR: "functions_local_pickup_delivery_option_generator",
  FUNCTIONS_ORDER_DISCOUNTS: "functions_order_discounts",
  FUNCTIONS_ORDER_ROUTING_LOCATION_RULE: "functions_order_routing_location_rule",
  FUNCTIONS_PAYMENT_CUSTOMIZATION: "functions_payment_customization",
  FUNCTIONS_PICKUP_POINT_DELIVERY_OPTION_GENERATOR: "functions_pickup_point_delivery_option_generator",
  FUNCTIONS_PRODUCT_DISCOUNTS: "functions_product_discounts",
  FUNCTIONS_SHIPPING_DISCOUNTS: "functions_shipping_discounts"
};
var FUNCTIONS_APIs = {
  FUNCTIONS: "functions"
  // Main Functions API without GraphQL schema
};
var TYPESCRIPT_APIs = {
  POLARIS_APP_HOME: "polaris-app-home",
  POLARIS_ADMIN_EXTENSIONS: "polaris-admin-extensions",
  POLARIS_CHECKOUT_EXTENSIONS: "polaris-checkout-extensions",
  POLARIS_CUSTOMER_ACCOUNT_EXTENSIONS: "polaris-customer-account-extensions",
  POS_UI: "pos-ui",
  HYDROGEN: "hydrogen",
  STOREFRONT_WEB_COMPONENTS: "storefront-web-components"
};
var THEME_APIs = {
  LIQUID: "liquid"
};
var CONFIGURATION_APIs = {
  CUSTOM_DATA: "custom-data"
};
var EXECUTION_APIs = {
  ADMIN_EXECUTION: "admin-execution"
};
var SHOPIFY_APIS = {
  ...GRAPHQL_APIs,
  ...FUNCTIONS_APIs,
  ...TYPESCRIPT_APIs,
  ...THEME_APIs,
  ...FUNCTION_GRAPHQL_SCHEMAS,
  ...CONFIGURATION_APIs,
  ...EXECUTION_APIs
};

// src/types/api-types.ts
var Visibility = {
  PUBLIC: "public",
  EARLY_ACCESS: "earlyAccess",
  INTERNAL: "internal"
};
var APICategory = {
  GRAPHQL: "graphql",
  FUNCTIONS: "functions",
  FUNCTION_GRAPHQL: "function-graphql",
  // GraphQL schemas for Function input queries
  UI_FRAMEWORK: "ui-framework",
  THEME: "theme",
  CONFIGURATION: "configuration",
  EXECUTION: "execution"
};

// src/types/api-mapping.ts
var SHOPIFY_APIS2 = {
  [GRAPHQL_APIs.ADMIN]: {
    name: GRAPHQL_APIs.ADMIN,
    displayName: "Admin API",
    description: "The Admin GraphQL API lets you build apps and integrations that extend and enhance the Shopify admin.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [GRAPHQL_APIs.STOREFRONT]: {
    name: GRAPHQL_APIs.STOREFRONT,
    displayName: "Storefront GraphQL API",
    description: `Use for custom storefronts requiring direct GraphQL queries/mutations for data fetching and cart operations. Choose this when you need full control over data fetching and rendering your own UI. NOT for Web Components - if the prompt mentions HTML tags like <shopify-store>, <shopify-cart>, use ${TYPESCRIPT_APIs.STOREFRONT_WEB_COMPONENTS} instead.`,
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [GRAPHQL_APIs.PARTNER]: {
    name: GRAPHQL_APIs.PARTNER,
    displayName: "Partner API",
    description: "The Partner API lets you programmatically access data about your Partner Dashboard, including your apps, themes, and affiliate referrals.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [GRAPHQL_APIs.CUSTOMER]: {
    name: GRAPHQL_APIs.CUSTOMER,
    displayName: "Customer Account API",
    description: "The Customer Account API allows customers to access their own data including orders, payment methods, and addresses.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [GRAPHQL_APIs.PAYMENTS_APPS]: {
    name: GRAPHQL_APIs.PAYMENTS_APPS,
    displayName: "Payments Apps API",
    description: "The Payments Apps API enables payment providers to integrate their payment solutions with Shopify's checkout.",
    category: APICategory.GRAPHQL,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [FUNCTIONS_APIs.FUNCTIONS]: {
    name: FUNCTIONS_APIs.FUNCTIONS,
    displayName: "Shopify Functions",
    description: "Shopify Functions allow developers to customize the backend logic that powers parts of Shopify. Available APIs: Discount, Cart and Checkout Validation, Cart Transform, Pickup Point Delivery Option Generator, Delivery Customization, Fulfillment Constraints, Local Pickup Delivery Option Generator, Order Routing Location Rule, Payment Customization",
    category: APICategory.FUNCTIONS,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  // Function-specific GraphQL APIs for input query validation
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_CART_CHECKOUT_VALIDATION]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_CART_CHECKOUT_VALIDATION,
    displayName: "Cart Checkout Validation Function",
    description: "GraphQL schema for Cart and Checkout Validation Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_CART_TRANSFORM]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_CART_TRANSFORM,
    displayName: "Cart Transform Function",
    description: "GraphQL schema for Cart Transform Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_DELIVERY_CUSTOMIZATION]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_DELIVERY_CUSTOMIZATION,
    displayName: "Delivery Customization Function",
    description: "GraphQL schema for Delivery Customization Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_DISCOUNT]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_DISCOUNT,
    displayName: "Discount Function",
    description: "GraphQL schema for Discount Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_DISCOUNTS_ALLOCATOR]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_DISCOUNTS_ALLOCATOR,
    displayName: "Discounts Allocator Function",
    description: "GraphQL schema for Discounts Allocator Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_FULFILLMENT_CONSTRAINTS]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_FULFILLMENT_CONSTRAINTS,
    displayName: "Fulfillment Constraints Function",
    description: "GraphQL schema for Fulfillment Constraints Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_LOCAL_PICKUP_DELIVERY_OPTION_GENERATOR]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_LOCAL_PICKUP_DELIVERY_OPTION_GENERATOR,
    displayName: "Local Pickup Delivery Option Generator Function",
    description: "GraphQL schema for Local Pickup Delivery Option Generator Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_ORDER_DISCOUNTS]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_ORDER_DISCOUNTS,
    displayName: "Order Discounts Function",
    description: "GraphQL schema for Order Discounts Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_ORDER_ROUTING_LOCATION_RULE]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_ORDER_ROUTING_LOCATION_RULE,
    displayName: "Order Routing Location Rule Function",
    description: "GraphQL schema for Order Routing Location Rule Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_PAYMENT_CUSTOMIZATION]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_PAYMENT_CUSTOMIZATION,
    displayName: "Payment Customization Function",
    description: "GraphQL schema for Payment Customization Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_PICKUP_POINT_DELIVERY_OPTION_GENERATOR]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_PICKUP_POINT_DELIVERY_OPTION_GENERATOR,
    displayName: "Pickup Point Delivery Option Generator Function",
    description: "GraphQL schema for Pickup Point Delivery Option Generator Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_PRODUCT_DISCOUNTS]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_PRODUCT_DISCOUNTS,
    displayName: "Product Discounts Function",
    description: "GraphQL schema for Product Discounts Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_SHIPPING_DISCOUNTS]: {
    name: FUNCTION_GRAPHQL_SCHEMAS.FUNCTIONS_SHIPPING_DISCOUNTS,
    displayName: "Shipping Discounts Function",
    description: "GraphQL schema for Shipping Discounts Function input queries",
    category: APICategory.FUNCTION_GRAPHQL,
    visibility: Visibility.PUBLIC
  },
  [TYPESCRIPT_APIs.POLARIS_APP_HOME]: {
    name: TYPESCRIPT_APIs.POLARIS_APP_HOME,
    displayName: "Polaris App Home",
    description: "Build your app's primary user interface embedded in the Shopify admin. If the prompt just mentions `Polaris` and you can't tell based off of the context what API they meant, assume they meant this API.",
    category: APICategory.UI_FRAMEWORK,
    publicPackages: ["@shopify/polaris-types", "@shopify/app-bridge-types"],
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [TYPESCRIPT_APIs.POLARIS_ADMIN_EXTENSIONS]: {
    name: TYPESCRIPT_APIs.POLARIS_ADMIN_EXTENSIONS,
    displayName: "Polaris Admin Extensions",
    description: `Add custom actions and blocks from your app at contextually relevant spots throughout the Shopify Admin. Admin UI Extensions also supports scaffolding new adminextensions using Shopify CLI commands.`,
    category: APICategory.UI_FRAMEWORK,
    publicPackages: ["@shopify/ui-extensions"],
    extensionSurfaceName: "admin",
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [TYPESCRIPT_APIs.POLARIS_CHECKOUT_EXTENSIONS]: {
    name: TYPESCRIPT_APIs.POLARIS_CHECKOUT_EXTENSIONS,
    displayName: "Polaris Checkout Extensions",
    description: `Build custom functionality that merchants can install at defined points in the checkout flow, including product information, shipping, payment, order summary, and Shop Pay. Checkout UI Extensions also supports scaffolding new checkout extensions using Shopify CLI commands.`,
    category: APICategory.UI_FRAMEWORK,
    publicPackages: ["@shopify/ui-extensions"],
    extensionSurfaceName: "checkout",
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [TYPESCRIPT_APIs.POLARIS_CUSTOMER_ACCOUNT_EXTENSIONS]: {
    name: TYPESCRIPT_APIs.POLARIS_CUSTOMER_ACCOUNT_EXTENSIONS,
    displayName: "Polaris Customer Account Extensions",
    description: `Build custom functionality that merchants can install at defined points on the Order index, Order status, and Profile pages in customer accounts. Customer Account UI Extensions also supports scaffolding new customer account extensions using Shopify CLI commands.`,
    category: APICategory.UI_FRAMEWORK,
    publicPackages: ["@shopify/ui-extensions"],
    extensionSurfaceName: "customer-account",
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [TYPESCRIPT_APIs.POS_UI]: {
    name: TYPESCRIPT_APIs.POS_UI,
    displayName: "POS UI",
    description: `Build retail point-of-sale applications using Shopify's POS UI components. These components provide a consistent and familiar interface for POS applications. POS UI Extensions also supports scaffolding new POS extensions using Shopify CLI commands. Keywords: POS, Retail, smart grid`,
    category: APICategory.UI_FRAMEWORK,
    publicPackages: ["@shopify/ui-extensions"],
    extensionSurfaceName: "point-of-sale",
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [TYPESCRIPT_APIs.HYDROGEN]: {
    name: TYPESCRIPT_APIs.HYDROGEN,
    displayName: "Hydrogen",
    description: "Hydrogen storefront implementation cookbooks. Some of the available recipes are: B2B Commerce, Bundles, Combined Listings, Custom Cart Method, Dynamic Content with Metaobjects, Express Server, Google Tag Manager Integration, Infinite Scroll, Legacy Customer Account Flow, Markets, Partytown + Google Tag Manager, Subscriptions, Third-party API Queries and Caching. MANDATORY: Use this API for ANY Hydrogen storefront question - do NOT use Storefront GraphQL when 'Hydrogen' is mentioned.",
    category: APICategory.UI_FRAMEWORK,
    publicPackages: ["@shopify/hydrogen"],
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [TYPESCRIPT_APIs.STOREFRONT_WEB_COMPONENTS]: {
    name: TYPESCRIPT_APIs.STOREFRONT_WEB_COMPONENTS,
    displayName: "Storefront Web Components",
    description: "HTML-first web components for building storefronts WITHOUT GraphQL. Choose when prompts mention: Web Components, HTML tags (<shopify-store>, <shopify-context>, <shopify-cart>, <shopify-variant-selector>, <shopify-money>), native <dialog>, 'HTML-only', 'without JavaScript', or 'no GraphQL'. Components handle data fetching and state internally.",
    category: APICategory.UI_FRAMEWORK,
    featureFlag: "storefrontWebComponentsEnabled",
    //TODO: Need to find the appropriate packages for Storefront Web Components.
    // Docs has <script src="https://cdn.shopify.com/storefront/web-components.js"></script> and not a npm package
    publicPackages: ["@shopify/polaris-types", "@shopify/app-bridge-types"],
    visibility: Visibility.EARLY_ACCESS
  },
  [THEME_APIs.LIQUID]: {
    name: THEME_APIs.LIQUID,
    displayName: "Liquid",
    description: "Liquid is an open-source templating language created by Shopify. It is the backbone of Shopify themes and is used to load dynamic content on storefronts. Keywords: liquid, theme, shopify-theme, liquid-component, liquid-block, liquid-section, liquid-snippet, liquid-schemas, shopify-theme-schemas",
    category: APICategory.THEME,
    visibility: Visibility.PUBLIC,
    validation: true
  },
  [CONFIGURATION_APIs.CUSTOM_DATA]: {
    name: CONFIGURATION_APIs.CUSTOM_DATA,
    displayName: "Custom Data",
    description: "MUST be used first when prompts mention Metafields or Metaobjects. Use Metafields and Metaobjects to model and store custom data for your app. Metafields extend built-in Shopify data types like products or customers, Metaobjects are custom data types that can be used to store bespoke data structures. Metafield and Metaobject definitions provide a schema and configuration for values to follow.",
    category: APICategory.CONFIGURATION,
    visibility: Visibility.PUBLIC,
    searchable: false
  },
  [EXECUTION_APIs.ADMIN_EXECUTION]: {
    name: EXECUTION_APIs.ADMIN_EXECUTION,
    displayName: "Admin API Execution",
    description: "Run a validated Admin GraphQL operation against a specific store using Shopify CLI. Use this when the user wants an executable store workflow, not just the query or mutation text. If the answer should include `shopify store auth` and `shopify store execute`, choose this API. Choose this for 'my store', 'this store', a store domain, product reads on a merchant store, low-inventory lookups, product updates, and warehouse/location inventory changes. Examples: 'Show me the first 10 products on my store', 'Find products with low inventory on my store', 'Set inventory at the Toronto warehouse so SKU ABC-123 is 12'.",
    category: APICategory.EXECUTION,
    visibility: Visibility.PUBLIC,
    searchable: false
  }
};

// src/validation/formatCode.ts
function generateMissingImports(packageNames, extensionTarget) {
  return packageNames.map((packageName) => {
    if (extensionTarget && packageName.includes("@shopify/ui-extensions")) {
      return `import '${packageName}/${extensionTarget}';`;
    }
    return `import '${packageName}';`;
  }).join("\n");
}
function addShopifyImports(code2, packageNames, extensionTarget) {
  if (packageNames.includes("@shopify/ui-extensions") && !extensionTarget) {
    throw new Error("Invalid input: extensionTarget is required");
  }
  const generatedImports = generateMissingImports(
    packageNames,
    extensionTarget
  );
  if (code2 && (code2.includes("const shopify =") || code2.includes("globalThis.shopify"))) {
    return generatedImports;
  }
  const shopifyGlobalDeclaration = packageNames.find((pkg) => pkg.includes("@shopify/ui-extensions")) && extensionTarget ? `const shopify = (globalThis as any).shopify as import('@shopify/ui-extensions/${extensionTarget}').Api;` : "";
  const shopifyImports = `${generatedImports}
${shopifyGlobalDeclaration}`.trim();
  return shopifyImports;
}
function formatCode(code2, packageNames, extensionTarget) {
  if (code2.includes("!DOCTYPE") || code2.includes("!html")) {
    const bodyContent = code2.match(/<body>(.*?)<\/body>/s)?.[1];
    if (bodyContent) {
      code2 = `<>${bodyContent}</>`;
    }
  }
  const shopifyImports = addShopifyImports(code2, packageNames, extensionTarget);
  const codeWithImports = `
${shopifyImports}
${code2}
`;
  return codeWithImports;
}

// src/validation/createVirtualTSEnvironment.ts
import * as path from "path";
import ts from "typescript";
import { fileURLToPath } from "url";
var getCompilerOptions = (jsxImportSource) => ({
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  jsx: ts.JsxEmit.ReactJSX,
  jsxImportSource: jsxImportSource || "preact",
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  lib: ["es2020", "dom"],
  allowJs: true,
  checkJs: false
});
function getPackageRoot() {
  const currentDir = fileURLToPath(import.meta.url);
  return path.resolve(currentDir, "../..");
}
function getScriptSnapshot(fileName, virtualFiles) {
  const virtualContent = virtualFiles.get(fileName);
  if (virtualContent) {
    return ts.ScriptSnapshot.fromString(virtualContent);
  }
  try {
    const fileContent = ts.sys.readFile(fileName);
    return fileContent ? ts.ScriptSnapshot.fromString(fileContent) : void 0;
  } catch {
    return void 0;
  }
}
function createLanguageServiceHost(vfs, packageRoot, jsxImportSource) {
  return {
    getScriptFileNames: () => Array.from(vfs.virtualFiles.keys()),
    getScriptVersion: (fileName) => vfs.fileVersions.get(fileName)?.toString() || "0",
    getScriptSnapshot: (fileName) => getScriptSnapshot(fileName, vfs.virtualFiles),
    getCurrentDirectory: () => packageRoot,
    getCompilationSettings: () => getCompilerOptions(jsxImportSource),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: (fileName) => vfs.virtualFiles.has(fileName) || ts.sys.fileExists(fileName),
    readFile: (fileName) => vfs.virtualFiles.get(fileName) || ts.sys.readFile(fileName),
    readDirectory: ts.sys.readDirectory,
    getDirectories: ts.sys.getDirectories,
    directoryExists: ts.sys.directoryExists,
    getNewLine: () => "\n"
  };
}
function createVirtualTSEnvironment(apiName) {
  const fileVersions = /* @__PURE__ */ new Map();
  const virtualFiles = /* @__PURE__ */ new Map();
  const packageRoot = getPackageRoot();
  const jsxImportSource = apiName == SHOPIFY_APIS.HYDROGEN ? "react" : "preact";
  const servicesHost = createLanguageServiceHost(
    { fileVersions, virtualFiles },
    packageRoot,
    jsxImportSource
  );
  const languageService = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry()
  );
  const libDir = path.dirname(
    ts.getDefaultLibFilePath(getCompilerOptions(jsxImportSource))
  );
  const libFileNames = [
    "lib.es5.d.ts",
    // Essential: Contains Partial, Pick, Required, Omit, etc.
    "lib.es2020.d.ts",
    // ES2020 features
    "lib.dom.d.ts"
    // DOM types
  ];
  for (const libFileName of libFileNames) {
    try {
      const libPath = path.join(libDir, libFileName);
      const libContent = ts.sys.readFile(libPath);
      if (libContent) {
        virtualFiles.set(libPath, libContent);
        fileVersions.set(libPath, 1);
      }
    } catch {
    }
  }
  return {
    languageService,
    servicesHost,
    fileVersions,
    virtualFiles
  };
}
function incrementFileVersion(fileVersions, fileName) {
  const currentVersion = fileVersions.get(fileName) || 0;
  const newVersion = currentVersion + 1;
  fileVersions.set(fileName, newVersion);
  return newVersion;
}
function addFileToVirtualEnv(virtualEnv, fileName, content) {
  virtualEnv.virtualFiles.set(fileName, content);
  incrementFileVersion(virtualEnv.fileVersions, fileName);
}

// ../../node_modules/.pnpm/html-tags@5.1.0/node_modules/html-tags/html-tags.json
var html_tags_default = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "math",
  "menu",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "selectedcontent",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];

// src/validation/extractComponentValidations.ts
import ts2 from "typescript";

// ../../node_modules/.pnpm/svg-tag-names@3.0.1/node_modules/svg-tag-names/index.js
var svgTagNames = [
  "a",
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animate",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "animation",
  "audio",
  "canvas",
  "circle",
  "clipPath",
  "color-profile",
  "cursor",
  "defs",
  "desc",
  "discard",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignObject",
  "g",
  "glyph",
  "glyphRef",
  "handler",
  "hkern",
  "iframe",
  "image",
  "line",
  "linearGradient",
  "listener",
  "marker",
  "mask",
  "metadata",
  "missing-glyph",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "prefetch",
  "radialGradient",
  "rect",
  "script",
  "set",
  "solidColor",
  "stop",
  "style",
  "svg",
  "switch",
  "symbol",
  "tbreak",
  "text",
  "textArea",
  "textPath",
  "title",
  "tref",
  "tspan",
  "unknown",
  "use",
  "video",
  "view",
  "vkern"
];

// src/validation/extractComponentValidations.ts
var DIAGNOSTIC_CODES = {
  NAMESPACE_USED_AS_VALUE: 2708,
  TYPE_NOT_ASSIGNABLE: 2322
};
var PATTERNS = {
  PROPERTY_NOT_EXIST: /Property '(\w+)' does not exist on type/,
  TYPE_NOT_ASSIGNABLE: /Type '(.+?)' is not assignable to type '(.+?)'/,
  PROPERTY: /[Pp]roperty '(\w+)'/,
  SHOPIFY_MODULE: /@shopify\//,
  MODULE_NOT_FOUND: /Invalid module name in augmentation/,
  INTRINSIC_ELEMENT: /does not exist on type 'JSX.IntrinsicElements'/,
  INVALID_JSX_ELEMENT: /cannot be used as a JSX component|is not a valid JSX element type/,
  USED_BEFORE_BEING_DEFINED: /is used before being assigned/,
  IMPLICITLY_HAS_AN_ANY_TYPE: /implicitly has an 'any' type./,
  // TS strict-mode false positives unrelated to Shopify validation
  PREACT_REACT_COMPAT: /type '(?:VNode|ReactPortal)|not assignable to type '(?:ReactNode|ReactPortal)'/,
  NEVER_TYPE_CASCADE: /does not exist on type 'never'|is not assignable to type 'never'/,
  PRIMITIVE_PROPERTY_ACCESS: /does not exist on type '(?:string|number|boolean|undefined|null|void)(?:\s*\|\s*(?:string|number|boolean|undefined|null|void))*'/,
  CSS_PROPERTIES_COMPAT: /CSSProperties/,
  OBJECT_IS_UNKNOWN: /Object is of type 'unknown'/
};
function isStandardHTMLElement(tagName) {
  return html_tags_default.includes(tagName);
}
function isStandardSVGElement(tagName) {
  return svgTagNames.includes(tagName);
}
function extractJSXElements(sourceFile) {
  const elements = [];
  function visit(node) {
    if (ts2.isJsxOpeningElement(node) || ts2.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      elements.push({ tagName, node, start, end });
    }
    ts2.forEachChild(node, visit);
  }
  ts2.forEachChild(sourceFile, visit);
  return elements;
}
function createSkippedValidation(componentName) {
  return {
    componentName,
    valid: true,
    errors: [],
    skipped: true
  };
}
function createDisallowedElementValidation(componentName, elementType) {
  const message = elementType === "custom" ? `Custom component '${componentName}' is not allowed. UI extensions must only use Shopify Polaris web components. If this is a wrapper component, make sure to import it.` : `${elementType} element '${componentName}' is not allowed. UI extensions must only use Shopify Polaris web components.`;
  return {
    componentName,
    valid: false,
    errors: [
      {
        property: "element",
        message
      }
    ]
  };
}
function sanitizeComponentName(componentName) {
  return componentName.replace(/\./g, "");
}
function handleNonShopifyComponent(componentName, shopifyWebComponents, userImportedComponents, locallyDefinedComponents, enforceShopifyOnlyComponents) {
  const sanitizedComponentName = sanitizeComponentName(componentName);
  if (isStandardHTMLElement(sanitizedComponentName)) {
    if (enforceShopifyOnlyComponents) {
      return createDisallowedElementValidation(componentName, "HTML");
    }
    return createSkippedValidation(componentName);
  }
  if (isStandardSVGElement(sanitizedComponentName)) {
    if (enforceShopifyOnlyComponents) {
      return createDisallowedElementValidation(componentName, "SVG");
    }
    return createSkippedValidation(componentName);
  }
  if (!shopifyWebComponents.has(sanitizedComponentName)) {
    if (enforceShopifyOnlyComponents) {
      if (userImportedComponents.has(sanitizedComponentName)) {
        return createSkippedValidation(componentName);
      }
      if (locallyDefinedComponents.has(sanitizedComponentName)) {
        return createSkippedValidation(componentName);
      }
      return createDisallowedElementValidation(componentName, "custom");
    }
    return createSkippedValidation(componentName);
  }
  return null;
}
function isUserDefinedImport(modulePath) {
  return !modulePath.startsWith("@shopify/");
}
function collectDefaultImportName(importClause, into) {
  if (importClause.name) {
    into.add(importClause.name.text);
  }
}
function collectNamedImportNames(importClause, into) {
  const { namedBindings } = importClause;
  if (namedBindings && ts2.isNamedImports(namedBindings)) {
    for (const element of namedBindings.elements) {
      into.add(element.name.text);
    }
  }
}
function collectImportedNames(importClause, into) {
  collectDefaultImportName(importClause, into);
  collectNamedImportNames(importClause, into);
}
function getModulePath(node) {
  const { moduleSpecifier } = node;
  if (ts2.isStringLiteral(moduleSpecifier)) {
    return moduleSpecifier.text;
  }
  return null;
}
function extractUserImportedComponents(sourceFile) {
  const userImportedComponents = /* @__PURE__ */ new Set();
  function visitNode(node) {
    if (ts2.isImportDeclaration(node)) {
      processImportDeclaration(node, userImportedComponents);
    }
    ts2.forEachChild(node, visitNode);
  }
  ts2.forEachChild(sourceFile, visitNode);
  return userImportedComponents;
}
function processImportDeclaration(node, into) {
  const modulePath = getModulePath(node);
  if (!modulePath) {
    return;
  }
  if (!isUserDefinedImport(modulePath)) {
    return;
  }
  const { importClause } = node;
  if (importClause) {
    collectImportedNames(importClause, into);
  }
}
function isPascalCase(name) {
  return /^[A-Z]/.test(name);
}
function extractLocallyDefinedComponents(sourceFile) {
  const locallyDefinedComponents = /* @__PURE__ */ new Set();
  function visitNode(node) {
    if (ts2.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      if (isPascalCase(name)) {
        locallyDefinedComponents.add(name);
      }
    }
    if (ts2.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts2.isIdentifier(declaration.name) && declaration.initializer && (ts2.isArrowFunction(declaration.initializer) || ts2.isFunctionExpression(declaration.initializer))) {
          const name = declaration.name.text;
          if (isPascalCase(name)) {
            locallyDefinedComponents.add(name);
          }
        }
      }
    }
    if (ts2.isClassDeclaration(node) && node.name) {
      const name = node.name.text;
      if (isPascalCase(name)) {
        locallyDefinedComponents.add(name);
      }
    }
    ts2.forEachChild(node, visitNode);
  }
  ts2.forEachChild(sourceFile, visitNode);
  return locallyDefinedComponents;
}
function extractComponentValidations(originalCode, diagnostics, shopifyWebComponents, options = {}) {
  const { enforceShopifyOnlyComponents = false } = options;
  const validations = [];
  const handledDiagnostics = /* @__PURE__ */ new Set();
  const sourceFile = ts2.createSourceFile(
    "temp.tsx",
    originalCode,
    ts2.ScriptTarget.Latest,
    true,
    ts2.ScriptKind.TSX
  );
  const elements = extractJSXElements(sourceFile);
  const userImportedComponents = enforceShopifyOnlyComponents ? extractUserImportedComponents(sourceFile) : /* @__PURE__ */ new Set();
  const locallyDefinedComponents = enforceShopifyOnlyComponents ? extractLocallyDefinedComponents(sourceFile) : /* @__PURE__ */ new Set();
  for (const { tagName: componentName, start, end } of elements) {
    const nonShopifyComponentValidationResult = handleNonShopifyComponent(
      componentName,
      shopifyWebComponents,
      userImportedComponents,
      locallyDefinedComponents,
      enforceShopifyOnlyComponents
    );
    if (nonShopifyComponentValidationResult) {
      validations.push(nonShopifyComponentValidationResult);
      continue;
    }
    const { errors, handledDiagnostics: componentHandledDiagnostics } = getComponentErrors(start, end, diagnostics);
    componentHandledDiagnostics.forEach((d) => handledDiagnostics.add(d));
    validations.push({
      componentName,
      valid: errors.length === 0,
      errors
    });
  }
  const unhandledDiagnostics = diagnostics.filter(
    (d) => !handledDiagnostics.has(d)
  );
  const genericErrors = unhandledDiagnostics.filter(shouldIncludeDiagnostic).filter(shouldIncludeGenericDiagnostic).map((d) => ({
    message: ts2.flattenDiagnosticMessageText(d.messageText, "\n"),
    code: d.code,
    start: d.start,
    end: d.start !== void 0 && d.length !== void 0 ? d.start + d.length : void 0
  }));
  return { validations, genericErrors };
}
function shouldIncludeDiagnostic(diagnostic) {
  if (diagnostic.start === void 0 || diagnostic.length === void 0) {
    return false;
  }
  const message = ts2.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (diagnostic.code === DIAGNOSTIC_CODES.NAMESPACE_USED_AS_VALUE) {
    return false;
  }
  if (message.includes("Cannot find module") && !message.match(PATTERNS.SHOPIFY_MODULE)) {
    return false;
  }
  if (message.match(PATTERNS.MODULE_NOT_FOUND) || message.match(PATTERNS.USED_BEFORE_BEING_DEFINED) || message.match(PATTERNS.INVALID_JSX_ELEMENT) || message.match(PATTERNS.IMPLICITLY_HAS_AN_ANY_TYPE)) {
    return false;
  }
  return true;
}
function shouldIncludeGenericDiagnostic(diagnostic) {
  const message = ts2.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (message.match(PATTERNS.PREACT_REACT_COMPAT) || message.match(PATTERNS.NEVER_TYPE_CASCADE) || message.match(PATTERNS.PRIMITIVE_PROPERTY_ACCESS) || message.match(PATTERNS.CSS_PROPERTIES_COMPAT) || message.match(PATTERNS.OBJECT_IS_UNKNOWN)) {
    return false;
  }
  return true;
}
function isRelevantDiagnostic(diagnostic, componentStart, componentEnd) {
  if (!shouldIncludeDiagnostic(diagnostic)) {
    return false;
  }
  const diagnosticStart = diagnostic.start;
  const diagnosticEnd = diagnostic.start + diagnostic.length;
  const isInRange = diagnosticStart >= componentStart && diagnosticEnd <= componentEnd;
  if (!isInRange) {
    return false;
  }
  return true;
}
function getComponentErrors(componentStart, componentEnd, diagnostics) {
  const errors = [];
  const handledDiagnostics = [];
  const relevantDiagnostics = diagnostics.filter(
    (diagnostic) => isRelevantDiagnostic(diagnostic, componentStart, componentEnd)
  );
  for (const diagnostic of relevantDiagnostics) {
    const message = ts2.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n"
    );
    const error = parseDiagnostic(diagnostic, message);
    if (error) {
      errors.push(error);
      handledDiagnostics.push(diagnostic);
    }
  }
  return { errors, handledDiagnostics };
}
function parseDiagnostic(_diagnostic, message) {
  let property = "";
  let expected;
  let actual;
  const propertyNotExistMatch = message.match(PATTERNS.PROPERTY_NOT_EXIST);
  if (propertyNotExistMatch) {
    property = propertyNotExistMatch[1];
  } else {
    const typeMatch = message.match(PATTERNS.TYPE_NOT_ASSIGNABLE);
    const propMatch = message.match(PATTERNS.PROPERTY);
    if (typeMatch) {
      actual = typeMatch[1];
      expected = typeMatch[2];
    }
    if (propMatch) {
      property = propMatch[1];
    }
  }
  return {
    property: property || "unknown",
    message,
    expected,
    actual
  };
}
function formatValidationResponse(validations, genericErrors = []) {
  const errors = [];
  const validComponents = [];
  const skippedComponents = [];
  for (const validation of validations) {
    if (validation.valid) {
      if (validation.skipped) {
        skippedComponents.push(validation.componentName);
      } else {
        validComponents.push(validation.componentName);
      }
    } else {
      for (const error of validation.errors) {
        errors.push(
          `${validation.componentName} validation failed: Property '${error.property}': ${error.message}`
        );
      }
    }
  }
  for (const error of genericErrors) {
    errors.push(error.message);
  }
  let resultDetail;
  let result;
  if (errors.length === 0) {
    result = "success" /* SUCCESS */;
    if (validComponents.length > 0) {
      resultDetail = `All components validated successfully by TypeScript. Found components: ${Array.from(new Set(validComponents)).join(", ")}.`;
    } else {
      resultDetail = `No components found to validate by TypeScript.`;
    }
  } else {
    result = "failed" /* FAILED */;
    resultDetail = `Validation errors:
${errors.join("\n")}`;
  }
  if (skippedComponents.length > 0) {
    resultDetail += `

Try and use component from Shopify Polaris components. Non-Shopify components (not validated):
${skippedComponents.map((c) => `  - ${c}`).join("\n")}`;
  }
  return {
    result,
    resultDetail,
    componentValidationErrors: validations.filter((v) => !v.skipped && !v.valid).flatMap(
      (v) => v.errors.map((e) => ({
        componentName: v.componentName,
        ...e
      }))
    ),
    genericErrors,
    unvalidatedComponents: Array.from(new Set(skippedComponents))
  };
}

// src/validation/loadTypesIntoTSEnv.ts
import * as fs2 from "fs/promises";
import * as path3 from "path";

// src/packageOperations/findNPMPackageBasePath.ts
import { createRequire } from "module";
import * as fs from "fs";
import * as path2 from "path";
function resolvePackageJsonFallback(packageName, require2) {
  try {
    return require2.resolve(`${packageName}/package.json`);
  } catch {
    const searchPaths = require2.resolve.paths(packageName);
    if (searchPaths) {
      for (const searchPath of searchPaths) {
        const packagePath = path2.join(searchPath, packageName);
        const packageJsonPath = path2.join(packagePath, "package.json");
        try {
          fs.accessSync(packageJsonPath);
          return packageJsonPath;
        } catch {
          continue;
        }
      }
    }
    throw new Error(`Cannot find package '${packageName}'`);
  }
}
function findPackageRoot(resolvedPath, packageName) {
  const pathParts = resolvedPath.split(path2.sep);
  if (packageName.startsWith("@")) {
    const [scope, name] = packageName.split("/");
    const scopeIndex = pathParts.findIndex(
      (part, i) => part === scope && pathParts[i + 1] === name
    );
    return scopeIndex !== -1 ? pathParts.slice(0, scopeIndex + 2).join(path2.sep) : null;
  }
  const index = pathParts.indexOf(packageName);
  return index !== -1 ? pathParts.slice(0, index + 1).join(path2.sep) : null;
}
function findNPMPackageBasePath(packageName) {
  const require2 = createRequire(import.meta.url);
  let resolvedPath;
  try {
    resolvedPath = require2.resolve(packageName);
  } catch (error) {
    if (error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED" || error.code === "MODULE_NOT_FOUND") {
      resolvedPath = resolvePackageJsonFallback(packageName, require2);
    } else {
      throw error;
    }
  }
  if (!resolvedPath) {
    throw new Error(`Failed to resolve package path for ${packageName}`);
  }
  const packageRoot = findPackageRoot(resolvedPath, packageName);
  if (!packageRoot) {
    throw new Error(
      `Could not find package name "${packageName}" in resolved path: ${resolvedPath}`
    );
  }
  return packageRoot;
}

// src/validation/extractShopifyComponents.ts
function extractShopifyComponents(content, packageName) {
  if (!packageName) {
    return [];
  }
  switch (packageName) {
    case "@shopify/polaris-types":
    case "@shopify/ui-extensions":
      return extractWebComponentTagNames(content);
    case "@shopify/app-bridge-types":
      return extractAppBridgeElements(content);
    case "@shopify/hydrogen":
      return extractHydrogenComponents(content);
    default:
      return [];
  }
}
function extractWebComponentTagNames(content) {
  const components = [];
  const tagNameRegex = /declare\s+const\s+tagName\$?\w*\s*=\s*['"]([^'"]+)['"]/g;
  const bracketKeyRegex = /\[['"]([a-z]+-[a-z-]+)['"]\]\s*:/g;
  let match;
  while ((match = tagNameRegex.exec(content)) !== null || (match = bracketKeyRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  return [...new Set(components)];
}
function extractAppBridgeElements(content) {
  const components = [];
  const interfaceMatch = content.match(
    /interface\s+AppBridgeElements\s*\{([^}]+)\}/
  );
  if (interfaceMatch) {
    const keyRegex = /['"]([a-z]+-[a-z-]+)['"]\s*:/g;
    let match;
    while ((match = keyRegex.exec(interfaceMatch[1])) !== null) {
      components.push(match[1]);
    }
  }
  return components;
}
function extractHydrogenComponents(content) {
  const components = [];
  let match;
  const jsxFunctionRegex = /declare\s+function\s+(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*:\s*(?:react_jsx_runtime\.)?JSX\.Element/g;
  while ((match = jsxFunctionRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  const fcReturnTypeRegex = /declare\s+function\s+(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*:\s*ReturnType<FC>/g;
  while ((match = fcReturnTypeRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  const funcComponentElementRegex = /declare\s+function\s+(\w+)\s*(?:<[^>]*>)?\s*\([^)]*\)\s*:\s*react\.FunctionComponentElement/g;
  while ((match = funcComponentElementRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  const forwardRefRegex = /declare\s+const\s+(\w+)\s*:\s*react\.ForwardRefExoticComponent/g;
  while ((match = forwardRefRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  const providerRegex = /declare\s+const\s+(\w+)\s*:\s*react\.Provider/g;
  while ((match = providerRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  return [...new Set(components)];
}

// src/validation/loadTypesIntoTSEnv.ts
var HYDROGEN_EXTRA_DEPENDENCIES = [
  "@shopify/hydrogen-react",
  "react-router",
  "@react-router/dev",
  "graphql",
  "type-fest",
  "schema-dts"
];
var ALWAYS_LOADED_DEPENDENCIES = ["preact", "@types/react"];
var MissingPackageError = class extends Error {
  constructor(packageName, message) {
    super(message);
    this.packageName = packageName;
    this.name = "MissingPackageError";
  }
};
async function loadTypesIntoTSEnv(packageNames, virtualEnv, extensionSurfaceName, extensionTarget) {
  const missingPackages = [];
  const searchedPaths = [];
  const shopifyWebComponents = /* @__PURE__ */ new Set();
  const tryLoadPackage = async (packageName, entryPoint) => {
    try {
      await findTypesForPackage(
        packageName,
        virtualEnv,
        entryPoint,
        shopifyWebComponents
      );
    } catch (error) {
      if (error instanceof MissingPackageError) {
        searchedPaths.push(error.packageName);
        missingPackages.push(error.packageName);
      } else {
        throw error;
      }
    }
  };
  for (const packageName of packageNames) {
    let entryPoint;
    if (packageName === "@shopify/ui-extensions" && extensionSurfaceName) {
      if (extensionTarget) {
        await loadTargetSpecificComponents(
          packageName,
          virtualEnv,
          extensionSurfaceName,
          extensionTarget,
          shopifyWebComponents
        );
        continue;
      } else {
        entryPoint = path3.join("build", "ts", "surfaces", extensionSurfaceName);
      }
    } else if (packageName === "@shopify/polaris-types") {
      entryPoint = path3.join("dist", "polaris.d.ts");
    } else if (packageName === "@shopify/app-bridge-types") {
      entryPoint = "dist";
    } else if (packageName === "@shopify/hydrogen") {
      entryPoint = path3.join("dist", "production", "index.d.ts");
      await tryLoadPackage(packageName, entryPoint);
      for (const dep of HYDROGEN_EXTRA_DEPENDENCIES) {
        await tryLoadPackage(dep);
      }
      continue;
    }
    await tryLoadPackage(packageName, entryPoint);
  }
  for (const dep of ALWAYS_LOADED_DEPENDENCIES) {
    await tryLoadPackage(dep);
  }
  return { missingPackages, searchedPaths, shopifyWebComponents };
}
async function loadTargetSpecificComponents(packageName, virtualEnv, extensionSurfaceName, extensionTarget, shopifyWebComponents) {
  let packageRoot;
  try {
    packageRoot = findNPMPackageBasePath(packageName);
  } catch (error) {
    throw new MissingPackageError(
      packageName,
      `Failed to load package ${packageName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  const packageJsonPath = path3.join(packageRoot, "package.json");
  const packageJsonContent = await fs2.readFile(packageJsonPath, "utf-8");
  addFileToVirtualEnv(virtualEnv, packageJsonPath, packageJsonContent);
  const buildDir = path3.join(
    packageRoot,
    "build",
    "ts",
    "surfaces",
    extensionSurfaceName
  );
  const targetEntryPath = path3.join(
    buildDir,
    "targets",
    `${extensionTarget}.d.ts`
  );
  let targetContent;
  try {
    targetContent = await fs2.readFile(targetEntryPath, "utf-8");
  } catch {
    const typeFiles = await findTypeFiles(buildDir);
    for (const typeFile of typeFiles) {
      const fileContent = await fs2.readFile(typeFile, "utf-8");
      addFileToVirtualEnv(virtualEnv, typeFile, fileContent);
      for (const tagName of extractShopifyComponents(
        fileContent,
        packageName
      )) {
        shopifyWebComponents.add(tagName);
      }
    }
    return;
  }
  const componentImports = extractComponentImports(targetContent);
  const buildComponentsDir = path3.join(buildDir, "components");
  for (const componentName of componentImports) {
    const componentPath = path3.join(
      buildComponentsDir,
      `${componentName}.d.ts`
    );
    try {
      const componentContent = await fs2.readFile(componentPath, "utf-8");
      addFileToVirtualEnv(virtualEnv, componentPath, componentContent);
      for (const tagName of extractShopifyComponents(
        componentContent,
        packageName
      )) {
        shopifyWebComponents.add(tagName);
      }
    } catch {
    }
  }
  const sharedPath = path3.join(buildComponentsDir, "components-shared.d.ts");
  try {
    const sharedContent = await fs2.readFile(sharedPath, "utf-8");
    addFileToVirtualEnv(virtualEnv, sharedPath, sharedContent);
  } catch {
  }
  const otherDirs = ["api", "types", "event"];
  for (const dir of otherDirs) {
    const dirPath = path3.join(buildDir, dir);
    try {
      const typeFiles = await findTypeFiles(dirPath);
      for (const typeFile of typeFiles) {
        const fileContent = await fs2.readFile(typeFile, "utf-8");
        addFileToVirtualEnv(virtualEnv, typeFile, fileContent);
      }
    } catch {
    }
  }
  const additionalFiles = [
    "extension-targets.d.ts",
    "globals.d.ts",
    "api.d.ts"
  ];
  for (const fileName of additionalFiles) {
    const filePath = path3.join(buildDir, fileName);
    try {
      const content = await fs2.readFile(filePath, "utf-8");
      addFileToVirtualEnv(virtualEnv, filePath, content);
    } catch {
    }
  }
}
function extractComponentImports(content) {
  const components = [];
  const importRegex = /import\s+['"]\.\.\/components\/(\w+)\.d\.ts['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    components.push(match[1]);
  }
  return components;
}
async function findTypesForPackage(packageName, virtualEnv, entryPoint, shopifyWebComponents) {
  let packageRoot;
  try {
    packageRoot = findNPMPackageBasePath(packageName);
  } catch (error) {
    if (error instanceof MissingPackageError) {
      throw error;
    }
    throw new MissingPackageError(
      packageName,
      `Failed to load package ${packageName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  try {
    const packageJsonPath = path3.join(packageRoot, "package.json");
    const content = await fs2.readFile(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);
    if (pkg.name !== packageName) {
      throw new MissingPackageError(
        packageName,
        `Found package.json but name mismatch: expected "${packageName}", got "${pkg.name}"`
      );
    }
    addFileToVirtualEnv(virtualEnv, packageJsonPath, content);
    if (entryPoint) {
      const entryPointPath = path3.join(packageRoot, entryPoint);
      const stat2 = await fs2.stat(entryPointPath);
      if (stat2.isDirectory()) {
        const typeFiles = await findTypeFiles(entryPointPath);
        for (const typeFile of typeFiles) {
          const fileContent = await fs2.readFile(typeFile, "utf-8");
          addFileToVirtualEnv(virtualEnv, typeFile, fileContent);
          for (const tagName of extractShopifyComponents(
            fileContent,
            packageName
          )) {
            if (shopifyWebComponents) {
              shopifyWebComponents.add(tagName);
            }
          }
        }
      } else {
        await loadTypeFileWithImports(
          entryPointPath,
          packageRoot,
          virtualEnv,
          /* @__PURE__ */ new Set(),
          shopifyWebComponents,
          packageName
        );
      }
    } else {
      const typeFiles = await findTypeFiles(packageRoot);
      for (const typeFile of typeFiles) {
        const fileContent = await fs2.readFile(typeFile, "utf-8");
        addFileToVirtualEnv(virtualEnv, typeFile, fileContent);
        for (const tagName of extractShopifyComponents(
          fileContent,
          packageName
        )) {
          if (shopifyWebComponents) {
            shopifyWebComponents.add(tagName);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof MissingPackageError) {
      throw error;
    }
    throw new MissingPackageError(
      packageName,
      `Failed to load package ${packageName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
async function loadTypeFileWithImports(filePath, packageRoot, virtualEnv, loadedFiles = /* @__PURE__ */ new Set(), shopifyWebComponents, packageName) {
  const normalizedPath = path3.resolve(filePath);
  if (loadedFiles.has(normalizedPath)) {
    return;
  }
  loadedFiles.add(normalizedPath);
  let fileContent;
  try {
    fileContent = await fs2.readFile(normalizedPath, "utf-8");
  } catch {
    return;
  }
  addFileToVirtualEnv(virtualEnv, normalizedPath, fileContent);
  if (shopifyWebComponents) {
    for (const tagName of extractShopifyComponents(fileContent, packageName)) {
      shopifyWebComponents.add(tagName);
    }
  }
  const importPaths = extractImportPaths(fileContent);
  const currentDir = path3.dirname(normalizedPath);
  for (const importPath of importPaths) {
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      let resolvedPath = path3.resolve(currentDir, importPath);
      resolvedPath = resolvedPath.replace(/\.js$/, "");
      if (!resolvedPath.endsWith(".d.ts") && !resolvedPath.endsWith(".ts")) {
        const candidates = [
          resolvedPath + ".d.ts",
          resolvedPath + ".ts",
          path3.join(resolvedPath, "index.d.ts")
        ];
        resolvedPath = await tryResolvePath(candidates);
        if (!resolvedPath) {
          continue;
        }
      }
      await loadTypeFileWithImports(
        resolvedPath,
        packageRoot,
        virtualEnv,
        loadedFiles,
        shopifyWebComponents,
        packageName
      );
    }
  }
}
function extractImportPaths(content) {
  const imports = [];
  const importRegex = /(?:import|export)(?:\s+type)?\s+(?:(?:[^'"]*)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}
async function findTypeFiles(dir) {
  const typeFiles = [];
  async function walkDir(currentDir, depth = 0) {
    if (depth > 5) return;
    const entries = await fs2.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path3.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        await walkDir(fullPath, depth + 1);
      } else if (entry.isFile() && (entry.name.endsWith(".d.ts") || entry.name.endsWith(".ts"))) {
        typeFiles.push(fullPath);
      }
    }
  }
  await walkDir(dir);
  return typeFiles;
}
async function tryResolvePath(candidates) {
  for (const candidate of candidates) {
    try {
      await fs2.access(candidate);
      return candidate;
    } catch {
    }
  }
  return null;
}

// src/validation/validateComponentCodeBlock.ts
var ENFORCE_SHOPIFY_ONLY_COMPONENTS_APIS = [
  TYPESCRIPT_APIs.POLARIS_ADMIN_EXTENSIONS,
  TYPESCRIPT_APIs.POLARIS_CHECKOUT_EXTENSIONS,
  TYPESCRIPT_APIs.POLARIS_CUSTOMER_ACCOUNT_EXTENSIONS,
  TYPESCRIPT_APIs.POS_UI
];
async function validateComponentCodeBlock(input) {
  try {
    const { code: code2, apiName, extensionTarget } = input;
    if (!code2) {
      return {
        result: "failed" /* FAILED */,
        resultDetail: "Validation failed: Invalid input: code is required"
      };
    }
    if (Object.keys(SHOPIFY_APIS2).filter(
      (api) => SHOPIFY_APIS2[api].extensionSurfaceName
    ).includes(apiName) && !extensionTarget) {
      return {
        result: "failed" /* FAILED */,
        resultDetail: `Extension target is required for API: ${apiName}. Use the learn_shopify_ui_extensions tool to get the list of available extension targets.`
      };
    }
    const apiMapping = getAPIMapping(apiName);
    const virtualEnv = createVirtualTSEnvironment(apiName);
    const packageNames = apiMapping.publicPackages ?? [];
    const { missingPackages, searchedPaths, shopifyWebComponents } = await loadTypesIntoTSEnv(
      packageNames,
      virtualEnv,
      apiMapping.extensionSurfaceName,
      extensionTarget
    );
    if (missingPackages.length > 0) {
      const packageList = missingPackages.map((pkg) => `  - ${pkg}`).join("\n");
      const installCmd = `npm install -D ${missingPackages.join(" ")}`;
      const searchedPathsList = searchedPaths.map((path4) => `  - ${path4}`).join("\n");
      return {
        result: "failed" /* FAILED */,
        resultDetail: `Missing required dev dependencies:
${packageList}

Searched paths:
${searchedPathsList}

Please install them using:
${installCmd}`
      };
    }
    const tmpFileName = `validation-${Date.now()}.tsx`;
    const codeWithImports = formatCode(code2, packageNames, extensionTarget);
    addFileToVirtualEnv(virtualEnv, tmpFileName, codeWithImports);
    const diagnostics = virtualEnv.languageService.getSemanticDiagnostics(tmpFileName);
    const enforceShopifyOnlyComponents = ENFORCE_SHOPIFY_ONLY_COMPONENTS_APIS.includes(apiName);
    const { validations, genericErrors } = extractComponentValidations(
      codeWithImports,
      diagnostics,
      shopifyWebComponents,
      { enforceShopifyOnlyComponents }
    );
    return formatValidationResponse(validations, genericErrors);
  } catch (error) {
    return {
      result: "failed" /* FAILED */,
      resultDetail: `Validation failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
function getAPIMapping(apiName) {
  if (!apiName) {
    throw new Error(`Invalid input: apiName is required`);
  }
  const apiEntry = Object.values(SHOPIFY_APIS2).find(
    (api) => api.name === apiName
  );
  if (!apiEntry) {
    throw new Error(`Unknown API: ${apiName}`);
  }
  if (!apiEntry.publicPackages || apiEntry.publicPackages.length === 0) {
    throw new Error(`No packages configured for API: ${apiName}`);
  }
  return apiEntry;
}

// src/agent-skills/scripts/instrumentation.ts
var SHOPIFY_DEV_BASE_URL = process.env.SHOPIFY_DEV_INSTRUMENTATION_URL || "https://shopify.dev/";
function isInstrumentationDisabled() {
  try {
    return process.env.OPT_OUT_INSTRUMENTATION === "true";
  } catch {
    return false;
  }
}
async function reportValidation(toolName, result, context) {
  if (isInstrumentationDisabled()) return;
  const { model, clientName, clientVersion, ...remainingContext } = context ?? {};
  try {
    const url = new URL("/mcp/usage", SHOPIFY_DEV_BASE_URL);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "X-Shopify-Surface": "skills",
      "X-Shopify-MCP-Version": "1.0",
      "X-Shopify-Timestamp": (/* @__PURE__ */ new Date()).toISOString()
    };
    if (clientName) headers["X-Shopify-Client-Name"] = String(clientName);
    if (clientVersion) headers["X-Shopify-Client-Version"] = String(clientVersion);
    if (model) headers["X-Shopify-Client-Model"] = String(model);
    await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        tool: toolName,
        parameters: {
          skill: "shopify-hydrogen",
          skillVersion: "1.0",
          ...remainingContext
        },
        result: JSON.stringify(result)
      })
    });
  } catch {
  }
}

// src/agent-skills/scripts/validate_components.ts
var { values } = parseArgs({
  options: {
    code: { type: "string", short: "c" },
    file: { type: "string", short: "f" },
    target: { type: "string", short: "t" },
    model: { type: "string" },
    "client-name": { type: "string" },
    "client-version": { type: "string" },
    "artifact-id": { type: "string" },
    "revision": { type: "string" }
  }
});
var code = values.code;
if (values.file) {
  try {
    code = readFileSync(values.file, "utf-8");
  } catch (error) {
    console.log(
      JSON.stringify({
        success: false,
        result: "error",
        details: `Failed to read file: ${values.file}`
      })
    );
    process.exit(1);
  }
}
if (!code) {
  console.error("Either --code or --file must be provided.");
  process.exit(1);
}
async function main() {
  const response = await validateComponentCodeBlock({
    code,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiName: "hydrogen",
    extensionTarget: values.target
  });
  const output = {
    success: response.result === "success" /* SUCCESS */,
    result: response.result,
    details: response.resultDetail,
    target: values.target ?? null
  };
  console.log(JSON.stringify(output, null, 2));
  await reportValidation("validate_components", output, {
    model: values.model,
    clientName: values["client-name"],
    clientVersion: values["client-version"],
    code,
    target: values.target,
    artifactId: values["artifact-id"],
    revision: values["revision"]
  });
  process.exit(output.success ? 0 : 1);
}
main().catch(async (error) => {
  const output = {
    success: false,
    result: "error",
    details: error instanceof Error ? error.message : String(error)
  };
  console.log(JSON.stringify(output));
  await reportValidation("validate_components", output, {
    model: values.model,
    clientName: values["client-name"],
    clientVersion: values["client-version"],
    code,
    artifactId: values["artifact-id"],
    revision: values["revision"]
  });
  process.exit(1);
});
