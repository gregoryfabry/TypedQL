import { Query, Subquery } from "./Query";
import { Metadata, UnresolvedKeys } from "./NodeUtilities";

export type SubResult<N, ReturnQueries extends Query<any, any>> = N extends any ?
  {
    0: N extends (infer L)[] ? SubResult<L, ReturnQueries>[] : never;
    1: N extends (ReturnQueries extends Query<infer RN, any> ? RN : never) ? Result<Extract<ReturnQueries, Query<N, any>>> : Metadata<N>;
  }[N extends any[] ? 0 : 1]
  : never;

export type Result<Q extends Query<any, any>> =
  Q extends Query<infer Node, infer Subqueries>
  ? Metadata<Node> & {
    [SubqueryKey in Subqueries['$key']]: (
      (SubqueryKey extends UnresolvedKeys<Node>
        ? Node[SubqueryKey]
        : (Extract<Subqueries, { $key: SubqueryKey }> extends Subquery<any, any, infer ReturnQueries>
          ? SubResult<ReturnType<Node[SubqueryKey]>, ReturnQueries>
          : never
        )
      )
    )
  }
  : never;