import { BuildQuery, SubqueryBuilder, NestedWrappedQueryBuilder } from "./types/QueryBuilder";
import { Metadata } from "./types/NodeUtilities";
import { Subquery, Query } from "./types/Query";

const buildQuery: BuildQuery = (metadata: Metadata<any>) =>
  (callback: (getter: SubqueryBuilder<any>) => Subquery<any, any, any> | Subquery<any, any, any>[]) => {
    let subqueries = callback(subqueryBuilder);

    if (!(subqueries instanceof Array)) {
      subqueries = [subqueries];
    }

    return {
      metadata,
      subqueries: subqueries.map(s => ({ ...s }))
    } as unknown as Query<any, any>;
  }

const subqueryBuilder: SubqueryBuilder<any> = ($key, ...args) => {
  const nestedWrappedQueryBuilderFactory = ($key: string, args: unknown[], returnQueries: Query<any, any>[]): Subquery<any, any, never> & NestedWrappedQueryBuilder<never, any, any> => {
    const nestedWrappedQueryBuilder = (matchOrCallback: {} | ((getter: SubqueryBuilder<any>) => Subquery<any, any> | Subquery<any, any>[]), _callback?: (getter: SubqueryBuilder<any>) => Subquery<any, any> | Subquery<any, any>[]) => {
      let callback = _callback!;
      let metadata: typeof matchOrCallback | undefined = matchOrCallback;

      if (!_callback) {
        callback = matchOrCallback as typeof callback;
        metadata = undefined;
      }

      let subqueries = callback(subqueryBuilder);

      if (!(subqueries instanceof Array)) {
        subqueries = [subqueries];
      }

      const newQuery = {
        metadata,
        subqueries: subqueries.map(s => ({ ...s }))
      }

      return nestedWrappedQueryBuilderFactory($key, args, returnQueries.concat(newQuery));
    }

    nestedWrappedQueryBuilder.$key = $key;
    nestedWrappedQueryBuilder.args = args;
    nestedWrappedQueryBuilder.returnQueries = returnQueries;

    return nestedWrappedQueryBuilder as unknown as Subquery<any, any, never> & NestedWrappedQueryBuilder<never, any, any>;
  }

  return nestedWrappedQueryBuilderFactory($key, args, []);
}

export { buildQuery as queryBuilder };