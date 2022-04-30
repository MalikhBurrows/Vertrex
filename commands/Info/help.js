const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const websiteSettings = require("../../dashboard/settings.json");
const {
  MessageButton,
  Discord
} = require("discord.js");
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
module.exports = {
  name: "help", //the command name for execution & for helpcmd [OPTIONAL]

  category: "Info",
  usage: "help [cmdname]",
  aliases: ["h", "halp", "helpme", "hilfe"],

  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Returns all Commmands, or one specific command", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      let prefix = client.settings.get(message.guild.id, "prefix")
      if (args[0] && args[0].length > 0) {
        const embed = new MessageEmbed();
        const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args.toLowerCase()));
        if (!cmd) {
          return message.reply({
            embeds: [embed.setColor(ee.wrongcolor).setDescription(`No Information found for command **${args.toLowerCase()}**`)]
          });
        }
        if (cmd.name) embed.addField("**Command name**", `\`${cmd.name}\``);
        if (cmd.name) embed.setTitle(`Detailed Information about:\`${cmd.name}\``);
        if (cmd.description) embed.addField("**Description**", `\`${cmd.description}\``);
        if (cmd.aliases) embed.addField("**Aliases**", `\`${cmd.aliases.map((a) => `${a}`).join("`, `")}\``);
        if (cmd.cooldown) embed.addField("**Cooldown**", `\`${cmd.cooldown} Seconds\``);
        else embed.addField("**Cooldown**", `\`${settings.default_cooldown_in_sec} Second\``);
        if (cmd.usage) {
          embed.addField("**Usage**", `\`${prefix}${cmd.usage}\``);
          embed.setFooter("Syntax: <> = required, [] = optional");
        }
        return message.reply({
          embeds: [embed.setColor(ee.color)]
        });
      } else {
        const embed = new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(ee.footericon)
          .setTitle("HELP MENU 🔰 Commands")
          .setDescription(`**[Invite me with __Slash Commands__ Permissions](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands), cause all of my Commands are available as Slash Commands too!**\n\n> Check out the [**Dashboard**](${websiteSettings.website.domain}/dashboard/${message.guild.id}) or the [**Live Music Queue**](${websiteSettings.website.domain}/queue/${message.guild.id})`)
          .setFooter(`To see Command Description & Information, type: ${prefix}help [CMD NAME]`, ee.footericon);
        const commands = (category) => {
          return client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
        };
        try {
          for (let i = 0; i < client.categories.length; i += 1) {
            const current = client.categories[i];
            const items = commands(current);
            embed.addField(`**${current.toUpperCase()} [${items.length}]**`, `> ${items.join(", ")}`);
          }
        } catch (e) {
          console.log(String(e.stack).red);
        }
        //---------------------------------------------
        let helpembed = new MessageEmbed()
          .setTitle("<a:help:895267898858287145> Help Menu <a:help:895267898858287145>")
          .setColor(ee.color)
          .setDescription("> Spotify is one of the music bots that has all the features like a powerful dashboard, high quality music streaming! \n\n• **__Command Categories:__**\n\n> <:filter1:895261814059847680> Filters\n\n> <:info1:895261918317674527> Information\n\n> <:music1:895261833118777354> Music\n\n> <:queue1:895261884859678720> Queue\n\n> <:setting1:895261851057786890> Settings\n\n> <:song1:895261007063171164> Song")

          .setFooter(ee.footertext, ee.footericon)
          .setThumbnail("https://cdn.discordapp.com/attachments/882287849498640396/887710938260705330/NightMusicPFP.png")
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895251117372481556/standard_2.gif")
        const accessembed = new MessageEmbed()
          .setTitle(" Error ")
          .setDescription("Only The Message Author Is Allowed to Run THis Command!")
        //---------------------------------------------------------------------------------------------
        const row = new MessageActionRow()
          .addComponents(
            new MessageSelectMenu()
              .setCustomId('select')
              .setPlaceholder('Nothing selected')
              .addOptions([
                {
                  label: 'Home Page',
                  description: 'Starting Help Page',
                  value: 'bts',
                  emoji: '🏠',
                }, {
                  label: 'Filters',

                  value: 'filter',
                  emoji: '895261814059847680',
                },
                {
                  label: 'Information',
 
                  value: 'info',
                  emoji: '895261918317674527',
                },
                {
                  label: 'Music',

                  value: 'music',
                  emoji: '895261833118777354',
                },
                {
                  label: 'Queue',

                  value: 'queue',
                  emoji: '895261884859678720',
                },
                {
                  label: 'Settings',

                  value: 'settings',
                  emoji: '895261851057786890',
                },
                {
                  label: 'Song',

                  value: 'song',
                  emoji: '895261007063171164',
                },

              ]),
          )
        const row2 = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("leftskip")
            .setEmoji("🐼")
            .setStyle("SECONDARY"),
          new MessageButton()
            .setCustomId("leftarrow")
            .setEmoji("🐼")
            .setStyle("SECONDARY"),
          new MessageButton()
            .setCustomId("x")
            .setEmoji("🐼")
            .setStyle("SECONDARY"),
          new MessageButton()
            .setCustomId("right arrow")
            .setEmoji("🐼")
            .setStyle("SECONDARY"),
          new MessageButton()
            .setCustomId("right skip")
            .setEmoji("🐼")
            .setStyle("SECONDARY"),
        )
        const m = await message.reply({
          embeds: [helpembed],
          components: [row,/*row2*/],
        });
        //---------------------------------------------------------------------------------------------------------------------------------------------------
        const filterembed = new MessageEmbed()

          .setColor(ee.color)
          .setDescription("  **<:filter1:895261814059847680> Filter  Commands**\n\n> \` addfilter\`, \`custombassboost\`, \`customspeed\`, \`filters\`, \`removefilter\`, \`setfilter\`")
          .setFooter(ee.footertext, ee.footericon)
          
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895271572733042698/standard_8_1.gif")
        const infoembed = new MessageEmbed()

          .setColor(ee.color)
          .setDescription(" <:info1:895261918317674527> **Info Commands**\n\n> \`botinfo\`, \`commandcount\`, \`dashboard\`, \`help\`, \`invite\`, \`ping\`, \`support\`,\` uptime\`")
          
          .setFooter(ee.footertext, ee.footericon)
          
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895270778830999622/standard_3_1.gif")
        const musicembed = new MessageEmbed()

          .setColor(ee.color)
          .setDescription(" <:music1:895261833118777354> **Music Commands**\n\n> \`addrelated\`, \`autoplay\`, \`mix\`, \`pause\`, \`play\`, \`playskip\`, \`playtop\`, \`resume\`, \`skip\`, \`stop\`")
          
          .setFooter(ee.footertext, ee.footericon)
          
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895270954828197938/standard_4_1.gif")
        const queueembed = new MessageEmbed()

          .setColor(ee.color)
          .setDescription("<:queue1:895261884859678720> **Queue Commands**\n\n> \`clear\`, \`jump\`, \`list\`, \`loop\`, \`move\`, \`previous\`, \`remove\`, \`shuffle\`, \`status\`,\` volume\`")
          
          .setFooter(ee.footertext, ee.footericon)
          
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895271156792328192/standard_5_1.gif")
        const settingsembed = new MessageEmbed()

          .setColor(ee.color)
          .setDescription("  **<:setting1:895261851057786890> Settings Commands**\n\n> \`botchat\`, \`defaultautoplay\`, \`defaultvolume\`, \`dj\`, \`prefix\`")
          
          .setFooter(ee.footertext, ee.footericon)
          
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895271357259071548/standard_6_1.gif")
        const songsembed = new MessageEmbed()

          .setColor(ee.color)
          .setDescription(" **<:song1:895261007063171164> Song Commands**\n\n> \`addend\`, \`forward\`,\` grab\`, \`lyrics\`,\` nowplaying\`, \`replay\`, \`rewind\`,\`seek\` ")
          .setFooter(ee.footertext, ee.footericon)
          
          .setImage("https://cdn.discordapp.com/attachments/882287849498640396/895270717787111454/standard_7_1.gif")
        const collector = m.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 60000 });
        collector.on('collect', async i => {
          if (i.values[0] === 'bts') {
            i.update({ embeds: [helpembed], })
          }
          if (i.values[0] === 'filter') {
            i.update({ embeds: [filterembed], })
          }
          if (i.values[0] === 'info') {
            i.update({ embeds: [infoembed], })
          }
          if (i.values[0] === 'music') {
            i.update({ embeds: [musicembed], })
          }
          if (i.values[0] === 'queue') {
            i.update({ embeds: [queueembed], })
          }
          if (i.values[0] === 'settings') {
            i.update({ embeds: [settingsembed], })
          }
          if (i.values[0] === 'song') {
            i.update({ embeds: [songsembed], })
          }
        })
      }
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.reply({
        embeds: [new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle(`${client.allEmojis.x} ERROR | An error occurred`)
          .setDescription(`\`\`\`${e.message ? String(e.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
        ]
      });
    }
  }
} 