const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../config.env') });

const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema');
const Inventory = require('../model/inventorySchema');
const Ability = require('../model/abilitySchema');

const POWERUPS = {
  TIME_WARP: { name: 'Time Warp', type: 'POWER_UP', description: 'Forge: +15s Active | Quiz: +15s Passive', cost: 10 },
  SCORE_SURGE: { name: 'Score Surge', type: 'POWER_UP', description: 'Forge: 2x Points Active | Quiz: 1.1x RQM Passive', cost: 25 },
  ORACLES_EYE: { name: "Oracle's Eye", type: 'POWER_UP', description: 'Remove 2 wrong options', cost: 20 },

  STREAK_SHIELD: { name: 'Streak Shield', type: 'BOOST', description: 'Prevent streak reset on error', cost: 15 },
  PRECISION_PROTOCOL: { name: 'Precision Protocol', type: 'BOOST', description: '+50 RQM if 100% Accuracy', cost: 15 },
};

const seedPowerups = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to DB');

    // 1. Ensure Ability Documents Exist
    console.log('Ensuring Ability definitions exist...');
    const abilityDocs = {};

    for (const [key, def] of Object.entries(POWERUPS)) {
        // Check if exists (by name) - generic template
        // Note: The Ability schema has a 'user' field, implying abilities are user-specific instances?
        // OR there are "template" abilities with user=null?
        // Let's check if we can find a template or create one.
        // If the schema requires 'user', we might need to create one per user.
        // However, usually games have "Item Definitions".
        // Looking at the schema, 'user' is optional (not required: true).

        let ability = await Ability.findOne({ name: def.name, user: null });

        if (!ability) {
            console.log(`Creating template for ${def.name}...`);
            ability = await Ability.create({
                name: def.name,
                description: def.description,
                type: def.type,
                user: null, // Template
                icon: null // You might want to add icons later
            });
        }
        abilityDocs[key] = ability;
    }

    // 2. Find Battle Participants
    const battle = await QuickClashTeamBattle.findOne().sort({ createdAt: -1 });
    if (!battle) {
        console.log('No battle found.');
        process.exit(1);
    }
    console.log(`Found battle: ${battle._id}`);

    const allMembers = [
        ...battle.teamAMembers.map(m => m.user),
        ...battle.teamBMembers.map(m => m.user)
    ];

    console.log(`Found ${allMembers.length} participants.`);

    // 3. Seed Inventory for each user
    for (const userId of allMembers) {
        console.log(`Seeding inventory for user ${userId}...`);

        let inventory = await Inventory.findOne({ user: userId });
        if (!inventory) {
            console.log(`Creating new inventory for ${userId}...`);
            inventory = await Inventory.create({ user: userId, abilities: [] });
        }

        // Add 5 of each powerup
        for (const [key, abilityDoc] of Object.entries(abilityDocs)) {
            // Check if user already has this ability
            const existingItemIndex = inventory.abilities.findIndex(
                item => item.abilityId.toString() === abilityDoc._id.toString()
            );

            if (existingItemIndex > -1) {
                // Update quantity
                inventory.abilities[existingItemIndex].quantity = 5;
            } else {
                // Add new item
                inventory.abilities.push({
                    abilityId: abilityDoc._id,
                    quantity: 5,
                    acquiredAt: new Date()
                });
            }
        }

        await inventory.save();
    }

    // 4. Clear Team Pools and Loadouts (to test donation flow fresh)
    await QuickClashTeamBattle.updateOne(
        { _id: battle._id },
        {
            $set: {
                "teamAPool": { items: [], housingUsed: 0 },
                "teamBPool": { items: [], housingUsed: 0 },
                "teamAMembers.$[].loadout": { items: [], housingUsed: 0 },
                "teamBMembers.$[].loadout": { items: [], housingUsed: 0 }
            }
        }
    );

    console.log('-----------------------------------');
    console.log('✅ User Inventories Seeded!');
    console.log('✅ Team Pools & Loadouts Cleared!');
    console.log('-----------------------------------');
    console.log('You can now:');
    console.log('1. Open the Donation Modal');
    console.log('2. See your inventory populated');
    console.log('3. Donate items to the Team Pool');
    console.log('4. Equip items from the Pool to your Loadout');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding powerups:', err);
    process.exit(1);
  }
};

seedPowerups();
