# uncomment the following and add your model
from pydal.validators import *
from .common import Field, db
db.define_table(
    'bird',
    Field('name', 'string', unique=True, notnull=True),
    Field('habitat', 'string', notnull=True),
    Field('weight', 'float', notnull=True),
    Field('sightings', 'integer', default=0),
)
db.commit()
# db.commit()

