# SimpleDiscordBot SDB
##This is a learning project!##

You have to create a credentials.json:

```
{
	"email": "abc@cde.fg",
	"pw": "xXxXxX",
	"serverid":"123456789123456789"
}
```

##Youtube playlist error
Youtube will not play the next song when the current one ends, because of a bug in Discord.js.
See this issue for reference: https://github.com/hydrabolt/discord.js/issues/61
If you want you can fix this manually.
###I get an error when i want to play youtube!###
You have to make sure that every node-module uses ytdl-core 0.7.7 at least.


