Copy the environment file and make a secret key
pip install -r requirements.txt
bower install

manage.py migrate
manage.py collectstatic
