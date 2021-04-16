# network-api
[WIP] The public API to the Urbit network explorer (https://network.urbit.org)

Commits to this repo follow [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format. A settings file for [VSCode](https://code.visualstudio.com/) users is also included.

## Postgres Database

If using MacOS, install Postgres via Homebrew with `brew install postgresql`, then start it as a daemon with `brew services start postgresql`. You should now have a Postgres server running on port 5432. If not on MacOS, descriptions of other methods of installing and running a local Postgres database are easily available online.

To seed all necessary Postgres tables to enable running all queries and mutations locally, simply run the following in GraphQL Playground at `http://localhost:4000/`:

```
mutation {
  populateAll
}
```

## Node Server

Run `yarn` to install all packages, then start the server with `nodemon index.js`.

## API

Interact with the API locally through GraphQL Playground by going to `http://localhost:4000/`. Find full queries and mutations for the defined API below:

```
mutation {
  populatePKIEvents
  populateRawEvents
  populateRadar
  populatePing
  populateNodeStatus
  populateEventType
  populateNodeType
  populateAll
}

query ($input: PKIEventInput) {
  getPKIEvents(input: $input) {
    eventId
    nodeId
    eventTypeId
    sponsorId
    time
    address
    continuityNumber
    revisionNumber
  }
}

query ($input: GetNodeInput) {
  getNode(input: $input) {
    urbitId
    numOwners
    sponsors
    statusId
    kids
    nodeType
    continuityNumber
    revisionNumber
    ownershipProxy
    spawnProxy
    transferProxy
    managementProxy
  }
}

query ($input: GetNodesInput) {
  getNodes(input: $input) {
    urbitId
    numOwners
    sponsors
    statusId
    kids
    nodeType
    continuityNumber
    revisionNumber
    ownershipProxy
    spawnProxy
    transferProxy
    managementProxy
  }
}

query ($input: GetActivityInput) {
  getActivity(input: $input) {
    urbitId
    date
    active
  }
}
```

### Query Variables

You may use the following as examples for the contents of the `Query Variables` pane in GraphQL Playground for the queries requiring inputs.

#### getPKIEvents

```
{
  "input": {
    "urbitId": "~ripten",
    "since": "2021-03-24T16:40:32.000Z",
    "nodeTypes": ["PLANET"],
    "limit": 10,
    "offset": 4
  }
}
```

#### getNode

```
{
  "input": {
    "urbitId": "~ripten"
  }
}
```

#### getNodes

```
{
  "input": {
    "q": "~rip",
    "nodeTypes": ["GALAXY", "STAR"],
    "limit": 5,
    "offset": 1
  }
}
```

#### getActivity

```
{
  "input": {
    "urbitId": "~ripten",
    "since": "2021-04-16 21:08:37.053",
    "until": "2021-04-01 21:08:37.053"
  }
}
```