import { ResolvedKeys } from "./NodeUtilities";

export type Query<Node, Subqueries extends QuerySubqueries<Node> = never> = {
  metadata?: Partial<Node>;
  subqueries: Subqueries[];
}

export type QuerySubqueries<Node> = { [Key in ResolvedKeys<Node>]: Subquery<Node, Key, any> }[ResolvedKeys<Node>]

export type Subquery<$Node, $Key extends ResolvedKeys<$Node>, ReturnQueries extends Query<any, any> = never> = {
  $node?: $Node;
  $key: $Key;
  args: Parameters<$Node[$Key]>;
  returnQueries: ReturnQueries[];
};
