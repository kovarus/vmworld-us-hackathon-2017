from flask import Flask, render_template, redirect, request, url_for, jsonify, session
from vmapi import *
from vraapi import vra_build
from nsxapi import validateNSX, createNsxWire
import json

app = Flask(__name__)
app.secret_key = "super secret key"


@app.route('/api/rest/vcenter/vms')
def getvms():
    p = get_vms()
    return jsonify(p)
