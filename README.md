# network-api
[WIP] The public API to the Urbit network explorer (https://network.urbit.org)

Commits to this repo follow [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format. A settings file for [VSCode](https://code.visualstudio.com/) users is also included.

## API

Interact with the API locally through GraphQL Playground by going to `http://localhost:4000/`. The following query returns the output of the resolver for the defined items:

```
query {
  getDB
  getNode
  getNodes
  populatePKIEvents
  getActivity
}
```

Items may be added or remove from the query as needed.

## Postgres Database

If using MacOS, install Postgres via Homebrew with `brew install postgresql`, then start it as a daemon with `brew services start postgresql`. You should now have a Postgres server running on port 5432. If not on MacOS, descriptions of other methods of installing and running a local Postgres database are easily available online.

To seed all necessary Postgres databases to run all queries and mutations locally, simply run the following in GraphQL Playground at `http://localhost:4000/`:

```
mutation {
  populateAll
}
```

## Node Server

Run `yarn` to install all packages, then start the server with `nodemon index.js`.