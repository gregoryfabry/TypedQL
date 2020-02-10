"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buildQuery = (metadata) => (callback) => {
    let subqueries = callback(subqueryBuilder);
    if (!(subqueries instanceof Array)) {
        subqueries = [subqueries];
    }
    return {
        metadata,
        subqueries: subqueries.map(s => (Object.assign({}, s)))
    };
};
exports.buildQuery = buildQuery;
const subqueryBuilder = ($key, ...args) => {
    const nestedWrappedQueryBuilderFactory = ($key, args, returnQueries) => {
        const nestedWrappedQueryBuilder = (matchOrCallback, _callback) => {
            let callback = _callback;
            let metadata = matchOrCallback;
            if (!_callback) {
                callback = matchOrCallback;
                metadata = undefined;
            }
            let subqueries = callback(subqueryBuilder);
            if (!(subqueries instanceof Array)) {
                subqueries = [subqueries];
            }
            const newQuery = {
                metadata,
                subqueries: subqueries.map(s => (Object.assign({}, s)))
            };
            return nestedWrappedQueryBuilderFactory($key, args, returnQueries.concat(newQuery));
        };
        nestedWrappedQueryBuilder.$key = $key;
        nestedWrappedQueryBuilder.args = args;
        nestedWrappedQueryBuilder.returnQueries = returnQueries;
        return nestedWrappedQueryBuilder;
    };
    return nestedWrappedQueryBuilderFactory($key, args, []);
};
