import test from "node:test";
import assert from "node:assert/strict";
import { compile } from "@mdx-js/mdx";
import plugin from "@blocz/mdx-plugin-detect-imports";

const mdxText = `
import hello, { useFunction } from '@blocz/lib';
import { Tabs, Button as ButtonElement } from '@blocz/elements';
import * as foo from '@blocz/foo';

### How it works

1. First item
2. Second item

---

### TL;DR

- First item
- Second item
- Nested list
    - First nested \`item\`
    - Second _nested_ item
    - **Third** nested item

---

export const label = "Click Me!";

export const props = {
    label,
    onClick: () => alert('Hello there!')
}

<ButtonElement
    variant="blue"
    label={label}
    {...props}
/>

    <ButtonElement
        label={label}
        {...props}
    />

`;

const defaultImportStatements = `
export const importStatements = [{
  module: "@blocz/lib",
  imports: [{
    kind: "default",
    local: "hello",
    value: hello
  }, {
    kind: "named",
    imported: "useFunction",
    local: "useFunction",
    value: useFunction
  }]
}, {
  module: "@blocz/elements",
  imports: [{
    kind: "named",
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    imported: "Button",
    local: "ButtonElement",
    value: ButtonElement
  }]
}, {
  module: "@blocz/foo",
  imports: [{
    kind: "namespace",
    local: "foo",
    value: foo
  }]
}];
`;

const expectedJsx = `import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
import hello, {useFunction} from '@blocz/lib';
import {Tabs, Button as ButtonElement} from '@blocz/elements';
import * as foo from '@blocz/foo';
export const label = "Click Me!";
export const props = {
  label,
  onClick: () => alert('Hello there!')
};
export const importStatements = [{
  module: "@blocz/lib",
  imports: [{
    kind: "default",
    local: "hello",
    value: hello
  }, {
    kind: "named",
    imported: "useFunction",
    local: "useFunction",
    value: useFunction
  }]
}, {
  module: "@blocz/elements",
  imports: [{
    kind: "named",
    imported: "Tabs",
    local: "Tabs",
    value: Tabs
  }, {
    kind: "named",
    imported: "Button",
    local: "ButtonElement",
    value: ButtonElement
  }]
}, {
  module: "@blocz/foo",
  imports: [{
    kind: "namespace",
    local: "foo",
    value: foo
  }]
}];
function _createMdxContent(props) {
  const _components = {
    code: "code",
    em: "em",
    h3: "h3",
    hr: "hr",
    li: "li",
    ol: "ol",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return _jsxs(_Fragment, {
    children: [_jsx(_components.h3, {
      children: "How it works"
    }), "\\n", _jsxs(_components.ol, {
      children: ["\\n", _jsx(_components.li, {
        children: "First item"
      }), "\\n", _jsx(_components.li, {
        children: "Second item"
      }), "\\n"]
    }), "\\n", _jsx(_components.hr, {}), "\\n", _jsx(_components.h3, {
      children: "TL;DR"
    }), "\\n", _jsxs(_components.ul, {
      children: ["\\n", _jsx(_components.li, {
        children: "First item"
      }), "\\n", _jsx(_components.li, {
        children: "Second item"
      }), "\\n", _jsxs(_components.li, {
        children: ["Nested list", "\\n", _jsxs(_components.ul, {
          children: ["\\n", _jsxs(_components.li, {
            children: ["First nested ", _jsx(_components.code, {
              children: "item"
            })]
          }), "\\n", _jsxs(_components.li, {
            children: ["Second ", _jsx(_components.em, {
              children: "nested"
            }), " item"]
          }), "\\n", _jsxs(_components.li, {
            children: [_jsx(_components.strong, {
              children: "Third"
            }), " nested item"]
          }), "\\n"]
        }), "\\n"]
      }), "\\n"]
    }), "\\n", _jsx(_components.hr, {}), "\\n", "\\n", "\\n", _jsx(ButtonElement, {
      variant: "blue",
      label: label,
      ...props
    }), "\\n", _jsx(ButtonElement, {
      label: label,
      ...props
    })]
  });
}
export default function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsx(MDXLayout, {
    ...props,
    children: _jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
`;

test("injects the right importStatements variable", async () => {
    const jsx = (
        await compile(mdxText, {
            remarkPlugins: [plugin],
        })
    ).value;
    assert.equal(jsx, expectedJsx);
    assert.ok(jsx.includes(defaultImportStatements));
});
test("allows for otherNames than 'importStatements'", async () => {
    const jsx = (
        await compile(mdxText, {
            remarkPlugins: [[plugin, { exportName: "otherName" }]],
        })
    ).value;
    assert.ok(
        jsx.includes(
            defaultImportStatements.replace("importStatements", "otherName"),
        ),
    );
});
