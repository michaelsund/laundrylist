var config = require('./serversettings.json');
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var options = { promiseLibrary: require('bluebird') };
var Websocket = require("ws");

var List = require('./models/list');
var User = require('./models/user');
if (config.devMode) {
  var remotedev = require('remotedev-server');
  remotedev({ hostname: 'localhost', port: 8000 });
}
console.log(config);
if (config.devMode) {
  mongoose.connect('mongodb://' + config.mongo + '/laundrylistsdev', options);
}
else {
  mongoose.connect('mongodb://' + config.mongo + '/laundrylists', options);
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = config.port;

var router = express.Router();

function verifyFacebook(token) {
  // https://graph.facebook.com/debug_token?input_token={token-to-inspect}&access_token={app_id}|{app_secret}
  return true;
};

router.post('/', function(req, res) {
  List.aggregate([
    {
      $match: {
        $or:[{'owner': req.body.id}, {'coOwners.facebookId': req.body.id}]
      }
    },
    {
      $unwind: {
        path: '$coOwners',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: 'facebookId',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'coOwners.facebookId',
        foreignField: 'facebookId',
        as: 'userlist'
      }
    },
    {
      $unwind: {
        path: '$userlist',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id:'$_id',
        name:{$first:'$name'},
        owner:{$first:'$user'},
        items:{$first:'$items'},
        uniqueItems:{$first:'$uniqueItems'},
        createdAt:{$first:'$createdAt'},
        coOwners:{$addToSet: '$coOwners'},
        coOwnersInfo:{$addToSet: '$userlist'}
      }
    },
    {
      $sort: {
        createdAt: 1
      }
    }]
    ,function(err, lists) {
      res.json(lists);
  });
});

router.post('/addcoowner', function(req, res) {
  List.findByIdAndUpdate(
    req.body.listId,
    {
      $push: {
        coOwners: {
          facebookId: req.body.facebookId,
          accepted: false
        }
      }
    },
    function(err, list) {
      if (err) {
        res.json({
          success:false
        });
      }
      else {
        User.find({facebookId: req.body.facebookId}, function(err, user) {
          res.json({
            success: true,
            user: user[0]
          });
        });
      }
    }
  );
});

router.post('/removecoowner', function(req, res) {
  List.update({'_id': req.body.listId}, {$pull: {coOwners: {'facebookId': req.body.facebookId}}}, function(err) {
    res.json({
      success: false,
    });
  });
});

router.post('/getitems', function(req, res) {
  List.findById(req.body.listId, function (err, list) {
    if (err) {
      res.json({
        success:false,
        list: {}
      });
    }
    else {
      res.json({
        success: true,
        list: list
      });
    }
  });
});

router.get('/users', function(req, res) {
  User.find({}, function (err, users) {
    if (err) {
      res.json({
        success:false,
        users: []
      });
    }
    else {
      res.json({
        success: true,
        users: users
      });
    }
  });
});

router.post('/setpicked', function(req, res) {
  List.update({'items._id': req.body.itemId}, {$set: {'items.$.picked': !req.body.picked}}, function(err) {
    res.json({success: true});
  });
});

router.post('/newlist', function(req, res) {
  console.log(req.body);
  List.create({
    name: req.body.listName,
    items: [],
    uniqueItems: [],
    createdAt: new Date(),
    owner: req.body.userId,
    coOwners: []
  }, function (err) {
    if (err) {
      res.json({status: 'failed to create list', success: false});
    }
    else {
      List.aggregate([
        {
          $match: {
            name: req.body.listName
          }
        },
        {
          $lookup: {
            from: 'users', localField: 'owner', foreignField: 'facebookId', as: 'owner'
          }
        },
        {
          $unwind: '$owner'
        }]
        ,function(err, lists) {
          console.log('newList: ' + JSON.stringify(lists));
          res.json(lists[0]);
      });
    }
  });
});

router.post('/newuser', function(req, res) {
  User.find({facebookId: req.body.id}, function(err, users) {
    if (users.length <= 0) {
      var newuser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        facebookId: req.body.id,
        pictureURL: req.body.picture,
      });
      newuser.save(function (err) {
        if (err) {
          res.json({status: 'failed to create user', success: false});
        }
        else {
          res.json({status: 'new user created', success: true});
        }
      });
    }
    else {
      res.json({status: 'user allready exists', success: false});
    }
  });
});

router.post('/clearlist', function(req, res) {
  List.find({_id: req.body.listId}, function(err, list) {
    if (err) {
      res.json({status: 'failed to find current list', success: false});
    }
    else {
      list[0].items = [];
      list[0].save(function (err) {
        res.json({status: 'list cleared', success: true});
      });
    }
  });
});

router.post('/removelist', function(req, res) {
  List.findOneAndRemove({_id : new mongoose.mongo.ObjectID(req.body.listId)}, function (err) {
    if (err) {
      res.json({status: 'failed to remove list', success: false});
    }
    else {
      res.json({status: 'list removed', success: true});
    }
  });
});

router.post('/newitem', function(req, res) {
  List.findById(req.body.listId, function (err, list) {
    if (list === null) {
      res.json({status: 'Failed to add item, no such list', success: false});
    }
    else {
      // Save the item to uniqueItems if not allready existent in list for future search or suggest.
      var found = false;
      var newItemname = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1).toLowerCase();
      newItemname = newItemname.trim();
      for(var i = 0; i < list.items.length; i++) {
        if (list.items[i].name === newItemname) {
          // allready exists
          found = true;
        }
      }
      for (var i = 0; i < list.uniqueItems.length; i++) {
          if (list.uniqueItems[i] === newItemname) {
            // allready exists
            found = true;
          }
      }

      if (!found) {
        list.uniqueItems.push(newItemname);
      }

      console.log(newItemname + ' with length of ' + newItemname.length + ' in [' + list.uniqueItems + ']');

      // Add the new item.
      list.items.push(
        {
          name: newItemname,
          picked: false,
          quantity: req.body.quantity,
        }
      );
      list.save(function(err) {
        res.json({status: 'item added', success: true, itemId: list.items[list.items.length-1]._id});
      });
    }
  });
});

router.post('/edititem', function(req, res) {
  List.update({'items._id': req.body.itemId}, {$set: {'items.$.name': req.body.name,'items.$.quantity': req.body.quantity}}, function(err) {
    res.json({success: true});
  });
});

router.post('/delitem', function(req, res) {
  List.update({'_id': req.body.listId}, {$pull: {items: {'_id': req.body.itemId}}}, function(err) {
    res.json({success: true});
  });
});

router.post('/acceptshare', function(req, res) {
  //set the coOwner accepted to true by facebookId in list
  List.update({'_id': req.body.listId, 'coOwners.facebookId': req.body.userId}, {$set: {'coOwners.$.accepted': true}}, function(err, result) {
    res.json({success: true});
  });
});

router.post('/declineshare', function(req, res) {
  //removes the coOwner from the list, essentially declining or removing the user
  List.update({'_id': req.body.listId}, {$pull: {coOwners: {'facebookId': req.body.userId}}}, function(err) {
    res.json({success: true});
  });
});

app.use('/api', router);

var server = http.createServer(app);
var wss = new Websocket.Server({server: server});

wss.on('connection', function connection(ws) {
  console.log('New connection');
  ws.on('message', function incoming(message) {
    console.log('received: ', message);
    ws.send('message recieved');
  });
  ws.on('close', function() {
    console.log('a session was disconnected');
  });
});

var listenOnAddress = '';
if (config.devMode) {
  listenOnAddress = config.dev;
}
else {
  listenOnAddress = config.prod;
}

server.listen(config.port, listenOnAddress, function listening() {
  if (config.devMode) {
    console.log('Server in Development mode on ip: ' + listenOnAddress + ':' + config.port);
  }
  else {
    console.log('Server in Production mode on ip: ' + listenOnAddress + ':' + config.port);
  }
});
