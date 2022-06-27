#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://pokemoninventorykeep:gottacatchemall@cluster0.4moc8.mongodb.net/?retryWrites=true&w=majority"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

var async = require("async");
var Card = require("./models/card");
var Element_Type = require("./models/element_type");
var CardInstance = require("./models/card_instance");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var element_types = [];
var cards = [];
var card_instances = [];

async function element_typeCreate(name, cb) {
  var element_type = new Element_Type({ name: name });
  element_type.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Element_Type: " + element_type);
    element_types.push(element_type);
    cb(null, element_type);
  });
}

function cardCreate(title, summary, element_type, cb) {
  carddetail = {
    title: title,
    summary: summary,
  };
  if (element_type != false) carddetail.element_type = element_type;

  var card = new Card(carddetail);
  card.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Card: " + card);
    cards.push(card);
    cb(null, card);
  });
}

function cardInstanceCreate(card, card_price, status, cb) {
  card_instancedetail = {
    card: card,
    card_price: card_price,
  };
  var card_instance = new CardInstance(card_instancedetail);
  card_instance.save(function (err) {
    if (err) {
      console.log("ERROR CREATING CardInstance: " + card_instance);
      cb(err, null);
      return;
    }
    console.log("New CardInstance: " + card_instance);
    card_instances.push(card_instance);
    cb(null, card);
  });
}
function createElementType(cb) {
  // here?
  async.series(
    [
      function (callback) {
        element_typeCreate("Fire", callback);
      },
      function (callback) {
        element_typeCreate("Water", callback);
      },
      function (callback) {
        element_typeCreate("Grass", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createCards(cb) {
  async.parallel(
    [
      function (callback) {
        cardCreate(
          "Bulbasaur",
          "There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.",
          [element_types[2]],
          callback
        );
      },
      function (callback) {
        cardCreate(
          "Squirtle",
          "When it retracts its long neck into its shell, it squirts out water with vigorous force.",
          [element_types[1]],
          callback
        );
      },
      function (callback) {
        cardCreate(
          "Charmander",
          "It has a preference for hot things. When it rains, steam is said to spout from the tip of its tail.",
          [element_types[0]],
          callback
        );
      },
      function (callback) {
        cardCreate(
          "Volcanion",
          "It lets out billows of steam and disappears into the dense fog. It’s said to live in mountains where humans do not tread.",
          [element_types[1], element_types[0]],
          callback
        );
      },
      function (callback) {
        cardCreate(
          "Ludicolo",
          "The rhythm of bright, festive music activates Ludicolo’s cells, making it more powerful.",
          [element_types[1], element_types[2]],
          callback
        );
      },
      function (callback) {
        cardCreate(
          "Piplup",
          "It doesn’t like to be taken care of. It’s difficult to bond with since it won’t listen to its Trainer.",
          [element_types[1]],
          callback
        );
      },
      function (callback) {
        cardCreate(
          "Chimchar",
          "Its fiery rear end is fueled by gas made in its belly. Even rain can’t extinguish the fire.",
          [element_types[0]],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createCard_Instances(cb) {
  async.parallel(
    [
      function (callback) {
        cardInstanceCreate(
          // bulbasaur
          cards[0],
          // card price
          25,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[1],
          15,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[2],
          20,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[3],
          25,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[3],
          18,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[3],
          40,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[4],
          30,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[4],
          50,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[4],
          45,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[5],
          25,
          // false,
          "Available",
          callback
        );
      },
      function (callback) {
        cardInstanceCreate(
          cards[6],
          20,
          // false,
          "Available",
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

async.series(
  [createElementType, createCards, createCard_Instances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("CARDInstances: " + card_instances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
