export interface ImportStatement {
    module: string;
    imports: Array<
        | {
              kind: "named";
              imported: string;
              local: string;
              value: unknown;
          }
        | {
              kind: "namespace" | "default";
              local: string;
              value: unknown;
          }
    >;
}
