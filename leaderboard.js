// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
var sort_by_score = {score: -1, name: 1};
var sort_by_name  = {name: 1, score: -1};
Session.set("sort", "name");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    var sort = sort_by_score;
    if (Session.get("sort") == "name")
      sort = sort_by_name;
    return Players.find({}, {sort: sort});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.sort_val = function() {
    if (Session.get("sort") == "name"){
      return "Sorting by Name";
    } else {
      return "Sorting by Score";
    }
  };

  Template.leaderboard.events({
    'click input#increment_button': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input#toggle_sort': function () {
      if (Session.get("sort") == "name"){
        Session.set("sort", "score")
      } else {
        Session.set("sort", "name");
      }
    },
    'click input#randomize_scores': function() {
      randomizeScores();
    }
  });

  Template.player.events({
    'click input#delete': function () {
      Players.remove({_id: this._id}, 1);
    },
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

  Template.add_player.events({
    'click input#add': function () {
      Players.insert({name: $('#new_name').val(), score: 0});
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: 0});
    }
  randomizeScores();
  });
}

function randomizeScores() {
  for (var i=0; i < Players.find().count(); i++){
    var player = Players.find().fetch()[i]
    Players.update({ _id: player._id}, { $set: { score: Math.floor(Math.random()*10)*5} });
  }
}
