import os

import jinja2

import aiohttp_jinja2
from aiohttp import web
from views import index

BASE_DIR = os.path.abspath(__file__)
STATIC_URL = os.path.join(os.path.dirname(BASE_DIR), 'static')


async def init_app():
    app = web.Application()

    app['websockets'] = {}

    app.on_shutdown.append(shutdown)

    aiohttp_jinja2.setup(
        app, loader=jinja2.FileSystemLoader('templates'))

    setup_static_routes(app)

    app.router.add_get('/', index)
    return app


def setup_static_routes(app):
    app['static_root_url'] = '/static'
    app.router.add_static('/static/', path=STATIC_URL, name='static')


async def shutdown(app):
    for ws in app['websockets'].values():
        await ws.close()
    app['websockets'].clear()


def main():
    app = init_app()
    web.run_app(app, port=29006)


if __name__ == '__main__':
    main()
