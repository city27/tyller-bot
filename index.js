const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

// ── CONFIGURAÇÕES ──────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID     = '1502125064919716011';
const SUPABASE_URL  = 'https://zylwrtyzwufqnfkwzjvz.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5bHdydHl6d3VmcW5ma3d6anZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDcyMDMsImV4cCI6MjA5MzcyMzIwM30.nFvYf4vIWmUxZkKLSQuEiaR6mmcGagNOMXf-b9gxN6o';
// ───────────────────────────────────────────────────────────

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Registrar comando /participar
const commands = [
  new SlashCommandBuilder()
    .setName('participar')
    .setDescription('Participar do sorteio de PIX R$ 5,00 todo domingo!')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('sorteio')
    .setDescription('Ver informações sobre o sorteio da Tyller City')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

client.once('ready', async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Comandos registrados com sucesso!');
  } catch (err) {
    console.error('Erro ao registrar comandos:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ── /participar ──
  if (interaction.commandName === 'participar') {
    const discordId   = interaction.user.id;
    const discordNome = interaction.user.username;

    try {
      // Inserir no Supabase (ignora se já existir)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/participantes`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates',
        },
        body: JSON.stringify({ discord_id: discordId, discord_nome: discordNome }),
      });

      if (res.status === 201 || res.status === 200) {
        await interaction.reply({
          content: `🎉 **${discordNome}**, você está inscrito no sorteio!\n\n🏆 **Prêmio:** PIX R$ 5,00\n📅 **Sorteio:** Todo domingo\n\nBoa sorte! 🍀`,
          ephemeral: false,
        });
      } else if (res.status === 409) {
        await interaction.reply({
          content: `⚠️ **${discordNome}**, você já está inscrito no sorteio desta semana!\n\n📅 Aguarde o sorteio de domingo. Boa sorte! 🍀`,
          ephemeral: true,
        });
      } else {
        throw new Error(`Status: ${res.status}`);
      }
    } catch (err) {
      console.error('Erro ao inserir participante:', err);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao te inscrever. Tente novamente em instantes.',
        ephemeral: true,
      });
    }
  }

  // ── /sorteio ──
  if (interaction.commandName === 'sorteio') {
    await interaction.reply({
      content: `🎲 **SORTEIO TYLLER CITY**\n\n💰 **Prêmio:** PIX R$ 5,00\n📅 **Quando:** Todo domingo\n✅ **Como participar:** Digite \`/participar\`\n\n⚠️ Você precisa estar no servidor para receber o prêmio!`,
      ephemeral: false,
    });
  }
});

client.login(DISCORD_TOKEN);
