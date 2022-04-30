console.log(`Welcome to SERVICE HANDLER /--/ By https://milrato.eu /--/ Discord: Tomato#6966`.yellow);
const PlayerMap = new Map()
const Discord = require(`discord.js`);
const {
    KSoftClient
} = require('@ksoft/api');
const config = require(`../botconfig/config.json`);
const ksoft = new KSoftClient(config.ksoftapi);
const ee = require(`../botconfig/embed.json`);
const {
  MessageButton,
  MessageActionRow,
  MessageEmbed
} = require(`discord.js`);
const { 
  lyricsEmbed, check_if_dj
} = require("./functions");
let songEditInterval = null;
let collector = null;
module.exports = (client) => {
  try {
    client.distube
      .on(`playSong`, async (queue, track) => {
        let edited = false;
        try {
          client.guilds.cache.get(queue.id).me.voice.setDeaf(true);
        } catch (error) {
          console.log(error)
        }
        try {
          if(collector && !collector.ended){
            collector.stop();
          }
          var newQueue = client.distube.getQueue(queue.id)
          var newTrack = track; //dont use queue.songs[0] which is WRONG !!!!
          var data = receiveQueueData(newQueue, newTrack)
          //Send message with buttons
          let currentSongPlayMsg = await queue.textChannel.send(data).then(msg => {
            PlayerMap.set(`currentmsg`, msg.id);
            return msg;
          })
          //create a collector for the thinggy
          collector = currentSongPlayMsg.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
            time: track.duration > 0 ? track.duration * 1000 : 600000
          }); //collector for 5 seconds
          //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
          let lastEdited = false;

          /**
           * @INFORMATION - EDIT THE SONG MESSAGE EVERY 10 SECONDS!
           */
          try{clearInterval(songEditInterval)}catch(e){}
          songEditInterval = setInterval(async () => {
            if (!lastEdited) {
              try{
                var newQueue = client.distube.getQueue(queue.id)
                var newTrack = newQueue.songs[0];
                var data = receiveQueueData(newQueue, newTrack)
                await currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              }catch (e){
                clearInterval(songEditInterval)
              }
            }
          }, 10000)

          collector.on('collect', async i => {
            if(i.customId != `10` && check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])) {
              return i.reply({embeds: [new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.x} **You are not a DJ and not the Song Requester!**`)
                .setDescription(`**DJ-ROLES:**\n${check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])}`)
              ],
              ephemeral: true});
            }
            lastEdited = true;
            setTimeout(() => {
              lastEdited = false
            }, 7000)
            //skip
            if (i.customId == `1`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //get the player instance
              const queue = client.distube.getQueue(i.guild.id);
              //if no player available return aka not playing anything
              if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
                return i.reply({
                  content: `${client.allEmojis.x} Nothing Playing yet`,
                  ephemeral: true
                })
              }
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              //if ther is nothing more to skip then stop music and leave the Channel
              if (newQueue.songs.length == 0) {
                //if its on autoplay mode, then do autoplay before leaving...
                  i.reply({
                    embeds: [new MessageEmbed()
					           .setColor(ee.color)
					           .setTimestamp()
					           .setDescription(`<:stop_song_button:882513311416066078> **Stopped playing and left the Channel!**`)
					           .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                     ]
 
                  })
                  clearInterval(songEditInterval);
                  collector.stop()
                  edited = true;
                  //edit the current song message
                  await client.distube.stop(i.guild.id)
                return
              }
              //skip the track
              await client.distube.skip(i.guild.id)
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`<:skipped_button:882546103835299892> **Skipped to the next Song!**`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
              collector.stop();
            }
            //stop
            if (i.customId == `2`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })

              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              //if ther is nothing more to skip then stop music and leave the Channel
              if (newQueue.songs.length == 0) {
                i.reply({
                  embeds: [new MessageEmbed()
					           .setColor(ee.color)
					           .setTimestamp()
					           .setDescription(`<:stop_song_button:882513311416066078> **Stopped playing and left the Channel!**`)
					           .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                     ]
                })
                clearInterval(songEditInterval);
                collector.stop()
                edited = true;
                //edit the current song message
                await client.distube.stop(i.guild.id)
              } else {
                //skip the track
                i.reply({
                  embeds: [new MessageEmbed()
					           .setColor(ee.color)
					           .setTimestamp()
					           .setDescription(`<:stop_song_button:882513311416066078> **Stopped playing and left the Channel!**`)
					           .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                     ]
                })
                clearInterval(songEditInterval);
                collector.stop()
                edited = true;
                //edit the current song message
                await client.distube.stop(i.guild.id)
              }
            }
            //pause/resume
            if (i.customId == `3`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              if (newQueue.playing) {
                await client.distube.pause(i.guild.id);
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
                i.reply({
                  embeds: [new MessageEmbed()
					           .setColor(ee.color)
					           .setTimestamp()
					           .setDescription(`<:paued_button:882546085032243281> **Paused!**`)
					           .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                     ]
                })
              } else {
                //pause the player
                await client.distube.resume(i.guild.id);
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
                i.reply({
                  embeds: [new MessageEmbed()
					           .setColor(ee.color)
					           .setTimestamp()
					           .setDescription(`<:pause_button:882897876005568533> **Resumed!**`)
					           .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                     ]
                })
              }
            }
            //autoplay
            if (i.customId == `4`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              //pause the player
              await newQueue.toggleAutoplay()
              if (newQueue.autoplay) {
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              } else {
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              }
              //Send Success Message
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`<:approved_button:882546061640605736>**${newQueue.autoplay ? `${client.allEmojis.check_mark} Enabled` :`${client.allEmojis.x} Disabled`} Autoplay!**`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
            }
            //Shuffle
            if(i.customId == `5`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              //pause the player
              await newQueue.shuffle()
              //Send Success Message
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`<:shuffle_button:882513339773780019> **Shuffled ${newQueue.songs.length} Songs**`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
            }
            //Songloop
            if(i.customId == `6`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              //Disable the Repeatmode
              if(newQueue.repeatMode == 1){
                await newQueue.setRepeatMode(0)
              } 
              //Enable it
              else {
                await newQueue.setRepeatMode(1)
              }
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`${newQueue.repeatMode == 1 ? `${client.allEmojis.check_mark} **Enabled Song-Loop**`: `${client.allEmojis.x} **Disabled Song-Loop**`}`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Queueloop
            if(i.customId == `7`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              //Disable the Repeatmode
              if(newQueue.repeatMode == 2){
                await newQueue.setRepeatMode(0)
              } 
              //Enable it
              else {
                await newQueue.setRepeatMode(2)
              }
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`${newQueue.repeatMode == 2 ? `${client.allEmojis.check_mark} **Enabled Queue-Loop**`: `${client.allEmojis.x} **Disabled Queue-Loop**`}`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Forward
            if(i.customId == `8`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`<:10forward:887696215943307304> **Forwarded the song for \`10 Seconds\`**`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Rewind
            if(i.customId == `9`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                embeds: [new MessageEmbed()
					       .setColor(ee.color)
					       .setTimestamp()
					       .setDescription(`⏪ **Rewinded the song for \`10 Seconds\`**`)
					       .setFooter(` Action by: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))
                 ]
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Lyrics
            if(i.customId == `10`){let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join a Voice Channel first!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Please join __my__ Voice Channel first! <#${channel.id}>**`,
                  ephemeral: true
                })
              let embeds = [];
              await ksoft.lyrics.get(newQueue.songs[0].name).then(
                async track => {
                    if (!track.lyrics) return i.reply({content: `${client.allEmojis.x} **No Lyrics Found!** :cry:`, ephemeral: true});
                    lyrics = track.lyrics;
                embeds = lyricsEmbed(lyrics, newQueue.songs[0]);
              }).catch(e=>{
                console.log(e)
                return i.reply({content: `${client.allEmojis.x} **No Lyrics Found!** :cry:\n${String(e).substr(0, 1800)}`, ephemeral: true});
              })
              i.reply({
                embeds: embeds, ephemeral: true
              })
            }
          });

          /**
           * @INFORMATION ONCE THE SONG-ENDED, CLEAR THE INTERVAl + EDIT!
           */
          collector.on('end', collected => {
            try {
              clearInterval(songEditInterval);
            } catch (e) {}
            var newQueue = client.distube.getQueue(queue.id)
            var newTrack = newQueue.songs[0];
            var data = receiveQueueData(newQueue, newTrack)
            data.embeds[0].fields = [];
            data.embeds[0].author.iconURL = "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png"
            data.embeds[0].footer.text += "\n⛔️ SONG ENDED!";
            data.components = [];
            currentSongPlayMsg.edit(data).catch((e) => {
              //console.log(e.stack ? String(e.stack).grey : String(e).grey)
            })
          });
        } catch (error) {
          console.error(error)
        }
      })
      .on(`addSong`, (queue, song) => queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
          .setFooter("Requested by " + song.user.tag, song.user.displayAvatarURL({
            dynamic: true
          }))
          .setTitle(`${client.allEmojis.check_mark} **Song added to the Queue!**`)
          .setDescription(`<:playing:887696061001498665> Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\``)
          .addField(`<:clock:887695804146524180> **Estimated Time:**`, `\`${queue.songs.length - 1} song${queue.songs.length > 0 ? "s" : ""}\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\``)
          .addField(`<:queued_button:882907578865180702> **Queue Duration:**`, `\`${queue.formattedDuration}\``)
        ]
      }))
      .on(`addList`, (queue, playlist) => queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
          .setFooter("Requested by" + playlist.user.tag, playlist.user.displayAvatarURL({
            dynamic: true
          }))
          .setTitle(`${client.allEmojis.check_mark} **Playlist added to the Queue!**`)
          .setDescription(`<:NightMusicPFP:882542303636504636> Playlist: [\`${playlist.name}\`](${playlist.url ? playlist.url : ""})  -  \`${playlist.songs.length} Song${playlist.songs.length > 0 ? "s" : ""}\``)
          .addField(`<:queued_button:882907578865180702> **Queue Duration:**`, `\`${queue.formattedDuration}\``)
        ]
      }))
      // DisTubeOptions.searchSongs = true
      .on(`searchResult`, (message, result) => {
        let i = 0
        message.channel.send(`**Choose an option from below**\n${result.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join(`\n`)}\n*Enter anything else or wait 60 seconds to cancel*`)
      })
      // DisTubeOptions.searchSongs = true
      .on(`searchCancel`, message => message.channel.send(`Searching canceled`).catch((e)=>console.log(e)))
      .on(`error`, (channel, e) => {
        channel.send(`An error encountered: ${e}`).catch((e)=>console.log(e))
        console.error(e)
      })
      .on(`empty`, channel => channel.send(`Voice channel is empty! Leaving the channel...`).catch((e)=>console.log(e)))
      .on(`searchNoResult`, message => message.channel.send(`No result found!`).catch((e)=>console.log(e)))
      .on(`finish`, queue => {
        var data = receiveQueueData(queue, queue.previousSongs[0])
        data.embeds[0].fields = [];
        data.embeds[0].author.iconURL = "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png"
        data.embeds[0].footer.text += "\n⛔️ SONG ENDED!";
        data.components = [];
        queue.textChannel.messages.fetch(PlayerMap.get(`currentmsg`)).then(currentSongPlayMsg=>{
          currentSongPlayMsg.edit(data).catch((e) => {
            //console.log(e.stack ? String(e.stack).grey : String(e).grey)
          })
        }).catch((e) => {
          //console.log(e.stack ? String(e.stack).grey : String(e).grey)
        })
        queue.textChannel.send({
          embeds: [
            new MessageEmbed().setColor(ee.color).setFooter(ee.footertext, ee.footericon)
            .setTitle("LEFT THE CHANNEL")
            .setDescription("There are no more songs left")
            .setTimestamp()
          ]
        })
      })
      .on(`initQueue`, queue => {
        try {
          client.settings.ensure(queue.id, {
            defaultvolume: 50,
            defaultautoplay: false,
            defaultfilters: [`bassboost6`, `clear`]
          })
          let data = client.settings.get(queue.id)
          queue.autoplay = Boolean(data.defaultautoplay);
          queue.volume = Number(data.defaultvolume);
          queue.setFilter(data.defaultfilters);
        } catch (error) {
          console.error(error)
        }
      });
  } catch (e) {
    console.log(String(e.stack).bgRed)
  }

  function receiveQueueData(newQueue, newTrack) {
    var djs = client.settings.get(newQueue.id, `djroles`).map(r => `<@&${r}>`);
    if(djs.length == 0 ) djs = "`not setup`";
    else djs.slice(0, 15).join(", ");
    if(!newTrack) return new MessageEmbed().setColor(ee.wrongcolor).setTitle("NO SONG FOUND?!?!")
    var embed = new MessageEmbed().setColor(ee.color)
    .setDescription(`See the [Queue on the **DASHBOARD** Live!](https://nightmusic.rigelop.repl.co/queue/${newQueue.id})`)
      .addField(`<:clock:887695804146524180> Duration:`, `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, true)
      .addField(`<:queued_button:882907578865180702> Queue:`, `>>> \`${newQueue.songs.length} song(s)\`\n\`${newQueue.formattedDuration}\``, true)
      .addField(`<:high_volume_button:882513412188409917> Volume:`, `>>> \`${newQueue.volume} %\``, true)
      .addField(`<:loop_button:882513401937551370> Loop:`, `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${client.allEmojis.check_mark}\` Queue\`` : `${client.allEmojis.check_mark} \`Song\`` : `${client.allEmojis.x}`}`, true)
      .addField(`<:autoplay_button:882546049460342834> Autoplay:`, `>>> ${newQueue.autoplay ? `${client.allEmojis.check_mark}` : `${client.allEmojis.x}`}`, true)
      .addField(`<:download1:887696253952098314> Download Song:`, `>>> [\`Click here\`](${newTrack.streamURL})`, true)
      .addField(`<:filter:887696358268629022> Filter${newQueue.filters.length > 0 ? "s": ""}:`, `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f=>`\`${f}\``).join(`, `)}` : `${client.allEmojis.x}`}`, newQueue.filters.length > 1 ? false : true)
      .setAuthor(`${newTrack.name}`, `https://cdn.discordapp.com/attachments/806389717666758676/887002687902720020/ezgif-7-2294dcab4618.gif`, newTrack.url)
      .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
      .setFooter(`Requested by ${newTrack.user.tag}`, newTrack.user.displayAvatarURL({
        dynamic: true
      }));
    let skip = new MessageButton().setStyle('PRIMARY').setCustomId('1').setEmoji(`<:skipped_button:882546103835299892>`).setLabel(`Skip`)
    let stop = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji(`<:stop_song_button:882513311416066078>`).setLabel(`Stop`)
    let pause = new MessageButton().setStyle('SECONDARY').setCustomId('3').setEmoji('<:paued_button:882546085032243281>').setLabel(`Pause`)
    let autoplay = new MessageButton().setStyle('SUCCESS').setCustomId('4').setEmoji('<:autoplay_button:882546049460342834>').setLabel(`Autoplay`)
    let shuffle = new MessageButton().setStyle('PRIMARY').setCustomId('5').setEmoji('<:shuffle_button:882513339773780019>').setLabel(`Shuffle`)
    if (!newQueue.playing) {
      pause = pause.setStyle('SUCCESS').setEmoji('<:pause_button:88289787600556853>').setLabel(`Resume`)
    }
    if (newQueue.autoplay) {
      autoplay = autoplay.setStyle('SECONDARY')
    }
    let songloop = new MessageButton().setStyle('SUCCESS').setCustomId('6').setEmoji(`<:loop_button:882513401937551370>`).setLabel(`Song`)
    let queueloop = new MessageButton().setStyle('SUCCESS').setCustomId('7').setEmoji(`<:loop_button:882513401937551370>`).setLabel(`Queue`)
    let forward = new MessageButton().setStyle('PRIMARY').setCustomId('8').setEmoji('<:10forward:887696215943307304>').setLabel(`+10 Sec`)
    let rewind = new MessageButton().setStyle('PRIMARY').setCustomId('9').setEmoji('<:10backward:887696396835237918>').setLabel(`-10 Sec`)
    let lyrics = new MessageButton().setStyle('PRIMARY').setCustomId('10').setEmoji('<:song_lyrics_button:882513330462400552>').setLabel(`Lyrics`)
    if (newQueue.repeatMode === 0) {
      songloop = songloop.setStyle('SUCCESS')
      queueloop = queueloop.setStyle('SUCCESS')
    }
    if (newQueue.repeatMode === 1) {
      songloop = songloop.setStyle('SECONDARY')
      queueloop = queueloop.setStyle('SUCCESS')
    }
    if (newQueue.repeatMode === 2) {
      songloop = songloop.setStyle('SUCCESS')
      queueloop = queueloop.setStyle('SECONDARY')
    }
    if (Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled()
    } else {
      rewind = rewind.setDisabled(false)
    }
    if (Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled()
    } else {
      forward = forward.setDisabled(false)
    }
    const row = new MessageActionRow().addComponents([skip, stop, pause, autoplay, shuffle]);
    const row2 = new MessageActionRow().addComponents([songloop, queueloop, forward, rewind, lyrics]);
    return {
      embeds: [embed],
      components: [row, row2]
    };
  }
};