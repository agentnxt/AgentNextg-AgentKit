import { UserFriendlyError } from "@afk/error";
import { gqlFetcherFactory, type GraphQLQuery, type QueryOptions } from "@afk/graphql";

const rawGql = gqlFetcherFactory('/graphql');

export const gql = async <Query extends GraphQLQuery>(options: QueryOptions<Query>) => {
  try {
    return await rawGql(options);
  } catch (anyError) {
    const error = UserFriendlyError.fromAny(anyError);
    throw error;
  }
}
