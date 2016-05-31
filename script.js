{
  "name": "MapChange",
  "script": "MapChange.js",
  "version": "1.0",
  "description": "Provides a way for users to move between maps in a campaign withput the GM needing to move them.", 
  "authors": "TheWhiteWolves",
  "roll20userid": "1043",
  "patreon": "",
  "useroptions": [
    {
      "name": "Debug Mode",
      "type": "checkbox",
      "description": "",
      "value": "debug"
    },
    {
      "name": "GM Notification",
      "type": "checkbox",
      "description": "",
      "value": "gmNotify"
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
      "value": "invertedMarker"
    },
  ],
  "dependencies": [],
  "modifies": {
    "Campaign.playerpageid": "read,write"
    "Campaign.playerspecificpages": "read,write",
    "state.MapChange": "read,write"
  },
  "conflicts": [],
  "previousversions": []
}
