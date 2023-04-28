import { DiscordAlert } from '../types';
import {
    DISCORD_CHANNELS,
    SUBGRAPH_LOGO_URL,
} from '../constants';
import { showError } from '../handler/logHandler';
import {
    EmbedBuilder,
    WebhookClient,
} from 'discord.js';
import { config } from 'dotenv';
config();


export const sendDiscordMessage = async (
    alert: DiscordAlert,
    category: string,
    message: string,
) => {
    try {
        const node_env = process.env.NODE_ENV?.toLowerCase() === 'prod' ? 'PROD' : 'TEST';
        const url = DISCORD_CHANNELS[node_env][alert];
        if (typeof url === 'string') {
            const [title, detail = ''] = category.split('\n');
            const webhookClient = new WebhookClient({ url });
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`\`\`\`${message}\`\`\``)
                .setColor(0x00FFFF);
            if (detail) {
                embed.addFields({ name: 'at', value: detail });
            }
            await webhookClient.send({
                username: 'Subgraph',
                avatarURL: SUBGRAPH_LOGO_URL,
                embeds: [embed],
            })
                .catch(err => showError('handler/discordHandler.ts->sendDiscordMessage() 1/2', err))
        } else {
            showError(
                'handler/discordHandler.ts->sendDiscordMessage()',
                'DISCORD_CHANNELS not found in .env'
            );
        }
    } catch (err) {
        showError('handler/discordHandler.ts->sendDiscordMessage() 2/2', err);
    }
}
