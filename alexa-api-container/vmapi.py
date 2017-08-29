import configparser
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

__all__ = ['get_vcenter_health_status', 'vm_count', 'vm_memory_count',
           'vm_cpu_count', 'powered_on_vm_count', 'get_vm', 'get_vms', 'get_uptime', 'get_cluster',
           'get_datastore', 'get_networks']


# Disable SSL warnings
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

config = configparser.ConfigParser()
AuthConfig = configparser.ConfigParser()

def auth_vcenter_rest():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    username = config.get("vcenterConfig", "user")
    password = config.get("vcenterConfig", "password")
    print('Authenticating to vCenter REST API, user: {}'.format(username))
    resp = requests.post('{}/rest/com/vmware/cis/session'.format(url),
                         auth=(username, password), verify=False)
    authfile = open("/srv/avss/appdata/etc/auth.ini", 'w')
    AuthConfig.add_section('auth')
    AuthConfig.set('auth', 'sid', resp.json()['value'])
    AuthConfig.write(authfile)
    authfile.close()
    if resp.status_code != 200:
        print('Error! API responded with: {}'.format(resp.status_code))
        return
    return resp.json()['value']


def get_rest_api_data(req_url):
    AuthConfig.read("/srv/avss/appdata/etc/auth.ini")
    try:
        sid = AuthConfig.get("auth", "sid")
        print("Existing SID found; using cached SID")
    except:
        print("No SID loaded; aquiring new")
        auth_vcenter_rest()
        AuthConfig.read("/srv/avss/appdata/etc/auth.ini")
        sid = AuthConfig.get("auth", "sid")
    print('Requesting Page: {}'.format(req_url))
    resp = requests.get(req_url, verify=False,
                        headers={'vmware-api-session-id': sid})
    if resp.status_code != 200:
        if resp.status_code == 401:
            print("401 received; clearing stale SID")
            AuthConfig.remove_option('auth', 'sid')
            AuthConfig.remove_section('auth')
        print('Error! API responded with: {}'.format(resp.status_code))
        auth_vcenter_rest()
        get_rest_api_data(req_url)
        return
    return resp

def get_vcenter_health_status():
    print("Retreiving vCenter Server Appliance Health ...")
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    health = get_rest_api_data('{}/rest/appliance/health/system'.format(url))
    j = health.json()
    return '{}'.format(j['value'])


def vm_count():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    countarry = []
    for i in get_rest_api_data('{}/rest/vcenter/vm'.format(url)).json()['value']:
        countarry.append(i['name'])
    p = len(countarry)
    return p


def vm_memory_count():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    memcount = []
    for i in get_rest_api_data('{}/rest/vcenter/vm'.format(url)).json()['value']:
        memcount.append(i['memory_size_MiB'])
    p = sum(memcount)
    return p


def vm_cpu_count():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    cpucount = []
    for vm in get_rest_api_data('{}/rest/vcenter/vm'.format(url)).json()['value']:
        cpucount.append(vm['cpu_count'])
    sumvm = sum(cpucount)
    print(sumvm)
    return sumvm


def powered_on_vm_count():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    onCount = []
    for i in get_rest_api_data('{}/rest/vcenter/vm'.format(url)).json()['value']:
        if i['power_state'] == 'POWERED_ON':
            onCount.append(i['name'])
    p = len(onCount)
    print(p)
    return p


def get_vm(name):
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    i = get_rest_api_data('{}/rest/vcenter/vm?filter.names={}'.format(url, name))
    return i.json()['value']

def get_vms():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    i = get_rest_api_data('{}/rest/vcenter/vm'.format(url))
    return i.json()['value']


def get_uptime():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    resp = get_rest_api_data('{}/rest/appliance/system/uptime'.format(url))
    k = resp.json()
    timeSeconds = k['value']/60/60
    return int(timeSeconds)

def get_cluster():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    resp = get_rest_api_data('{}/rest/vcenter/host'.format(url))
    k = resp.json()
    return k


def get_datastore():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    resp3 = get_rest_api_data('{}/rest/vcenter/datastore'.format(url))
    dsresp = resp3.json()
    datastores = []
    for i in dsresp['value']:
        datastores.append(i['free_space'])
    return datastores

def get_networks():
    config.read("/srv/avss/appdata/etc/config.ini")
    url = config.get("vcenterConfig", "url")
    resp = get_rest_api_data('{}/rest/vcenter/network'.format(url))
    k = resp.json()
    return k['value']
