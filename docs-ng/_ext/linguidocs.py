from docutils import nodes
from sphinx.locale import l_
from sphinx.util.docfields import TypedField


class react_component(nodes.Inline, nodes.TextElement):
    pass


def visit_react_component_html(self, node):
    self.body.append('&lt;')


def depart_react_component_html(self, node):
    self.body.append('&gt;')


def setup(app):
    app.add_object_type(
        directivename='component',
        rolename='component',
        indextemplate="pair: %s; component",
        ref_nodeclass=react_component,
        objname='Component',
        doc_field_types=[
            TypedField('props', label=l_('Props'),
                       names=('prop',),
                       typerolename='component',
                       typenames=('proptype', 'type')),
        ]
    )
    app.add_node(react_component,
                 html=(visit_react_component_html, depart_react_component_html))
    app.add_crossref_type('config', 'conf')
