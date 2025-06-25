from pydal.validators import *
from .common import Field, db
db.define_table(
    'bird',
    Field('name', 'string', unique=True, notnull=True),
    Field('habitat', 'string', notnull=True, default=""),
    Field('weight', 'float', notnull=True, default=0),
    Field('sightings', 'integer', default=0),
)
db.commit()