import { ResolvedKeys } from "./NodeUtilities";
export declare type Query<Node, Subqueries extends QuerySubqueries<Node> = never> = {
    metadata?: Partial<Node>;
    subqueries: Subqueries[];
};
export declare type QuerySubqueries<Node> = {
    [Key in ResolvedKeys<Node>]: Subquery<Node, Key, any>;
}[ResolvedKeys<Node>];
export declare type Subquery<$Node, $Key extends ResolvedKeys<$Node>, ReturnQueries extends Query<any, any> = never> = {
    $node?: $Node;
    $key: $Key;
    args: Parameters<$Node[$Key]>;
    returnQueries: ReturnQueries[];
};
