from py4web.utils.form import Form, FormStyleBulma
import json
from py4web import action, request, response
from .models import auth, db
from .common import session
import re
from py4web.utils.url_signer import URLSigner

@action("index")
@action.uses("index.html", db, auth.user)
def index():
    # return dict(user=auth.user)
    return {}

url_signer = URLSigner(session)

@action("api/posts", method=["POST"])
@action.uses(db, auth.user)
def create_post():
    content = request.json.get("content")
    post_id = db.post_item.insert(content=content, created_by=auth.user_id)
    
    # Extract hashtags
    tags = re.findall(r"#(\w+)", content)
    for tag in tags:
        db.tag_item.insert(name=tag, post_item_id=post_id)
    
    return dict(id=post_id)

@action("api/posts", method=["GET"])
@action.uses(db, auth.user)
def get_posts():
    tag_filter = request.params.get("tags")
    posts = []
    
    if tag_filter:
        tags = tag_filter.split(",")
        rows = db(
            (db.tag_item.name.belongs(tags)) &
            (db.tag_item.post_item_id == db.post_item.id)
        ).select(orderby=~db.post_item.id)
        seen = set()
        for row in rows:
            if row.post_item.id not in seen:
                posts.append(dict(id=row.post_item.id, content=row.post_item.content))
                seen.add(row.post_item.id)
    else:
        rows = db(db.post_item).select(orderby=~db.post_item.id)
        posts = [dict(id=row.id, content=row.content) for row in rows]

    return dict(posts=posts)

@action("api/tags", method=["GET"])
@action.uses(db, auth.user)
def get_tags():
    rows = db().select(db.tag_item.name, distinct=True)
    tag_names = sorted(set(row.name for row in rows))
    return dict(tags=tag_names)

@action("api/posts/<post_id:int>", method=["DELETE"])
@action.uses(db, auth.user)
def delete_post(post_id):
    db(db.tag_item.post_item_id == post_id).delete()
    db(db.post_item.id == post_id).delete()
    return dict(success=True)





