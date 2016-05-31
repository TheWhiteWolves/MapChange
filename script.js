{
  "name": "MapChange",
  "script": "MapChange.js",
  "version": "1.0",
  "description": "Provides a way for users to move between maps in a campaign without the GM needing to move them.\n\nFor full information on how to use the script, use the command "!mc help" in game.", 
  "authors": "TheWhiteWolves",
  "roll20userid": "1043",
  "patreon": "",
  "useroptions": [
    {
      "name": "Debug Mode",
      "type": "checkbox",
      "description": "",
      "value": "false"
    },
    {
      "name": "GM Notification",
      "type": "checkbox",
      "description": "",
      "value": "true"
    },
    {
      "name": "Marker",
      "type": "text",
      "default": "[GM]",
      "description": "",
    },
    {
      "name": "Inverted Marker",
      "type": "checkbox",
      "description": "",
      "value": "false"
    },
  ],
  "dependencies": [],
  "modifies": {
    "Campaign.playerpageid": "read,write"
    "Campaign.playerspecificpages": "read,write",
    "Page.name": "read",
    "Page._id": "read",
    "Player._displayname": "read",
    "Player._id": "read",
    "state.MapChange": "read,write"
  },
  "conflicts": [],
  "previousversions": []
}
