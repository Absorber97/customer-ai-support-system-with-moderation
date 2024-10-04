from .customerQuery import render as customerQuery_render
from .customerResponse import render as customerResponse_render
from .languageSelector import render as languageSelector_render

class ComponentWrapper:
    def __init__(self, render_func):
        self.render = render_func

customerQuery = ComponentWrapper(customerQuery_render)
customerResponse = ComponentWrapper(customerResponse_render)
languageSelector = ComponentWrapper(languageSelector_render)