declare module "acorn-jsx" {
  import { Parser } from "acorn";
  const jsx: (options?: any) => (BaseParser: typeof Parser) => typeof Parser;
  export default jsx;
}
