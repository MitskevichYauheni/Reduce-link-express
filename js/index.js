var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var User = require('./models/user');
var Link = require('./models/reduceLink');



mongoose.connect('mongodb://localhost:27017/reduce-link')

var app = express();


app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


function str_rand(){
    var text = "";
    var possible = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


var activeUser = '';

app.post('/', function(req, res){
  User.findOne({ name: req.body.name }, function(err, user){
    if(user){
      if(user.password == req.body.password){
          //res.send("Верный пароль");
          activeUser = req.body.name;
          console.log(activeUser);
          res.redirect('http://localhost:3001/app.html');

      } else{
          res.send("Неверный пароль");

      }
    } else {
      User.create({ name: req.body.name, password: req.body.password }, function(err, user) {
        if(err){
          console.log(err);
        } else {
          activeUser = req.body.name;
          res.redirect('http://localhost:3001/app.html');
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
      users.map(function(user){
        res.write(user.name + '\n');
        res.write(user.password + '\n');
      })
      res.end();
    }
  })

  //res.send('Hello in browser')
})

app.post('/link', function(req, res){
  Link.findOne({ src: req.body.src }, function(err, link){
    if(link){
      res.send('Ссылка существует');
      res.send(link);
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
              linkInfo: req.body.info,
              tags: tags
          })

          user.link.push(link);

          user.save(function(err) {
              if(err){
                console.log(err);
              } link.save(function(err) {
                if(err){
                  console.log(err);
                }else {
                  console.log('Add link');
                  res.send(link);
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
      links.map(function(link){
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
    { $set: {linkInfo: req.body.info, tags: tags }
    }, function(err, link) {
    if(err) {
      console.log(err);
    } else {
      res.send(link);
    }
  })
})

app.post('/tag', function(req, res){
  Link.find({ tags: req.body.tag }, function(err, links){
    if(err){
      console.log(err);
    } else {
      links.map(function(link){
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

app.get('/:reduceLink', function(req, res) {
  console.log(req.params.reduceLink);
  Link.findOne({ reduceLink: req.params.reduceLink }, function(err, link) {
    if(err) {
      console.log(err);
    } else if(link){
      link.click++;
      res.writeHead(301, { Location: link.src });  //Можно использовать res.redirect()
      //res.end();

      link.save(function(err) {
        if(err){
          res.rend(err);
        } else {
          res.end();
          //res.send('updated');
        }
      })

        //res.send(link);
    }
      else {
        console.log('link undefined');
    }
  })
})




app.listen(3000, function() {
  console.log('Server is up!');
});
