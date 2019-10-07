const patron = require('patron.js');
const StringUtils = require('../../utils/StringUtils.js');
const Configuration = require('../../utils/Configuration.js');
const ModerationService = require('../../services/ModerationService.js');

class Help extends patron.Command {
    constructor() {
        super({
            names: ['help', 'commands', 'cmds', 'cmd'],
            groupName: 'general',
            description: 'View all of the command information.',
            args: [
                new patron.Argument({
                    name: 'command',
                    key: 'command',
                    type: 'string',
                    defaultValue: patron.ArgumentDefault.Member,
                    example: 'commands',
                    remainder: true
                })
            ]
        });
    }

    async run(msg, args, sender) {
        if (StringUtils.isNullOrWhiteSpace(args.command)) {
            const permLevel = ModerationService.getPermLevel(msg.dbGuild, msg.member);
            const commands = msg.client.registry.commands;
            let generalCommands = [];
            let moderatorCommands = [];
            let adminCommands = [];
            let ownerCommands = [];
            for (let i = 0; i < commands.length; i++) {
                switch (commands[i].group.name) {
                    case 'general':
                        generalCommands.push({"name": '$' + commands[i].names[0], "description": commands[i].description});
                        break;
                    case 'moderator':
                        moderatorCommands.push({ "name": '$' + commands[i].names[0], "description": commands[i].description });
                        break;
                    case 'administrator':
                        adminCommands.push({ "name": '$' + commands[i].names[0], "description": commands[i].description });
                        break;
                    case 'guildowner':
                        ownerCommands.push({ "name": '$' + commands[i].names[0], "description": commands[i].description });
                        break;
                }
            }
            let message= '**General**\n';
            for (let i = 0; i < generalCommands.length; i++) {
                message += '`' + generalCommands[i].name + '` - ' + generalCommands[i].description + '\n';
            }
            if (permLevel >= 1 && moderatorCommands.length > 0) {
                message += '\n**Moderator**\n';
                for (let i = 0; i < moderatorCommands.length; i++) {
                    message += '`' + moderatorCommands[i].name + '` - ' + moderatorCommands[i].description + '\n';
                }
            }

            if (permLevel >= 2 && adminCommands.length > 0) {
                message += '\n**Administrator**';
                for (let i = 0; i < message.length; i++) {
                    message += '`' + adminCommands[i].name + '` - ' + adminCommands[i].description + '\n';
                }
            }

            if (permLevel === 3 && ownerCommands.length > 0) {
                message += '\n**Guild Owner**\n';
                for (let i = 0; i < ownerCommands.length; i++) {
                    message += '`' + ownerCommands[i].name + '` - ' + ownerCommands[i].description + '\n';
                }
            }

            message += '\nYou can find a specific command\'s information by using `$help [Command]`\n\n**Shadow** is made by **Fozzie#0001**, **Brandon14#0131**, **Jayden 🎃#8080**';
            await msg.sender.dm(message);
            return msg.sender.reply('Successfully DMed you all command information.');
        } else {
            args.command = args.command.startsWith(msg.dbGuild.prefix) ? args.command.slice(msg.dbGuild.prefix.length) : args.command;

            const lowerInput = args.command.toLowerCase();

            const command = msg.client.registry.commands.find((x) => x.names.some((y) => y === lowerInput));

            if (command === undefined) {
                return sender.reply('This command does not exist.', { color: Configuration.errorColour });
            }

            return sender.send('**Description:** ' + command.description +  '\n**Usage:** `' + msg.dbGuild.prefix + command.getUsage() + '`\n**Example:** `' + msg.dbGuild.prefix + command.getExample() + '`', { title: StringUtils.upperFirstChar(command.names[0]) });
        }
    }
}

module.exports = new Help();
