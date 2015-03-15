from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
groups__servers = Table('groups__servers', pre_meta,
    Column('group_ID', String, primary_key=True, nullable=False),
    Column('server_ID', String, primary_key=True, nullable=False),
)

actions = Table('actions', post_meta,
    Column('action', String(length=64), primary_key=True, nullable=False),
)

visitors = Table('visitors', pre_meta,
    Column('number', Integer, primary_key=True, nullable=False),
    Column('arrival_time', String),
    Column('leaving_time', String),
    Column('event', String),
    Column('price', Integer),
)

visitors = Table('visitors', post_meta,
    Column('number', Integer, primary_key=True, nullable=False),
    Column('arrival_time', String(length=20)),
    Column('leaving_time', String(length=20)),
    Column('action', String(length=64)),
    Column('price', Integer),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['groups__servers'].drop()
    post_meta.tables['actions'].create()
    pre_meta.tables['visitors'].columns['event'].drop()
    post_meta.tables['visitors'].columns['action'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['groups__servers'].create()
    post_meta.tables['actions'].drop()
    pre_meta.tables['visitors'].columns['event'].create()
    post_meta.tables['visitors'].columns['action'].drop()
