# """
# This file defines the database models
# """

# from pydal.validators import *

# from .common import Field, db

# ### Define your table below
# #
# # db.define_table('thing', Field('name'))
# #
# ## always commit your models to avoid problems later
# #
# # db.commit()
# #
from .common import db, Field, auth
from pydal.validators import IS_NOT_EMPTY

# Table for posts
db.define_table(
    "post_item",
    Field("content", "text", requires=IS_NOT_EMPTY()),
    auth.signature,  # adds created_on, created_by, etc.
)

# Table for tags (e.g. technology, news)
db.define_table(
    "tag_item",
    Field("name", "string"),
    Field("post_item_id", "reference post_item"),
)

db.commit()


