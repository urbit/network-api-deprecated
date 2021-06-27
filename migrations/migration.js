exports.up = pgm => {
  pgm.createType('status_names', ['locked', 'unlocked', 'spawned', 'activated', 'online'])
  pgm.createType('node_type', ['galaxy', 'star', 'planet', 'moon', 'comet'])
  pgm.createType('event_names', 
    [
      'change_ownership', 
      'change_spawn_proxy',
      'change_transfer_proxy',
      'change_management_proxy',
      'change_voting_proxy',
      'activate',
      'spawn',
      'escape_requested',
      'escape_cancelled',
      'escape_accepted',
      'lost_sponsor',
      'broke_continuity'
    ])

  pgm.createTable('pki_events', {
    event_id: {
      type: 'serial',
      notNull: true
    },
    node_id: {
      type: 'varchar',
      notNull: true
    },
    event_type_id: {
      type: 'int',
      notNull: true
    },
    time: {
      type: 'timestamp',
      notNull: true
    },
    sponsor_id: {
      type: 'varchar'
    },
    address: {
      type: 'varchar'
    },
    continuity_number: {
      type: 'int'
    },
    revision_number: {
      type: 'int'
    }
  })

  pgm.createTable('raw_events', {
    date: {
      type: 'varchar'
    },
    point: {
      type: 'varchar'
    },
    event: {
      type: 'varchar'
    },
    field1: {
      type: 'varchar'
    },
    field2: {
      type: 'varchar'
    },
    field3: {
      type: 'varchar'
    }
  })

  pgm.createTable('radar', {
    ship_name: {
      type: 'varchar'
    },
    ping: {
      type: 'varchar'
    },
    result: {
      type: 'varchar'
    },
    response: {
      type: 'varchar'
    }
  })

  pgm.createTable('ping', {
    ping_id: {
      type: 'bigserial',
      notNull: true
    },
    node_id: {
      type: 'varchar',
      notNull: true
    },
    online: {
      type: 'boolean',
      notNull: true
    },
    ping_time: {
      type: 'timestamp'
    },
    response_time: {
      type: 'timestamp'
    }
  })

  pgm.createTable('node_status', {
    node_status_id: {
      type: 'serial',
      notNull: true
    },
    status_name: {
      type: 'varchar',
      notNull: true
    }
  })

  pgm.createTable('event_type', {
    event_type_id: {
      type: 'serial',
      notNull: true
    },
    event_name: {
      type: 'varchar',
      notNull: true
    }
  })

  pgm.createMaterializedView('node', 
    {}, 
    `
    WITH ships AS (
      SELECT DISTINCT ON (node_id)
        node_id
      FROM
        pki_events
    ),
    sponsors AS (
      SELECT DISTINCT ON (node_id)
        node_id,
        sponsor_id
      FROM
        pki_events
      ORDER BY
        node_id,
        TIME DESC
    ),
      num_owners AS (
        SELECT
          node_id,
          count(*) AS num_owners
        FROM
          pki_events
        WHERE
          event_type_id = 1
        GROUP BY
          node_id
      ),
      activated AS (
        SELECT
          node_id,
          time AS activated_on
        FROM
          pki_events
        WHERE
          event_type_id = '6' -- activate
      ),
      spawned AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          time AS spawned_on
        FROM
          pki_events
        WHERE
          event_type_id = '7' -- spawn
        ORDER BY
          node_id,
          time DESC
      ),
      continuity AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          continuity_number
        FROM
          pki_events
        ORDER BY
          node_id,
          time DESC
      ),
      revision AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          revision_number
        FROM
          pki_events
        ORDER BY
          node_id,
          time DESC
      ),
      ownership_proxy AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          address AS ownership_proxy
        FROM
          pki_events
        WHERE
          event_type_id = '1' -- change_ownership
        ORDER BY
          node_id,
          time DESC
      ),
      spawn_proxy AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          address as spawn_proxy
        FROM
          pki_events
        WHERE
          event_type_id = '2' -- change_spawn_proxy 
        ORDER BY
          node_id,
          time DESC
      ),
      transfer_proxy AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          address as transfer_proxy
        FROM
          pki_events
        WHERE
          event_type_id = '3' -- change_transfer_proxy 
        ORDER BY
          node_id,
          time DESC
      ),
      management_proxy AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          address as management_proxy
        FROM
          pki_events
        WHERE
          event_type_id = '4' -- change_management_proxy 
        ORDER BY
          node_id,
          time DESC
      ),
      voting_proxy AS (
        SELECT DISTINCT ON (node_id)
          node_id,
          address as voting_proxy
        FROM
          pki_events
        WHERE
          event_type_id = '5' -- change_voting_proxy 
        ORDER BY
          node_id,
          time DESC
      ),
      is_online AS (
        SELECT
          ship_name AS node_id,
          count(*) AS num_pings
        FROM
          radar
        GROUP BY
          ship_name
      ),
      locked AS (
        SELECT
          node_id,
          count(*) AS num_locked
        FROM
          pki_events
        WHERE
          address = '0x86cd9cd0992f04231751e3761de45cecea5d1801'
          OR address = '0x8c241098c3d3498fe1261421633fd57986d74aea'
        GROUP BY
          node_id
      ),
      node_without_kids AS (
        SELECT
          ships.node_id node_id,
          sponsor_id,
          (
          	CASE WHEN num_owners IS NULL
          	 then 1
          	ELSE num_owners
          	END
          ) as num_owners,
          activated_on,
          spawned_on,
          continuity_number,
          revision_number,
          ownership_proxy,
          spawn_proxy,
          transfer_proxy,
          management_proxy,
          voting_proxy,
          (
            CASE WHEN is_online.num_pings IS NOT NULL
              AND is_online.num_pings > 0 THEN
              'ONLINE' -- node status id 5
            WHEN locked.num_locked IS NOT NULL
              AND locked.num_locked > 0 THEN
              'LOCKED' -- node status id 1
            ELSE
              'UNLOCKED' -- node status id 1
            END) AS status
        FROM
          ships AS ships
        LEFT JOIN sponsors ON ships.node_id = sponsors.node_id
        LEFT JOIN num_owners ON ships.node_id = num_owners.node_id
        LEFT JOIN activated ON ships.node_id = activated.node_id
        LEFT JOIN spawned ON ships.node_id = spawned.node_id
        LEFT JOIN continuity ON ships.node_id = continuity.node_id
        LEFT JOIN revision ON ships.node_id = revision.node_id
        LEFT JOIN ownership_proxy ON ships.node_id = ownership_proxy.node_id
        LEFT JOIN spawn_proxy ON ships.node_id = spawn_proxy.node_id
        LEFT JOIN transfer_proxy ON ships.node_id = transfer_proxy.node_id
        LEFT JOIN management_proxy ON ships.node_id = management_proxy.node_id
        LEFT JOIN voting_proxy ON ships.node_id = voting_proxy.node_id
        LEFT JOIN is_online ON ships.node_id = is_online.node_id
        LEFT JOIN locked ON ships.node_id = locked.node_id
      ),
      node AS (
      	select node_without_kids.*,
          array_agg(node_id) over (partition by sponsor_id) as kids
      from node_without_kids
      )
      SELECT
        *
      FROM
        node;
    `
  )
}