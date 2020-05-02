import { merge } from 'lodash';
import { GraphQLFormattedError } from 'graphql';
import { ApolloServer, Config } from 'apollo-server-fastify';
import { snakeCase } from 'snake-case';

import * as common from './schema/common';
import * as bookmarks from './schema/bookmarks';
import * as notifications from './schema/notifications';
import * as posts from './schema/posts';
import * as settings from './schema/settings';
import * as sourceRequests from './schema/sourceRequests';
import * as sources from './schema/sources';
import { AuthDirective } from './directive';
import { UrlDirective } from './directive/UrlDirective';

export default async function (config: Config): Promise<ApolloServer> {
  return new ApolloServer({
    typeDefs: [
      common.typeDefs,
      bookmarks.typeDefs,
      notifications.typeDefs,
      posts.typeDefs,
      settings.typeDefs,
      sourceRequests.typeDefs,
      sources.typeDefs,
    ],
    resolvers: merge(
      common.resolvers,
      bookmarks.resolvers,
      notifications.resolvers,
      settings.resolvers,
      sourceRequests.resolvers,
      sources.resolvers,
    ),
    schemaDirectives: {
      auth: AuthDirective,
      url: UrlDirective,
    },
    ...config,
    uploads: true,
    formatError: (error): GraphQLFormattedError => {
      if (error.originalError.name === 'EntityNotFound') {
        error.extensions.code = 'NOT_FOUND_ERROR';
      } else {
        error.extensions.code = snakeCase(
          error.originalError.name,
        ).toUpperCase();
      }
      return error;
    },
  });
}
