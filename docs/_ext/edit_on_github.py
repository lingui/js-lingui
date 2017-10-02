"""
Sphinx extension to add ReadTheDocs-style "Edit on GitHub" links to the
sidebar.
"""

import warnings


def html_page_context(app, pagename, templatename, context, doctree):
    if templatename != 'page.html':
        return

    if not app.config.edit_on_github_project:
        warnings.warn("edit_on_github_project not specified")
        return

    # For sphinx_rtd_theme.
    context['display_github'] = True
    context['github_user'] = app.config.edit_on_github_project.split('/')[0]
    context['github_version'] = app.config.edit_on_github_branch + '/'
    context['github_repo'] = app.config.edit_on_github_project.split('/')[1]
    context['conf_py_path'] = 'docs/'


def setup(app):
    app.add_config_value('edit_on_github_project', '', True)
    app.add_config_value('edit_on_github_branch', 'master', True)
    app.connect('html-page-context', html_page_context)
