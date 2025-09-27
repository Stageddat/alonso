import { ButtonInteraction } from "discord.js";

export default {
  customId: "nextSetupButton",
  execute: async (interaction: ButtonInteraction) => {
    return interaction.reply("egg");
  },
};
