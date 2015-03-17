from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
visitors = Table('visitors', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('number', Integer, primary_key=True, nullable=False),
    Column('action', String(length=64), default=ColumnDefault('just guest')),
    Column('arrival_time', Integer, default=ColumnDefault(0)),
    Column('leaving_time', Integer, default=ColumnDefault(0)),
    Column('price', Float, default=ColumnDefault(0)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['visitors'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['visitors'].drop()
