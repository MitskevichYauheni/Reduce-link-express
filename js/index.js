var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var User = require('./models/user');
var Link = require('./models/reduceLink');



mongoose.connect('mongodb://localhost:27017/reduce-link')

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//app.use('Access-Control-Allow-Origin':'*');
//app.use("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});*/

function str_rand(){
    var text = "";
    var possible = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//var activeUser = 'Zhenya';
//var activeUser = 'test';
var activeUser = '';


app.post('/', function(req, res){
  console.log("User " + req.body.name + '\n');
  //console.log("pass " + req.body.password + '\n');
  User.findOne({ name: req.body.name }, function(err, user){
    if(user){
      if(user.password == req.body.password){
          activeUser = req.body.name;
          console.log('/ ' + activeUser);
          res.status(200).json({password: true});
      } else{
          res.status(200).json({password: false});
      }
    } else {
      User.create({ name: req.body.name, password: req.body.password }, function(err, user) {
        if(err){
          console.log(err);
        } else {
          activeUser = req.body.name;
          res.status(200).json({password: true});
        }
      })
    }
  })
})

app.get('/', function(req, res){
  User.find({}, function(err, users) {
    if(err){
      console.log(err);
    } else {
      res.send(users);
      /*users.map(function(user){
        res.write(user.name + '\n');
        res.write(user.password + '\n');
      })*/
      res.end();
    }
  })
})

app.post('/all-links-users', function(req, res){
  console.log('all-links-users');
  Link.find({}, function(err, links) {
    if(err){
      console.log(err);
    } else {
      //console.log(links);
      res.status(200).json({allLinks: links});
    }
  })
})

app.post('/user-info', function(req, res){
  if(activeUser !== ''){
    var goLinks = 0;
    User.findOne({ name: activeUser }).populate('links').exec(function(err, user){
      if(err){
        console.log(err);
      } else {
        user.links.map(function(link){
          goLinks += link.click;
        })
        console.log('user-info');
        res.status(200).json({user: activeUser, amountLinks: user.links.length, goLinks: goLinks})
      }
    })
  } else {
    res.status(200).json({user: activeUser});
  }
})

app.get('/all-links', function(req, res){
  User.findOne({ name: activeUser }).populate('links').exec(function(err, user){
    if(err){
      console.log(err);
    } else {
      res.send(user.links);
    }
  })
})

app.post('/all-links', function(req, res){
  User.findOne({ name: activeUser }).populate('links').exec(function(err, user){
    if(err){
      console.log(err);
    } else {
      console.log('all user links');
      res.status(200).json({allLinks: user.links})
    }
  })
})

app.post('/link', function(req, res){
  Link.findOne({ src: req.body.src }, function(err, link){
    // if(link){
    //   //res.end('Ссылка существует');
    //   res.status(200).json({reduceLink: 'http://localhost:3000/' + link.reduceLink + '/'})
    // } else {
    if(err){
      console.log(err);
    } else {
      //var reduce_link = 'http://localhost:3000/' + str_rand() + '/';
      var reduce_link = str_rand();

      var tagsString = req.body.tags;
      var tags = tagsString.split(',');
      tags.map(function(tag, index) {
         tags[index] = tag.trim();
      })

      User.findOne({ name: activeUser }, function(err, user){
        if(err){
          console.log(err);
        } else {
          var link = new Link({
              src: req.body.src,
              reduceLink: reduce_link,
              linkInfo: req.body.linkInfo,
              tags: tags
          })

          user.links.push(link);

          user.save(function(err) {
              if(err){
                console.log(err);
              } link.save(function(err) {
                if(err){
                  console.log(err);
                }else {
                  console.log('Add link');
                  res.status(200).json({reduceLink: 'http://localhost:3000/' + link.reduceLink + '/'})
                  //res.status(200).json(link);
                }
              })
            })
          }
        })
    }
  })
})

app.get('/link', function(req, res){
  Link.find({}, function(err, links) {
    if(err){
      console.log(err);
    } else {
      //res.send(links);
      links.map(function(link){
        res.write(link.id + '\n')
        res.write(link.src + '\n');
        res.write(link.reduceLink + '\n');
        res.write(link.linkInfo + '\n');
        res.write(link.tags + '\n');
        res.write('Click: ' +  link.click + '\n')
      })
      res.end();
    }
  })
})

app.put('/link', function(req, res) {
  var tagsString = req.body.tags;
  var tags = tagsString.split(',');
  tags.map(function(tag, index) {
     tags[index] = tag.trim();
  })
  Link.update(
    { src: req.body.src },
    { $set: {linkInfo: req.body.linkInfo, tags: tags }
    }, function(err, link) {
    if(err) {
      console.log(err);
    } else {
      res.status(200).json(tags);
    }
  })
})

app.delete('/link', function(req, res){
  Link.remove({ src: req.body.src, reduceLink: req.body.reduceLink.slice(-6, -1) }, function(err){
    if(err){
      console.log(err);
    }
    else {
      console.log('link delete!');
      res.status(200).json({ result: true});
    }
  })
})

app.post('/tag', function(req, res){
  console.log(req.body.tag);
  Link.find({ tags: req.body.tag }, function(err, links){
    if(err){
      console.log(err);
    } else {
      res.status(200).json(links);
    }
  })
})

app.post('/exit', function(req, res){
  activeUser = '';
  console.log(activeUser);
  res.status(200).json({user: activeUser});
})

app.get('/:reduceLink', function(req, res) {
  console.log(req.params.reduceLink);
  Link.findOne({ reduceLink: req.params.reduceLink }, function(err, link) {
    if(err) {
      console.log(err);
    } else if(link){
      link.click++;
      //res.writeHead(301, { Location: link.src });  //Можно использовать res.redirect()
      res.redirect(link.src);

      link.save(function(err) {
        if(err){
          res.send(err);
        } else {
          console.log('updated click!')
        }
      })

    }
      else {
        console.log('link undefined');
    }
  })
})



app.listen(3000, function() {
  console.log('Server is up!');
});
