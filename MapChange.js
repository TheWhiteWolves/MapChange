// Github:   https://github.com/TheWhiteWolves/MapChange.git
// By:       TheWhiteWolves
// Contact:  https://app.roll20.net/users/1043/thewhitewolves

// TODO List:
// * Add more options to commands
//      * !mc refresh                           - Refreshes the public and private maps.
//      * !mc rejoin                            - Removes the player's playerspecificpages entry and moves 
//                                                them back to the global players tab.
//      * !mc move [map name]                   - Moves the sender to the map with the provided name.
//                                                (GM required for private maps)
//      * !mc moveplayer [player] [map name]    - Moves the player with the provided name to the map with
//                                                the provided name. (GM required for private maps)
//      * !mc moveall [map name]                - Empties playerspecificpages and moves all players to the
//                                                map with the provided name. (GM Only)
//      * !mc help                              - Display help on how to use the script.

var MapChange = MapChange || (function() {
    'use strict';
    // Config
    // When true places the pages with name containing the marker into the public list.
    // Use this if you want maps to be private by default instead of public by default.
    var invertedMarker = false,
    // The marker used to decide what is placed in the private map.
    marker = "[GM]",
    // These are maps that players are able to move to using the commands.
    publicMaps = {},
    // These are maps that only the GM can move people to.
    privateMaps = {},
    
    constructMaps = function() {
        // Get an object containing all the pages in the campaign.
        var pages = findObjs({_type: 'page'});
        
        // Loop through the pages adding them to their relevent maps.
        for (var key in pages) {
            // Grab the name and id for the current page.
            var name = pages[key].get("name");
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
        log("Public:");
        log(publicMaps);
        log("Private:");
        log(privateMaps);
    },
    
    handleInput = function(msg) {
        if (msg.type !== "api") {
            return;
        }

        // Grab the contents of the msg sent and split it into the individual arguments..
        var args = msg.content.split(/\s+/);
        
        // Check the lower cased version of the message to see if it contains the call for
        // this script to run, if it doesn't then return.
        switch (args.shift().toLowerCase()) {
            case "!mapchange":
            case "!mc":
                if (args.length > 0) {
                    processCommands(msg, args);
                }
                else {
                    showHelp(msg);
                }
                break;
            default:
                return;
        }
    },
    
    processCommands = function(msg, args) {
        var command = args.shift().toLowerCase();
        
        switch (command) {
            case "help":
                showHelp();
                break;
            case "refresh":
                refresh();
                break;
            case "move":
                move(msg, msg.playerid, args.join().replace(/,/g, " "));
                break;
            case "moveplayer":
                move(msg, getPlayerIdFromDisplayName(args.shift()), args.join().replace(/,/g, " "));
                break;
            default:
                showHelp();
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

    showHelp = function() {
        sendChat("MapChange", "TODO: Add Help");
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
        
        var players = findObjs({_type: 'player'});
        log(players);
        
        if (playerPages === false) {
            playerPages = {};
        }
        
        if (target in publicMaps) {
            // Move player.
            playerPages[sender] = publicMaps[target];
        }
        else if (target in privateMaps) {
            log(playerIsGM(sender));
            if(playerIsGM(sender)) {
                // Move player.
                playerPages[sender] = privateMaps[target];
            }
        }
        else {
            // Report Map not found.
            //sendChat();
        }
        
        Campaign().set("playerspecificpages", playerPages);
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
