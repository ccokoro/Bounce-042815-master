PlayersList = new Mongo.Collection('players');
// console.log("Hello world");

if(Meteor.isServer){
 
    
    /*Eni's code from meeting app*/
    
    Meetings = new Mongo.Collection('meetings');

/* Helper function used in the publish method to filter undesired items.*/
function checkExpiration(){
  // Iterate through all meetings and check if time has expired
  var allMeetings = Meetings.find({});
  var now = new Date();
  allMeetings.forEach(function(item){
    if (item.endTimeDate < now)
      Meetings.update(item, {$set: {hasExpired: true}});
  })
  // remove expired entries
  Meetings.remove({hasExpired: true})
}


Meteor.publish('theMeetings', function(){
    checkExpiration();
    return Meetings.find({hasExpired: false}, {sort: {startTimeDate: 1}})
});


Meteor.methods({
  insertMeeting: function(meetingObj){
    // create two new fields for startTime and endTime, so that they are
    // Date() objects
    var startTimeObj = new Date(meetingObj.date + " " + meetingObj.startTime);
    var endTimeObj = new Date(meetingObj.date + " " + meetingObj.endTime);
    var currentUserId = Meteor.user().username;
      
    Meetings.insert({
      name: currentUserId,
      location: meetingObj.location,
      dateStr: meetingObj.date,
      // Use the moment.js library to format time in US time
      startTimeStr: moment(startTimeObj).format("hh:mm A"),
      endTimeStr: moment(endTimeObj).format("hh:mm A"),
      startTimeDate: startTimeObj,
      endTimeDate: endTimeObj,
        activityStr: meetingObj.activity,
      hasExpired: false
    })
    console.log("new meeting added in mongodb");
  }
})

}


if(Meteor.isClient){
   Meteor.subscribe('thePlayers');
    
    Template.location.events({
        'click #KSC': function() {
            console.log("clicked KSC");
         //Meetings.find({}, ({ location:"KSC" }))
        }
    });

   Template.leaderboard.helpers({
      'player': function(){
        var currentUserId = Meteor.userId();
    	return PlayersList.find({}, ({createdBy: currentUserId},
                            {sort: {score: -1, name: 1}}))

      },
      'selectedClass': function(){
	    var playerId = this._id;
	    var selectedPlayer = Session.get('selectedPlayer');
	    if(playerId == selectedPlayer){
	    // return "selected"
	    return "active"
    	}
	  },
	  'showSelectedPlayer': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    return PlayersList.findOne(selectedPlayer)
		}
    });

   Template.leaderboard.events({
   	'click .player': function(){
	    var playerId = this._id;
	    Session.set('selectedPlayer', playerId);
		},

	'click .increment': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    Meteor.call('modifyPlayerScore', selectedPlayer, 5);
		},

	'click .decrement': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	     Meteor.call('modifyPlayerScore', selectedPlayer, -5);

	},
	'click .remove': function(){
	    var selectedPlayer = Session.get('selectedPlayer');
	    PlayersList.remove('removePlayerData',selectedPlayer);
		}
   });

   Template.addPlayerForm.events({
   	'submit form': function(event){
	    event.preventDefault();
	    var playerNameVar = event.target.playerName.value;
	    Meteor.call('insertPlayerData', playerNameVar);
	}
   })
////<<<<<<< HEAD:mwitt_am6.js
//}
////=======
   
/*Eni's code from the meeting app*/

   
   
   
// Global variables to store data in MiniMongo and Session
Meetings = new Mongo.Collection('meetings');
Session.setDefault("addMeetingFlag", false);
Session.setDefault("viewMeetingFlag", false);
Meteor.subscribe('theMeetings');


/* Deal with the two buttons that show up first in the page.*/
Template.body.events({
  "click #addButton": function(){
    Session.set("addMeetingFlag", true);
  },
  /* Switch name of button and show/hide meetings.*/
  "click #viewButton": function(event){
    if (event.target.textContent == "View Meetings"){
      Session.set("viewMeetingFlag", true);
      event.target.textContent = "Hide Meetings";
    }
    else {
      event.target.textContent = "View Meetings";
      Session.set("viewMeetingFlag", false);
    }
  }
})


/* Template helpers that set the values for the variables that control
the HTML page appearance. Because templates are reactive contexts,
whenever the value of flags is changed somewhere in the code, the code
in the template gets rerun, changing the HTML page.
*/
Template.addMeetingForm.helpers({
  
  addMeeting: function(){
    return Session.get("addMeetingFlag");
  }
  
});

Template.viewColumn.helpers({
    
  viewMeeting: function(){
    return Session.get("viewMeetingFlag");
  },
  
  meetingsList: function(){
    return Meetings.find({});
  }
  
});
                      

/* Deal with adding a meeting to the database */
Template.addMeetingForm.events({

    
  "submit form": function(event){
      console.log("submit form");

      var meetingObject = {
        /*name: event.target.meetingname,*/
        location: event.target.meetingLocation.value,
        date: event.target.meetingDate.value,
        startTime: event.target.startTime.value,
        endTime: event.target.endTime.value,
       activity: event.target.meetingActivity.value,
      };

      Meteor.call('insertMeeting', meetingObject);

      Session.set("addMeetingFlag", false); // make the form disappear
      console.log(meetingObject);
      event.target.reset(); // to clear the fields for next time
    
      // show message in the page using jQuery
      $("#successMessage").show().fadeOut(3000);
      return false;
    }

})
}
//>>>>>>> szachare:Bounce.js
