import { Query } from "./Query";
import { PartiallyAppliedResolver, Resolver } from "./Resolvers";
import { Result } from "./Result";

export type ResolveInner = <Q extends Query<any, any>>(query: Q, resolver: Q extends Query<infer Node, any> ? PartiallyAppliedResolver<Node> : never) => Result<Q>;

export type Resolve = <Q extends Query<any, any>>(query: Q, resolverFactory: Q extends Query<infer Node, any> ? Resolver<Node> : never) => Result<Q>;
