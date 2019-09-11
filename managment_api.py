from json import dumps
from urllib.parse import unquote
import os
import sys 

# install modules if missing!
install = []
try: from tinydb import TinyDB, Query
except: install.append("TinyDB")

try: from flask import Flask, abort, request
except: install.append("flask")

try: from flask_restful import Resource, Api
except: install.append("flask_restful")

try: from flask_jsonpify import jsonify
except: install.append("flask_jsonpify")

try: from colorama import Fore, init
except: install.append("colorama")

if install:
    to_install = " ".join(install)
    os.system(sys.executable + " -m pip install " + to_install)
    raise Exception("Python modules ({to_install}) installed. Start script again.")


import uuid
import json
import os
import string
import random
import urllib.request, json 

init()

query = Query()

################## Functions ######################################
def warn(text):
    print("["+Fore.YELLOW+"WARN"+Fore.RESET+"] "+str(text))

def error(text):
    print("["+Fore.RED+"ERROR"+Fore.RESET+"] "+str(text))
    
def done_task(text):
    print("["+Fore.GREEN+"DONE"+Fore.RESET+"] "+str(text))

def info(text):
    print("["+Fore.WHITE+"INFO"+Fore.RESET+"] "+str(text))

def gen_id(size = 32, chars=string.digits): #+ string.punctuation
    return ''.join(random.choice(chars) for _ in range(size))
################## END LOGGING ###################################


if not os.path.exists("data"):
    os.makedirs("data")
    done_task("Created data/")

udb = TinyDB('data/user.json')
apidb = TinyDB('data/api_keys.json') #maybe i use api keys later to prevent connections from not client applications
qdb = TinyDB('data/qdb.json') # to save the queues
fdb = TinyDB('data/find.json') # to find a queue
mdb = TinyDB('data/Modes.json') # Define The Modes u Want to use In the Client


# idea:
# 5v5 Blind Pick: 100000001
# 5V5 Draft Pick: 100000010
# 5V5 Flex      : 100000011
# 5V5 Solo / Duo: 100000100
#
# 3V3 Normal    : 100000101
# 3V3 Ranked    : 100000111
#
# 5V5 Aram      : 100001000
#  
# Made Space for more so new modes can be added
# ===> 
if str(mdb.search(query.filled == True)) == "[]":
    mdb.purge() # Safety Purge in case just the "filled" got removed
    mdb.insert({"filled":True}) # for simple filled test :3
    
    # The Modes Themselfs
    mdb.insert({"id":100000001 , "name": "5v5 Blind Pick"})
    mdb.insert({"id":100000010 , "name": "5V5 Draft Pick"})
    mdb.insert({"id":100000011 , "name": "5V5 Flex"})
    mdb.insert({"id":100000100 , "name": "5V5 Solo / Duo"})

    mdb.insert({"id":100000101 , "name": "3V3 Normal"})
    mdb.insert({"id":100000111 , "name": "3V3 Ranked"})
   
    mdb.insert({"id":100001000 , "name": "5V5 Aram"})

# this is here cuz i need the databases ready when i come to this.
####################### QUEUE HANDLINE #######################

def joinq(uid,qid):
    joined = qdb.search(query.id == qid)

    done_task(str(joined))



##############################################################
##############################################################
##############################################################




app = Flask(__name__)
api = Api(app)

@app.after_request
def apply_caching(response):
    response.headers["server"] = "League of Sandbox handler v3.0"
    return response


class login(Resource):
    def post(self):
        loginData = unquote(unquote(str(request.data).replace("b'{","{").replace("}'","}")))

        loginData = json.loads(loginData)
        done_task("Got Login Request")

        res = {"error":False,"key": str(uuid.uuid4() )}
        
        warn("sending "+str(res))
        return res
        
        # if loginData['name'] and loginData['passwort']:

        #     done_task("Handling login request of: "+loginData['name'])
        #     if str(udb.search(query.name == loginData['name'])) == "[]":
        #         return {"error":True,"msg":"Cannot find user."}
        #     else:
        #         info(str(udb.search(query.name == loginData['name'])))
        #         return {"error":False,"key": str(uuid.uuid4() )}
        # else:
        #     return {"error":True,"msg":"Missing Fields"}



class get_modes(Resource):
    def get(self):
        return mdb.search(query.id > 0)

class find(Resource):
    def get(self,mid,uid):
        if str(udb.search(query.id == uid)) == "[]":
            return {"error":True,"msg":"Cant find that user."}
        else:
            if str(qdb.search(query.mode == mid)) != "[]": #there open queues (remember to remove full queues to save some space and id's)
                
                qid = qdb.search(query.mode == mid)[0]['id'] # get the id of the queue

                joinq(uid,qid)

class capi_key(Resource):
    def get(self,admin_key):
        return {"message":"Test not set."}
    def post(self,admin_key):
        return {"error":True,"msg":"Permission Denied!"}

api.add_resource(login, '/api/login/') # login user

api.add_resource(find, '/queue/join/<mid>/<uid>/') #mid == Modus id #uid == User id # removed qid to make autojoin into a free one (less data handling is needed.)
api.add_resource(get_modes, '/modes/query/') # get all modes for displaying in the client


if __name__ == '__main__':
    app.run(port='443',debug=False)