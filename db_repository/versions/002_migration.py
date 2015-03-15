from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
n_umbers = Table('n_umbers', pre_meta,
    Column('number', Integer, primary_key=True, nullable=False),
)

numbers = Table('numbers', post_meta,
    Column('number', Integer, primary_key=True, nullable=False),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['n_umbers'].drop()
    post_meta.tables['numbers'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['n_umbers'].create()
    post_meta.tables['numbers'].drop()
