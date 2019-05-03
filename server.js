// Module
const print = console.log
const Ddos = require('ddos');
const express = require('express');
const fs = require('fs')
const bodyParser = require('body-parser')
const amodes = require('./modes');
const conf = require('./server.properties');
// install ddos, express, body-parser, nodemailer !


/////////////////////////////////////////////////////////////

//colors
var  Reset = "\x1b[0m"
var  Bright = "\x1b[1m"
var  Dim = "\x1b[2m"
var  Underscore = "\x1b[4m"
var  Blink = "\x1b[5m"
var  Reverse = "\x1b[7m"
var  Hidden = "\x1b[8m"
//Foreground
var  FgBlack = "\x1b[30m"
var  FgRed = "\x1b[31m"
var  FgGreen = "\x1b[32m"
var  FgYellow = "\x1b[33m"
var  FgBlue = "\x1b[34m"
var  FgMagenta = "\x1b[35m"
var  FgCyan = "\x1b[36m"
var  FgWhite = "\x1b[37m"
//Background
var  BgBlack = "\x1b[40m"
var  BgRed = "\x1b[41m"
var  BgGreen = "\x1b[42m"
var  BgYellow = "\x1b[43m"
var  BgBlue = "\x1b[44m"
var  BgMagenta = "\x1b[45m"
var  BgCyan = "\x1b[46m"
var  BgWhite = "\x1b[47m"

/////////////////////////////////////////////////////////////

//anti ddos
var ddos = new Ddos({burst:10, limit:20,errormessage: conf.errormessage})
var running = false;
// Server Config
var args = process.argv.slice(2);
port = args[0] // First argument have to be the port
if(port == undefined){ // default port is 80
  port = 80
}

// api = Server(express)
var api = express();
api.use(express.static('public'));
api.use(ddos.express);
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// api route
api.post('/api/', function (req, res) {
  res.header("cors", "*")
  callapi = req.query.api;

  if(callapi == "user"){ // read user data
    if(req.body.m == "r"){ // http://127.0.0.1/api/?api=user&m=r
      var name = req.body.name;
      if(fsize("data/user/"+name+".json")  > 0 ){
        res.header("content-type","application/json")
        res.send(JSON.parse(JSON.stringify(fs.readFileSync("data/user/"+name+".json", 'utf8'))))
      }else{
        res.send('{"error":true}')
      }
    }else if(req.body.m == "u"){
      
    }else if(req.body.m == "c"){ // create user data
      var data = {};
      data.error = false; // just for the client to see it have data
      data.name = req.body.name;
      data.friends = [];
      data.icon = req.body.bu+"images/default/pb.png";
      data.rank = "Bronze";
      data.lp = 0;
      data.devision = 5;
      data.honor = 2;
      data.level = 1;
      data.xp = 0;
      data.rp = 0;
      data.oe = 0;
      data.be = 0;
      data.loot = {};
      data.last_seen = new Date;
      if(fsize("data/user/"+data.name+".json") <= 0){
        fs.writeFile("data/user/"+data.name+".json", JSON.stringify(data), (err) => {
          if (err) throw err;
        });

        res.sendStatus(200)
      }else{
        res.send('{"error":419,"text":"Failed to create Game-user"}')
      }
    }
  }else if (callapi == undefined) {
    res.send("<h1 style='color:red;text-align:center;'>No Api is Called</h1>")
  }else if(callapi == "cc") {
    var logins = filetojson("data/login.zerosql");
    var valid = false;
    for(user in logins['response']){
      if(req.body.name == logins['response'][user]['name'] && req.body.id == logins['response'][user]['id']){
        console.log("Valid Cookie")
        res.send('{"error":false}')
        valid = true
        break;
      }
    }
    if(valid != true){
      res.send('{"error":true}')
    }

  } else if (callapi == "login") {

    if (req.body.name != undefined && req.body.password != undefined) {
      var rname = false
      user = filetojson("data/user.zerosql");
      for (data in user['response']) {
        if (req.body.name.toLowerCase() == user['response'][data]['name'].toLowerCase()) {
          rname = true
          if (req.body.password == user['response'][data]['password']) {
            console.log("===================================================")
            console.log(FgGreen + "Logged in as " + user['response'][data]['name'] + Reset)
            id = makeid(50)
            res.send('{"Status":200,"id":"' + id + '"}')
            logins = filetojson("data/login.zerosql");
            if (logins != "{\"response\":[]}") {
              for (ldata in logins['response']) {
                var ow = false;
                if (logins['response'][ldata]['name'] == user['response'][data]['name']) {
                  logins['response'][ldata]['id'] = id;
                  ow = true
                  break;
                }
              }
              if(ow == true) {
                let data = JSON.stringify(logins['response']).replace("[","").replace("]","")
                data = JSON.parse(data)
                owrite("data/login.zerosql",data)
              }else{
                ldata = {}
                ldata.name = user['response'][data]['name'];
                ldata.id = id;
                write("data/login.zerosql", ldata);
              }
            } else {
              ldata = {}
              ldata.name = user['response'][data]['name'];
              ldata.id = id;
              write("data/login.zerosql", ldata);
            }
          } else {
            console.log("===================================================")
            console.log("Wrong password!");
            res.send('{"error":401,"text":"Wrong Password"}')
          }
        }
      }
      if (rname != true) {
        console.log("===================================================")
        console.log("User doesnt Exist");
        res.send('{"error":401,"text":"User doesnt exist"}')
      }
    } else {
      console.log(FgRed + "===================================================")
      console.log("Invalid Login Try!" + Reset)
      res.sendStatus(500)
    }
  }else if (callapi == "reg") {                   // http://127.0.0.1/api/?api=reg
      if (req.body.name != undefined && req.body.pw != undefined) { // http://127.0.0.1/api/?api=reg&name=<name>&pw=<password>
        data = {}
        // we need a username and password
        data.name = req.body.name;
        data.password = req.body.pw;

        // test if name already existing
        var existing = JSON.parse("{\"response\":[" +fs.readFileSync("data/user.zerosql", 'utf8')+"]}");
        
        if(existing['response'][0] != undefined){
          var exist = false;
          for(user in existing['response']){
            if(req.body.name.toLowerCase() == existing['response'][user]['name'].toLowerCase()){
              exist = true;
            }
          }
          if(exist == true){
            console.log(FgRed +"===================================================")
            console.log(existing['response'][user]['name']+" already Exists!"+Reset)
            res.send('{"error":418,"text":"'+existing['response'][user]['name']+' already exist"}')
          }else{
            console.log("===================================================")
            console.log("New User!")
            write("data/user.zerosql", data)
            res.sendStatus(200)
          }
        }else{
          write('data/user.zerosql', data);
          res.sendStatus(200)
        }

                                                  // http://127.0.0.1/api/?api=reg&mtd=w&data=some text
      } else {
        res.send("Data is not defind")          // Error if required data is not defined
      }
 
  } else {                                     // undefind api
    res.send("Api!: " + callapi)
  }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
api.get('/queue/', function(req,res){
  res.header("content-type","application/json")
  res.header("X-Powered-By","ZeroTwo#5019")
  res.header("Message","Hello World ;D")
  res.send(JSON.stringify(amodes.amodes));
});

api.post('/queue/', function(req, res){
  if( running == 0){
    running = 1;
      if(req.body.type == "join"){
        var mode = req.body.mode;
        var name = req.body.name;
        if(mode == "normal"){
          if(fsize("queues/normal.json") > 0){
            fs.readFile("queues/normal.json", "UTF8", function (err, data) {
              if (err) { throw err };
              data = JSON.parse(data);
              // find queue with place for user
              var i = 0;
              var found = false;
              for(item in data){
                if(data[i].user < 10){
                  found = true
                  queue = data[i];
                  data[i].user = parseInt(data[i].user + 1)
                  
                  if(fsize(queue.index+".json") > 0){
                    fs.readFile(queue.index+".json", "UTF8", function (err, queue_d) {
                      if (err) { throw err };
                      queue_d = JSON.parse(queue_d);
                      queue_d.push('{"name":"'+name+'","id":'+queue.user+'}');
                      owrite("queues/"+queue.index+".json",queue_d)
                    });
                  }else{
                    owrite("queues/"+queue.index+".json","[\"{\"name\":\""+name+"\",\"id\":1}\"]")
                  }
                  res.send('{"queue":'+queue.index+',"user":'+queue.user+'}')
                  break;
                  console.log(colors.FgRed+colors.BgWhite+"if u see this ure fucked up!"+colors.Reset)
                }
                i++;
              }
              if(found == false){
                data[i+1] = {}
                data[i+1].index = i+1;
                data[i+1].user = 1;
                res.send('{"queue":'+data[i+1].index+',"user":'+data[i+1].user+'}')
                owrite("queues/"+i+1+",json",'["{"name":"'+name+'","id":1}"]')
              }
              console.log(JSON.stringify(data))
              data = JSON.parse(JSON.stringify(data).replace("null,",""))
              owrite("queues/normal.json",data);
              
              setTimeout(() => {
                running = 0;
              }, 1000);
            });
        }else{
          data = []
          data[0] = {}
          data[0].index = 1;
          data[0].user = 1;
          owrite("queues/index.json", data)
          res.send('{"queue":'+data[0].index+',"user":'+data[0].user+'}')
          setTimeout(() => {
            running = 0;
          }, 1000);
        }
      }
    }
  }else{
    res.header("Retry-After","2")
    res.sendStatus(429)
  }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

api.get('/api/', function(req ,res){
  res.send("No Valid api Path / call")
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Actually Start the Server
var server = api.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(FgGreen +"===================================================")
  console.log("Server listening at http://%s:%s", host, port);
  console.log("Server is now online and ready to use!"+Reset)
  console.log("===================================================")
  console.log("//////////////////////////////////////////")
  console.log("// Good Luck Have Fun from "+FgRed+"ZéroTwó"+Reset+" :P   //")
  console.log("//////////////////////////////////////////")
  print(amodes.amodes)
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// some own Modules
function write(file, data) {
  if (fsize(file) > 0) {
    fs.appendFile(file, "," + JSON.stringify(data) + "\n", (err) => {
      if (err) throw err;
      console.log("===================================================")
      console.log('Added Data');
    });
  } else {
    fs.writeFile(file, JSON.stringify(data) + "\n", (err) => {
      if (err) throw err;
      console.log("===================================================")
      console.log('Created Data');
    });
  }
}
function owrite(file, data){
  fs.writeFile(file, JSON.stringify(data) + "\n", (err) => {
    if (err) throw err;
  });
}
function fsize(filename) {
  if (fs.existsSync(filename)) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
  } else {
    return 0
  }
}

function filetojson(filename){
  if(fsize(filename) > 0 ){  
    return JSON.parse("{\"response\":[" +fs.readFileSync(filename, 'utf8')+"]}");
  }else{
    return "{\"response\":[]}"
  }
}

function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/\@.,:#+°~<>";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}