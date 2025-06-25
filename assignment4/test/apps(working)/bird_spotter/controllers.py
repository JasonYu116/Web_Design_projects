from py4web import action, request, response

@action('index')
def index():
    from py4web import URL, redirect
    return redirect(URL('static/index.html'))
