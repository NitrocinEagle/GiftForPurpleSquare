from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
migration_tmp = Table('migration_tmp', pre_meta,
    Column('number', Integer, primary_key=True, nullable=False),
    Column('arrival_time', String),
    Column('leaving_time', String),
    Column('price', Integer),
    Column('action', String),
)

some_table_with_no_pk = Table('some_table_with_no_pk', pre_meta,
    Column('uid', Integer, primary_key=True, nullable=False),
    Column('bar', String, primary_key=True, nullable=False),
)

visitors = Table('visitors', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
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
    pre_meta.tables['migration_tmp'].drop()
    pre_meta.tables['some_table_with_no_pk'].drop()
    post_meta.tables['visitors'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['migration_tmp'].create()
    pre_meta.tables['some_table_with_no_pk'].create()
    post_meta.tables['visitors'].drop()
