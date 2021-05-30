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

  // TODO: write materialized view query between ticks below
  // pgm.createMaterializedView('node', 
  //   {}, 
  //   `
      
  //   `
  // )
}