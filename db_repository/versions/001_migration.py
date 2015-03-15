from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
servers = Table('servers', pre_meta,
    Column('server_ID', String, primary_key=True, nullable=False),
    Column('servername', String),
    Column('OS', String),
    Column('IPv4_address', String),
    Column('location', String),
)

n_umbers = Table('n_umbers', post_meta,
    Column('number', Integer, primary_key=True, nullable=False),
)

today_visitors = Table('today_visitors', post_meta,
    Column('number', Integer, primary_key=True, nullable=False),
    Column('arrival_time', String(length=8)),
)

visitors = Table('visitors', post_meta,
    Column('number', Integer, primary_key=True, nullable=False),
    Column('arrival_time', String(length=8)),
    Column('leaving_time', String(length=8)),
    Column('event', String(length=64)),
    Column('price', Integer),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['servers'].drop()
    post_meta.tables['n_umbers'].create()
    post_meta.tables['today_visitors'].create()
    post_meta.tables['visitors'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['servers'].create()
    post_meta.tables['n_umbers'].drop()
    post_meta.tables['today_visitors'].drop()
    post_meta.tables['visitors'].drop()
