export interface ImportStatement {
    module: string;
    imports: Array<{
        imported: string;
        local: string;
        value: any;
    }>;
}
