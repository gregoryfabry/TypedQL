import { Resolve, ResolveInner } from "./types/Resolve";
import { Query, Subquery } from "./types/Query";
import { Resolver, PartiallyAppliedResolver } from "./types/Resolvers";
import { Result } from "./types/Result";

const resolve: Resolve = async <Q extends Query<any, any>>(query: Q, resolverFactory: Resolver<any>) => {
  const result = query.metadata ? { ...query.metadata } : {};

  return {
    ...result,
    ...(await resolveInner(query, resolverFactory(result) as any))
  }
}

const resolveInner: ResolveInner = async <Q extends Query<any, any>>(query: Q, resolver: PartiallyAppliedResolver<any>) => {
  const subqueryMap = query.subqueries.reduce((acc, cur: Subquery<any, any, any>) => {
    return {
      ...acc,
      [cur.$key]: cur
    }
  }, {});

  const partialResult = await resolver(query);
  const result: { [key: string]: any } = {};

  for (let prop in partialResult) {
    if (typeof partialResult[prop] === 'function') {
      if (subqueryMap[prop]) {
        const subquery = (subqueryMap[prop] as Subquery<any, any, any>);
        const subqueryResult = partialResult[prop](...subquery.args);

        result[prop] = await mapOverSubqueryResult(subqueryResult, subquery.returnQueries);
      }
    } else {
      result[prop] = partialResult[prop];
    }
  }

  return result as Result<Q>;
}

const mapOverSubqueryResult = async (subqueryResult: PartiallyAppliedResolver<any> | (PartiallyAppliedResolver<any>)[], returnQueries: Query<any, any>[]): Promise<{} | {}[]> => {
  if (subqueryResult instanceof Array) {
    const mappedSubqueryResult = [];
    for (let i = 0; i < subqueryResult.length; i++) {
      mappedSubqueryResult.push(await mapOverSubqueryResult(subqueryResult[i], returnQueries));
    }
    return mappedSubqueryResult;
  }

  let resolvedResult = {
    ...subqueryResult.metadata,
  };
  const metadataResult = subqueryResult.metadata;

  for (let i = 0; i < returnQueries.length; i++) {
    const returnQuery = returnQueries[i];

    if (returnQuery.metadata) {
      for (let prop in returnQuery.metadata) {
        if (metadataResult[prop] !== returnQuery.metadata[prop]) {
          continue;
        }
      }
    }

    resolvedResult = {
      ...resolvedResult,
      ...(await resolveInner(returnQuery, subqueryResult))
    }
  }

  return resolvedResult;
}

export { resolve };