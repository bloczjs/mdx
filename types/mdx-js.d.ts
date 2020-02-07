declare module "@mdx-js/mdx";
declare module "@mdx-js/runtime" {
    import { ComponentType, FunctionComponent } from "react";
    interface Scope {
        [key: string]: any;
    }
    interface Components {
        [key: string]: React.ComponentType<any>;
    }
    const MDX: FunctionComponent<{
        scope?: Scope;
        components?: Components;
    }>;
    export default MDX;
}
