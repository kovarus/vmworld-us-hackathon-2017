import time
import json
from flask import Flask
from flask_ask import Ask, question, statement


import vralib


username = ""
password = ""
cloudurl = ""
tenant = ""

app = Flask(__name__)
ask = Ask(app, "/hackathon")

@app.route('/collect_res_info')
def collect_res_info():
    session = vralib.Session(username, password, cloudurl, tenant, ssl_verify=False)
    return session.get_reservations_info()




if __name__ == '__main__':
    app.run(debug=True)
