export type UnwindTuple<N> = {
  0: N extends (infer L)[] ? UnwindTuple<L> : never;
  1: Exclude<N, any[]>
}[N extends (infer L)[] ? 0 : 1]

export type ResolvedKeys<N> = { [K in keyof N]: N[K] extends (...args: any[]) => any ? K : never }[keyof N];
export type UnresolvedKeys<N> = { [K in keyof N]: N[K] extends (...args: any[]) => any ? never : K }[keyof N];

export type Metadata<N> = { [K in UnresolvedKeys<N>]: N[K] };
