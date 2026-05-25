export const snapshotDetectsImports = `"use strict";
const {Fragment: _Fragment, jsx: _jsx} = arguments[0];
const h = 1;
function _createMdxContent(props) {
  return _jsx(_Fragment, {});
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? _jsx(MDXLayout, {
    ...props,
    children: _jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
return {
  h,
  default: MDXContent
};
`;
