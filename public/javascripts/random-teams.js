  $(function() {

      // Player Models --------------------
  		var Player = Backbone.Model.extend({
  			defaults: {
  				name: "Not specified"
  			}
  		});

  		var Players = Backbone.Collection.extend({
  			model: Player
  		});

  		var Players = new Players();   // global collection of players

      // Player Views ---------------------
  		var PlayerView = Backbone.View.extend({
  			tagName: 'li',
  			
  			template: _.template($('#player-template').html()),

  			events: {
  				"click a.destroy": "clear"
  			},

  			initialize: function() {
  				this.model.bind('destroy', this.remove, this);
  				this.model.bind('change', this.render, this);
  			},
  			
  			render: function() {
  				this.$el.html(this.template({model: this.model}));
  				return this;
  			},

  			clear: function() {
  				this.model.destroy();
  			}
  		});

  		var PlayerListView = Backbone.View.extend({

  			el: '.players',
  			
  			events: {
  				"keypress #add-player": "createOnEnter"
  			},

  			initialize: function() {
				Players.bind('add', this.addOne, this);
				Players.bind('reset', this.addAll, this);
  			},

  			render: function (){
  				var template = _.template($('#player-list-template').html(), {players: Players.models});
  				this.$el.html(template);
  				this.$el.find("#add-player").focus();
  				this.addAll();
  			},

  			addOne: function(player) {
  				var view = new PlayerView({model: player});
  				this.$("#player-list").prepend(view.render().el);
  			},

  			addAll: function() {
  				Players.each(this.addOne);
  			},

  			createOnEnter: function(e) {
  				var input = $('#add-player');
  				if (e.keyCode != 13) return;
  				if (!input.val()) return;
  			
  				Players.add({name: input.val()});
  				input.val('');
  			}

  		});

    // Team Models --------------------

		var Team = Backbone.Model.extend({
			defaults: function() {
				return {
					name: 'team',
					players: new Array()
				};
			},

			addPlayer: function (player) {
				this.get('players').push(player);
			}
		});

		var TeamView = Backbone.View.extend({
			tagName: "li",
			template: _.template($('#team-template').html()),
  			
  			render: function() {
  				this.$el.html(this.template({model: this.model}));
  				return this;
  			}
		});

		var Teams = Backbone.Collection.extend({
			model: Team
		});

    // Team Views -------------------------

		var TeamsView = Backbone.View.extend({
			
      el: ".teams",

			template: _.template($("#team-list-template").html()),
			render: function() {
				this.$el.html(this.template());
				this.collection.each(this.addTeam);
				return this;
			},

			addTeam: function(team) {
				var view = new TeamView({model: team});
				this.$("#team-list").append(view.render().el);
			}
		});

		var GenerateTeamsView = Backbone.View.extend({
			el: '.generate-teams',
			
			events: {
				"keypress #num-teams": "clickOnEnter",
				"click .generate": "generateTeams"
			},
			
			render: function() {
				var template = _.template($("#generate-teams-template").html());
				this.$el.html(template);
			},

			generateTeams: function(ev) {
  				var num = this.$("#num-teams").val();
  				if (num && num > 0) {
            var teams = generateRandomTeams(num, Players); 
				    new TeamsView({ collection: teams}).render();
          }
  			},

  			clickOnEnter: function(e) {
  				if (e.keyCode === 13) {
  					$('.generate').click();
  				}
  			}
		});

    // Utils for randomly selecting teams ------

		function shuffle(list) {
  			var i, j, t;
  			for (i = 1; i < list.length; i++) {
    			j = Math.floor(Math.random()*(1+i)); 
    			if (j != i) {
      				t = list[i];
      				list[i] = list[j];
      				list[j] = t;
    			}
  			}
		}

		function generateRandomTeams(num, players) {
			var playersArray = [];
			players.each(function(p) { playersArray.push(p);});

			shuffle(playersArray);

			var i;
			var teams = [];
			for(i = 0; i < num; i++) {
				teams.push(new Team({ name: "Team " + (i + 1)}));
			}

			var playerIndex = 0;
			var teamToJoin = 0;

			while(playerIndex < playersArray.length) {
				teams[teamToJoin].addPlayer(playersArray[playerIndex]);
				playerIndex = playerIndex + 1;
				teamToJoin = (teamToJoin + 1) % num;
			}

			return new Teams(teams);
		}
    // ---------------------------------

  	var Router = Backbone.Router.extend({
  		routes: {
  			'' : 'home'
  		}
  	});

  	var playerList = new PlayerListView();
  	var generateTeams = new GenerateTeamsView();
  		
    var router = new Router();
  	router.on('route:home', function() {
  		playerList.render();
  		generateTeams.render();
  	});

  	Backbone.history.start();
  });