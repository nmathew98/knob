import { jsonToGraphQLQuery } from "json-to-graphql-query";

/**
 * Build a GraphQL query from an object
 *
 * @param query the object
 * @returns a GraphQL query string
 */
export const createQuery = (query: Record<string, any>) =>
	jsonToGraphQLQuery(query, { pretty: process.env.NODE_ENV !== "production" });
