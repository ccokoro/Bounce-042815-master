/*
Team: Chimuanya Okoro, Sophia Zachares, Meridian Witt
File: mwitt_am6.js
Purpose: The client has the template location and 
Note: Events is the terminology held over from Eni's example application. We are creating events. 
*/


if(Meteor.isClient){

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
  });

    var loc;
    var act;
    
    Template.location.events({ 
        
        "click .allevents": function(event){
             Session.set("currentActivity", "");
            Session.set("currentLocation", "");
        },
        
    "click .locations": function(event){
    Session.set("currentActivity", "");
        loc = event.target.innerHTML; 
        console.log(loc); 
       Session.set("currentLocation", loc);
   }, 
    "click .activities": function(event) {
      Session.set("currentLocation", "");
        act = event.target.innerHTML; 
        console.log(act); 
       Session.set("currentActivity", act);
    }});
    
    Template.body.helpers({
        
     name: function(){
        var user = Meteor.user().username; 
        return user;   
        }, 
              
        isHidden: function(hide){
            return Session.equals('hide', hide)
        }
   });
   
// Global variables to store data in MiniMongo and Session
Events = new Mongo.Collection('events');
Session.setDefault("addEventFlag", false);
Session.setDefault("viewEventFlag", false);
Session.setDefault("currentLocation", "");
Session.setDefault("currentActivity", "");  
Session.setDefault("hide", false);

Meteor.subscribe('theEvents');


/* Deal with the two buttons that show up first in the page.*/
Template.body.events({
  "click #addButton": function(){
    Session.set("addEventFlag", true);
    Session.set("hide", !Session.get("hide"));
  },

  /* Switch name of button and show/hide events.*/
  "click #viewButton": function(event){
    if (event.target.textContent == "View Events"){
      Session.set("viewEventFlag", true);
      event.target.textContent = "Hide Events";
    }
    else {
      event.target.textContent = "View Events";
      Session.set("viewEventFlag", false);
    }
  }
}); 


/* Template helpers that set the values for the variables that control
the HTML page appearance. Because templates are reactive contexts,
whenever the value of flags is changed somewhere in the code, the code
in the template gets rerun, changing the HTML page.
*/
Template.addEventForm.helpers({
  
  addEvent: function(){
    return Session.get("addEventFlag");
  }
  
});

Template.viewColumn.helpers({
    viewEvent: function(){
    return Session.get("viewEventFlag");
  },
     
    eventsList: function(){ 
    var curLoc = Session.get("currentLocation");
    var curAct = Session.get("currentActivity");
        if (curLoc != "") {
              return Events.find({location: curLoc});}
        else if (curAct != "") {
            return Events.find({activityStr: curAct}); 
        } else {
    return Events.find(); }},
    
    
    
     // firstName: function(){
     //    var user = Meteor.user().username; 
     //    console.log(user);
     //    return user;   
     //    } 
   }  
    
);
    
/* Deal with adding a event to the database */
Template.addEventForm.events({

    
  "submit form": function(event){
      console.log("submit form");

      var eventObject = {
        name: Meteor.user().username,
        location: event.target.eventLocation.value,
        date: event.target.eventDate.value,
        startTime: event.target.startTime.value,
        endTime: event.target.endTime.value,
       activity: event.target.eventActivity.value,
      };
    
      Meteor.call('insertEvent', eventObject);

      Session.set("addEventFlag", false); // make the form disappear
      console.log(eventObject);
      event.target.reset(); // to clear the fields for next time
    
      // show message in the page using jQuery
      $("#successMessage").show().fadeOut(3000);
      return false;
    }

})

}

if(Meteor.isServer){
    
    Events = new Mongo.Collection('events');

/* Helper function used in the publish method to filter undesired items.*/
function checkExpiration(){
  // Iterate through all events and check if time has expired
  var allEvents = Events.find({});
  var now = new Date();
  allEvents.forEach(function(item){
    if (item.endTimeDate < now)
      Events.update(item, {$set: {hasExpired: true}});
  })
  // remove expired entries
  Events.remove({hasExpired: true})
}


Meteor.publish('theEvents', function(){
    checkExpiration();
    return Events.find({hasExpired: false}, {sort: {startTimeDate: 1}})
});


Meteor.methods({
  insertEvent: function(eventObj){
    // create two new fields for startTime and endTime, so that they are
    // Date() objects
    var startTimeObj = new Date(eventObj.date + " " + eventObj.startTime);
    var endTimeObj = new Date(eventObj.date + " " + eventObj.endTime);
    var currentUserId = Meteor.user().username;
      
    Events.insert({
      name: currentUserId,
      location: eventObj.location,
      dateStr: eventObj.date,
      // Use the moment.js library to format time in US time
      startTimeStr: moment(startTimeObj).format("hh:mm A"),
      endTimeStr: moment(endTimeObj).format("hh:mm A"),
      startTimeDate: startTimeObj,
      endTimeDate: endTimeObj,
        activityStr: eventObj.activity,
      hasExpired: false
    })
    console.log("new event added in mongodb");
  },
    
     eventsLoc: function(loc){
        return Events.find({location: loc});
    }
    
})

}
