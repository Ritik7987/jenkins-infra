"use client";

import { ApolloLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import {
  CombinedGraphQLErrors,
  ServerError,
} from "@apollo/client/errors";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { createClient } from "graphql-ws";
import { PUBLIC_ROUTES } from "../enum/routes.enum";

function makeClient() {
  const uploadLink = new UploadHttpLink({
    uri: `${process.env.NEXT_PUBLIC_BASE_URL}/graphql`,
    credentials: "include",
    headers: {
      "apollo-require-preflight": "true",
    },
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: `${process.env.NEXT_PUBLIC_BASE_URL?.replace("http", "ws")}/graphql`,
          })
        )
      : null;

  const errorLink = new ErrorLink(({ error }) => {
    // Prevent redirecting if we are executing login/signup operations
    // or if the user is already on the home page.
    // This allows the components to handle the error properly and show notifications.
    if (typeof window !== "undefined" && PUBLIC_ROUTES.includes(window.location.pathname)) {
      return;
    }

    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, extensions }) => {
        if (
          extensions?.code === "UNAUTHENTICATED" ||
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("unauthenticated")
        ) {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
      });
    } else if (ServerError.is(error)) {
      if (error.statusCode === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    }
  });

  const splitLink =
    typeof window !== "undefined" && wsLink != null
      ? ApolloLink.split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          uploadLink
        )
      : uploadLink;

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, splitLink]),
  });
}

export function ApolloWrapper({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
