import { Metadata, ResolvedKeys, UnwindTuple } from "./NodeUtilities";
import { QuerySubqueries, Query, Subquery } from "./Query";
export declare type BuildQuery = <Node>(metadata: Metadata<Node>) => QueryBuilder<Node>;
export declare type QueryBuilder<Node> = <Subqueries extends QuerySubqueries<Node>>(callback: (getter: SubqueryBuilder<Node>) => Subqueries | Subqueries[]) => Query<Node, Subqueries>;
export declare type SubqueryBuilder<Node> = <Key extends ResolvedKeys<Node>>(key: Key, ...args: [Parameters<Node[Key]>] extends [never] ? never : Parameters<Node[Key]>) => Subquery<Node, Key> & NestedWrappedQueryBuilder<UnwindTuple<ReturnType<Node[Key]>>, Node, Key, never>;
export declare type NestedWrappedQueryBuilder<Node extends UnwindTuple<ReturnType<$Node[$Key]>>, $Node, $Key extends ResolvedKeys<$Node>, ReturnQueries extends Query<any, any> = never> = <Subqueries extends QuerySubqueries<Extract<Node, Match>>, Match extends Partial<Node> | never>(matchOrCallback: Match | ((getter: SubqueryBuilder<Node>) => Subqueries | Subqueries[]), callback?: ((getter: SubqueryBuilder<Extract<Node, Match>>) => Subqueries | Subqueries[])) => (Subquery<$Node, $Key, ReturnQueries | Query<Extract<Node, Match>, Subqueries>> & NestedWrappedQueryBuilder<UnwindTuple<ReturnType<$Node[$Key]>>, $Node, $Key, ReturnQueries | Query<Extract<Node, Match>, Subqueries>>);
