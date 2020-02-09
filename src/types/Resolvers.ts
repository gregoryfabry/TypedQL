import { Metadata } from "./NodeUtilities";
import { Query } from "./Query";

export type ApplyResolvers<N> = N extends any ? {
  0: N extends (infer L)[] ? ApplyResolvers<L>[] : never;
  1: PartiallyAppliedResolver<N>
}[N extends any[] ? 0 : 1] : never;


export type ResolverInput<Node> = (metadata: Metadata<Node>) => ResolverFn<Node>;
export type Resolver<Node> = (metadata: Metadata<Node>) => PartiallyAppliedResolver<Node>;
export type PartiallyAppliedResolver<Node> = ResolverFn<Node> & { metadata: Metadata<Node> }

export type ResolverFn<Node> = (query: Query<Node, any>) => ResolverResult<Node>;

export type ResolverResult<Node> = {
  [Key in keyof Node]: Node[Key] extends (...args: any[]) => any ? (...args: Parameters<Node[Key]>) => ApplyResolvers<ReturnType<Node[Key]>> : Node[Key]
}

export type CreateResolver = <Node>(resolver: ResolverInput<Node>) => Resolver<Node>;