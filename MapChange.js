// Github:   https://github.com/TheWhiteWolves/MapChange.git
// By:       TheWhiteWolves
// Contact:  https://app.roll20.net/users/1043/thewhitewolves

// TODO List:
// * Add more options to commands
// Done * !mc refresh                           - Refreshes the public and private maps.
// Done * !mc rejoin                            - Removes the senders's playerspecificpages entry and moves 
//                                                them back to the global players tab.
// Done * !mc rejoin [player name]              - Removes the provided player's playerspecificpages entry and  
//                                                moves them back to the global players tab.
// Done * !mc move [map name]                   - Moves te sender to the map with the provided name.
//                                                (GM required for private maps)
// Done * !mc move [player name] [map name]     - Moves the sender with the provided name to the map with the 
//                                                provided name. (GM required for private maps)
// Done * !mc moveall [map name]                - Empties playerspecificpages and moves all players to the
//                                                map with the provided name. (GM Only)
//      * !mc help                              - Display help on how to use the script.

var MapChange = MapChange || (function() {
    'use strict';
    // Config
    // Set to true to use built in debug statements
    var debug = true,
    // When true places the pages with name containing the marker into the public list.
    // Use this if you want maps to be private by default instead of public by default.
    invertedMarker = false,
    // The marker used to decide what is placed in the private map.
    marker = "[GM]",
    // These are maps that players are able to move to using the commands.
    publicMaps = {},
    // These are maps that only the GM can move people to.
    privateMaps = {},
    
    // Constructs the private and public maps for use in the api script.
    constructMaps = function() {
        // Get an object containing all the pages in the campaign.
        var pages = findObjs({_type: 'page'});
        
        // Loop through the pages adding them to their relevent maps.
        for (var key in pages) {
            // Get the name of the page that is current being processed.
            var name = pages[key].get("name");
            // Get the id of the page that is current being processed.
            var id = pages[key].get("_id");
            
            // Check if the name of the page contains the marker.
            if (name.indexOf(marker) > -1) {
                // If the name does then remove the marker from the name and trim off any whitespace.
                name = name.replace(marker, "").trim();
                // If invertedMarker is being used then place the name and id of the page in the 
                // public map else place it in the private map.
                invertedMarker ? publicMaps[name] = id : privateMaps[name] = id;
            }
            else {
                // If the name does not contain the marker then place the name and id in the public map
                // if invertedMarker is being used else place it in the private map.
                invertedMarker ? privateMaps[name] = id : publicMaps[name] = id;
            }
        }
        
        // Debug
        if (debug) {
            log("Public:");
            log(publicMaps);
            log("Private:");
            log(privateMaps);
        }
    },
    
    // Handle the input message call for the api from the chat event.
    handleInput = function(msg) {
        // Check that the message sent is for the api, if not return as we don't need to do anything.
        if (msg.type !== "api") {
            return;
        }
        
        // Grab the contents of the msg sent and split it into the individual arguments.
        var args = msg.content.split(/\s+--/);
        // Parse the first section of the arguments to get an array containing the commands.
        var commands = parseCommands(args.shift());
        // Parse the remaining aruments to get any parameters passed in.
        var params = parseParameters(args);
        
        // Check the lower cased version of the message to see if it contains the call for
        // this script to run, if it doesn't then return.
        switch (commands.shift().toLowerCase()) {
            case "!mapchange":
            case "!mc":
                // Check to see if any further commands were passed in and process them, else
                // show the help test on how to use the script.
                if (commands.length > 0) {
                    // Process the remaining commands with the passed in paramters.
                    processCommands(msg, commands, params);
                }
                else {
                    // Show the sender the script help message.
                    showHelp(msg);
                }
                break;
            default:
                // If we reached here it means that the call to the api was not meant for us.
                return;
        }
    },
    
    // Parses the commands of the call to the api script.
    parseCommands = function(args) {
        // Split the arguments by spaces and return the array containing them all.
        return args.split(/\s+/);
    },
    
    // Parses the parameters of the call to the api script.
    parseParameters = function(args) {
        // Declare a new object to hold the parameters.
        var params = {};
        // Loop through all the passed in arguments and construct them in into the parameters.
        for (var param in args) {
            // Split the parameter down by spaces and temporarily store it.
            var tmp = args[param].split(/\s+/);
            // Take the first element in tmp and use it as the parameter name and reassemble the
            // remaining elements and replace the commas with spaces for the parameter value.
            params[tmp.shift()] = tmp.join().replace(/,/g, " ");
        }
        // Return the constructed object of parameters.
        return params;
    },
    
    // Processes the commands provided in the call to the api script.
    processCommands = function(msg, commands, params) {
        // Take the command and decide what function to run.
        switch (commands.shift().toLowerCase()) {
            case "help":
                // Send the help text to the player who sent the message.
                showHelp(msg);
                break;
            case "refresh":
                // Refresh the public and private maps to pull in any changes made since the script
                // was last started.
                refresh();
                break;
            case "move":
                // Check to see if the sender has provided and target map for the move, if they
                // haven't then send them a chat message to tell them it is missing.
                if(params.hasOwnProperty("target")) {
                    // Check to see if the sender has provided a player to be moved, if they 
                    // haven't then user the id of the sender.
                    if (params.hasOwnProperty("player")) {
                        // Move the provided player to the map with the provided name.
                        move(msg, getPlayerIdFromDisplayName(params.player), params.target);
                    }
                    else {
                        // Move the sender to the map with the provided name.
                        move(msg, msg.playerid, params.target);
                    }
                }
                else {
                    // Send a chat message to tell teh sender that they missed the target map parameter.
                    sendChat("MapChange", "/w " + msg.who + " Target map parameter missing, use !mc help to see how to use this script.");
                }
                break;
            case "rejoin":
                // Check to see if a player name was provided, if so then run rejoin on that player only if
                // the sender is either a GM or the provided player is the sender.
                if (params.hasOwnProperty("player")) {
                    // Check the sender is either a GM or the provided player.
                    if (playerIsGM(msg.playerid) || params.player === msg.who) {
                        // Run the rejoin on the provided player.
                        rejoin(getPlayerIdFromDisplayName(params.player));
                    }
                    else {
                        // Send a warning to the sender to tell tehm that they cannot perform the action.
                        sendChat("MapChange", "/w " + msg.who + " You do not have the permission required to perform that action.");
                    }
                }
                else {
                    // Run rejoin on the sender of the api call.
                    rejoin(msg.playerid);
                }
                break;
            case "moveall":
                // Move all the players back to the bookmark and then move the bookmark to the map with
                // the provided name.
                moveall(msg, params.target);
                break;
            default:
                // Show the scripts help text is no further command was provided.
                showHelp(msg);
                break;
        }
    },

    getPlayerIdFromDisplayName = function(name) {
        var players = findObjs({_type: 'player'});
        
        for (var key in players) {
            if (players[key].get("_displayname") === name) {
                return players[key].get("_id");
            }
        }
        
        return undefined;
    },

    showHelp = function(msg) {
        sendChat("MapChange", "/w " + msg.who + " TODO: Add Help");
        log("TODO: Add Help");
    },

    refresh = function() {
        log("Refreshing Maps...");
        publicMaps = {};
        privateMaps = {};
        constructMaps();
        log("Refresh Complete");
    },
    
    move = function(msg, sender, target) {
        var pages = findObjs({_type: 'page'});
        var playerPages = Campaign().get("playerspecificpages");
        
        if (playerPages === false) {
            playerPages = {};
        }
        
        if (target in publicMaps) {
            // Move player.
            if(sender in playerPages) {
                delete playerPages[sender];
            }
            playerPages[sender] = publicMaps[target];
        }
        else if (target in privateMaps) {
            if(playerIsGM(msg.playerid)) {
                // Move player.
                if(sender in playerPages) {
                    delete playerPages[sender];
                }
                playerPages[sender] = privateMaps[target];
            }
        }
        else {
            // Report Map not found.
            sendChat("MapChange", "/w " + msg.who + " Map " + target + "not found");
        }
        
        Campaign().set("playerspecificpages", false);
        Campaign().set("playerspecificpages", playerPages);
    },

    rejoin = function(sender) {
        var playerPages = Campaign().get("playerspecificpages");
        if (playerPages !== false) {
            if (sender in playerPages) {
                delete playerPages[sender];
                Campaign().set("playerspecificpages", false);
            }
        }
        if (_.isEmpty(playerPages)) {
            playerPages = false;
        }
        Campaign().set("playerspecificpages", playerPages);
    },

    moveall = function(msg, target) {
        if (playerIsGM(msg.playerid)) {
            var bookmarkPage = Campaign().get("playerpageid");
            if (target in publicMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = publicMaps[target];
            }
            else if (target in privateMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = privateMaps[target];
            }
            else {
                sendChat("MapChange", "/w " + msg.who + " Map " + target + " not found");
            }
            
            Campaign().set("playerpageid", bookmarkPage);
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        ConstructMaps: constructMaps,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on("ready", function() {
    'use strict';
    
    log("Map Change Started");
    MapChange.ConstructMaps();
    log("Maps Constructed");
    MapChange.RegisterEventHandlers();
    log("Map Change Ready");
});
