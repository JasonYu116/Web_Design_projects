from py4web import action, request, response
from .common import db, Field, session, T, auth
from py4web.utils.form import Form, FormStyleBulma
from py4web import action, request, response
import json

@action('index')
def index():
    from py4web import URL, redirect
    return redirect(URL('static/index.html'))



@action('api/birds', method='GET')
@action.uses(db)
def get_birds():
    birds = db(db.bird).select().as_list()
    return dict(birds=birds)

@action('api/birds', method='POST')
@action.uses(db, session)
def create_bird():
    data = request.json
    errors = {}

    name = data.get('name', '').strip()
    if not name:
        errors['name'] = "Name is required"
    elif db(db.bird.name == name).count():
        errors['name'] = "Bird with this name already exists"

    if errors:
        return dict(errors=errors)

    bird_id = db.bird.insert(
        name=name,
        habitat=data.get('habitat', ''),
        weight=float(data.get('weight') or 0),
        sightings=int(data.get('sightings') or 0)
    )
    db.commit()
    return dict(id=bird_id, errors={})


@action('api/birds/<bird_id:int>/increase_sightings', method='POST')
@action.uses(db)
def increase_sightings(bird_id):
    bird = db.bird[bird_id]
    if bird is None:
        response.status = 404
        return dict(error="Bird not found")
    bird.update_record(sightings=bird.sightings + 1)
    db.commit()
    return dict(success=True)


@action('api/birds/<bird_id:int>', method='PUT')
@action.uses(db, session)
def update_bird(bird_id):
    data = request.json
    errors = {}

    if 'weight' in data:
        try:
            weight = float(data['weight'])
            if weight < 0:
                errors['weight'] = "Weight must be non-negative"
        except ValueError:
            errors['weight'] = "Weight must be a number"

    if errors:
        return dict(errors=errors)

    updates = {}
    if 'habitat' in data:
        updates['habitat'] = data['habitat']
    if 'weight' in data:
        updates['weight'] = float(data['weight'])

    if updates:
        db(db.bird.id == bird_id).update(**updates)
        db.commit()

    return dict(updated=True, errors={})



@action('api/birds/<bird_id:int>', method='DELETE')
@action.uses(db)
def delete_bird(bird_id):
    db(db.bird.id == bird_id).delete()
    db.commit()
    return dict(success=True)

