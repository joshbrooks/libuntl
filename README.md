{% if False %}

# DjangoTemplate

Catalpa International's template for Django projects

We create django projects by running `django-admin startproject project_name`.
This creates an empty django project, with a settings module, urls module and uwsgi module

We can also create django projects using a template `django-admin startproject project_name --template={this_repository}`

# How to start a new project

## Intro
While we don't start new projects _that_ frequently. It does happen from time to time, even just to play with some new libraries or test out some ideas.

It is important that we all can start from the same stack and it is nice not to have to do the drudgery of setting up boilerplate code every time. 

So we can use Django's project templates to help us out.

## Why use this project template?

Because you don't want to waste time and setup the following things yourself:

- Internationalization
- Login and Logout
- `local_settings` override
- App with functioning Model, view, and REST API
- ... and much much more!

## Getting it done

So let us get started. Here we are going to assume python 3.x, npm, and bower are installed.  If not, please get those up and running. 

First we need to make a working directory. For our examples we'll use `coffee_break`

    mkdir coffee_break
    cd coffee_break

From there, we make our virtual environment `env` and activate it.

    python3 -m venv env
    source env/bin/activate

Now let us install Django for our JavaScript

    pip install Django

... and now for the good stuff.  We create a new project using our project template, saving us an hour of setup.

    django-admin startproject coffee_break --template=https://github.com/catalpainternational/DjangoTemplate/zipball/master -n=README.md

We're almost done, we just need to install our requirements and setup our database

    cd coffee_break
    bower install
    pip install -r requirements.txt
    python manage.py migrate
    python createsuperuser

Finally, lets run our server!

    python manage.py runserver

{% endif %}

# The {{ project_name|title }} Project

## About {{ project_name|title }}

## Describe {{ project_name|title }} here.

## Prerequisites

    Python 3.5 recommended
    pip
    virtualenv (virtualenvwrapper is recommended for use during development)

## Installation

    bower install
    pip install -r requirements.txt
    python manage.py migrate
    python createsuperuser

## Fill out with installation instructions for {{ project_name|title }}.

