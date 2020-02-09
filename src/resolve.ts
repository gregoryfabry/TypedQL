import { Resolve, ResolveInner } from "./types/Resolve";
import { Query, Subquery } from "./types/Query";
import { Resolver, PartiallyAppliedResolver } from "./types/Resolvers";
import { Result } from "./types/Result";

const resolve: Resolve = <Q extends Query<any, any>>(query: Q, resolverFactory: Resolver<any>) => {
  const result = query.metadata ? { ...query.metadata } : {};

  return {
    ...result,
    ...resolveInner(query, resolverFactory(result) as any)
  }
}

const resolveInner: ResolveInner = <Q extends Query<any, any>>(query: Q, resolver: PartiallyAppliedResolver<any>) => {
  const subqueryMap = query.subqueries.reduce((acc, cur: Subquery<any, any, any>) => {
    return {
      ...acc,
      [cur.$key]: cur
    }
  }, {});

  const partialResult = resolver(query);
  const result: { [key: string]: any } = {};

  for (let prop in partialResult) {
    if (typeof partialResult[prop] === 'function') {
      if (subqueryMap[prop]) {
        const subquery = (subqueryMap[prop] as Subquery<any, any, any>);
        const subqueryResult = partialResult[prop](...subquery.args);

        result[prop] = mapOverSubqueryResult(subqueryResult, subquery.returnQueries);
      }
    } else {
      result[prop] = partialResult[prop];
    }
  }

  return result as Result<Q>;
}

const mapOverSubqueryResult = (subqueryResult: PartiallyAppliedResolver<any> | (PartiallyAppliedResolver<any>)[], returnQueries: Query<any, any>[]): {} | {}[] => {
  if (subqueryResult instanceof Array) {
    return subqueryResult.map(sqr => mapOverSubqueryResult(sqr, returnQueries));
  }

  let resolvedResult = {
    ...subqueryResult.metadata,
  };
  const metadataResult = subqueryResult.metadata;

  returnQueries.forEach(returnQuery => {
    if (returnQuery.metadata) {
      for (let prop in returnQuery.metadata) {
        if (metadataResult[prop] !== returnQuery.metadata[prop]) {
          return;
        }
      }
    }

    resolvedResult = {
      ...resolvedResult,
      ...resolveInner(returnQuery, subqueryResult)
    }
  });


  return resolvedResult;
}

export { resolve };