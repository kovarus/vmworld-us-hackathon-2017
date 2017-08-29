from flask import Flask, render_template, redirect, request, url_for, jsonify, session
from vmapi import *
from vraapi import vra_build
from nsxapi import validateNSX, createNsxWire
import json
import vralib

app = Flask(__name__)
app.secret_key = "super secret key"

url = "hlcoud.humblelab.com"
username = "codyde@vsphere.local"
password = "VMware123!"
tenant = "vsphere.local"

@app.route('/api/rest/vcenter/vms')
def getvms():
    p = get_vms()
    return jsonify(p)

@app.route('/api/rest/vcenter/datastore')
def getdatastore():
    p = get_datatore()
    return jsonify(p)

@app.route('/api/rest/vcenter/clusters')
def getclusters():
    p = get_cluster()
    return jsonify(p)

@app.route('/api/rest/vcenter/build/centos')
def buildcentos(url,username,tenant,password):
    b = vralib.Session.login(username=username,password=password,cloudurl=url,tenant=tenant,ssl_verify=False)
    cid = "0c038bc1-65b6-44ac-9a2f-df39ec587c66"
    template = b.get_request_template_url(catalogitem=cid)
    return b.request_item(catalogitem=cid,payload=template)


@app.route('/api/rest/vcenter/build/windows')
def buildwindows(url,username,tenant,password):
    b = vralib.Session.login(username=username,password=password,cloudurl=url,tenant=tenant,ssl_verify=False)
    cid = "2b24f55c-261a-468a-89be-b90133019ba3"
    template = b.get_request_template_url(catalogitem=cid)
    return b.request_item(catalogitem=cid,payload=template)