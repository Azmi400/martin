const Command = require('../../structures/command.js');
const { error } = require('../../util.js');
const { embedColour } = require('../../config.json')
const { createCanvas } = require('canvas');
const { performance } = require('perf_hooks');
const { get } = require('snekfetch');
const { MessageEmbed, MessageAttachment} = require('discord.js');

module.exports = class PixelGenCommand extends Command {
	constructor(group) {
		super({
			name: 'pixelgen',
			description: 'Generate an image using text.',
			aliases: ['pixel', 'gen'],
			example: 'm)gen https://hastebin.com/raw/aduminotiv\n\nor\n\nm)pixelgen #f6f6f6,#000000,#30df8b,#1b9c5e,#ffffff,#eeca85;\n1,1,1,1,1,2,2,2,2,1,1,1,1,1;\n1,1,1,2,2,3,3,3,3,2,2,1,1,1;\n1,1,2,3,3,3,3,3,3,3,3,2,1,1;\n1,2,3,3,3,3,3,3,3,3,3,3,2,1;\n1,2,3,5,2,3,3,3,3,5,2,3,2,1;\n2,3,4,2,2,3,3,3,3,2,2,4,3,2;\n2,3,4,4,3,3,2,2,3,3,4,4,3,2;\n2,3,3,3,3,3,3,3,3,3,3,3,3,2;\n2,3,3,3,3,3,3,3,3,3,3,3,3,2;\n1,2,2,3,3,2,2,2,2,3,3,2,2,1;\n1,2,6,2,2,6,6,6,6,2,2,6,2,1;\n1,2,6,6,6,6,6,6,6,6,6,6,2,1;\n1,1,2,2,2,2,2,2,2,2,2,2,1,1;\n1,1,2,6,6,6,6,6,6,6,6,2,1,1;\n1,1,1,2,6,6,6,6,6,6,2,1,1,1;\n1,1,1,2,6,6,6,6,6,6,2,1,1,1;\n1,1,1,1,2,6,6,6,6,2,1,1,1,1;\n1,1,1,1,2,6,6,6,6,2,1,1,1,1;\n1,1,1,1,1,2,6,6,2,1,1,1,1,1;\n1,1,1,1,1,1,2,2,1,1,1,1,1,1',
			group
		});
	}

	async run(message, args) {
		const pre = await message.channel.send('Generating image!');
		let payload;
		const time1 = performance.now();

		if (message.content.includes('hastebin.com/raw')) {
			const { body } = await get(args);
			payload = body.toString().split(';');
		} else {
			payload = args.split(';');
		}

		const colours = payload[0].split(',');
		const positions = [];
		for (let i = 1; i < payload.length; i++) {
			positions.push(payload[i].split(','))
		}

		const canvas = createCanvas(positions[0].length * 5, positions.length * 5);
		const ctx = canvas.getContext('2d');

		for (let o = 0; o < positions.length; o++) {
			for (let i = 0; i < positions[o].length; i++) {
				const pos = positions[o][i].trim();
				let style = 'rgba(0,0,0,0)';
				if (pos.toLowerCase() !== 't') {
					if (!colours[(pos - 1)]) {
						await pre.delete();
						return error(`Colour in position ${(pos)} does not exist.\nNeed help? Use m)help pixelgen!`, message);
					}
					style = colours[(pos - 1)];
				}
				ctx.fillStyle = style;
				ctx.fillRect(i * 5, o * 5, 5, 5);
			}
		}

		const embed = new MessageEmbed()
			.setColor(embedColour)
			.attachFiles([new MessageAttachment().setFile(canvas.toBuffer()).setName('file.png')])
			.setImage('attachment://file.png')
			.setDescription(`Generated image took: ${Math.round(performance.now() - time1)} milliseconds`);

		await message.channel.send(embed);
		await pre.delete();
	}
};