export interface ImportStatement {
    module: string;
    imports: Array<
        | {
              kind: "named";
              imported: string;
              local: string;
              value: any;
          }
        | {
              kind: "namespace" | "default";
              local: string;
              value: any;
          }
    >;
}
