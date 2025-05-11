// scripts/createIndoPakCategory.js
require('dotenv').config()
const mongoose = require('mongoose')
const SpecialCategory = require('../model/specialCategorySchema')

/**
 * Creates the Indo-Pak special category if it doesn't exist
 */
const createIndoPakCategory = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.DATABASE)
    console.log('Connected to MongoDB')

    // Check if the category already exists
    const existingCategory = await SpecialCategory.findOne({ key: 'indo-pak' })

    if (existingCategory) {
      console.log('Indo-Pak category already exists')
      console.log(existingCategory)
      mongoose.disconnect()
      return
    }

    // Calculate dates (1 year from now)
    const now = new Date()
    const oneYearFromNow = new Date(now)
    oneYearFromNow.setFullYear(now.getFullYear() + 1)

    // Create the category
    const indoPakCategory = new SpecialCategory({
      name: 'Indo-Pak',
      key: 'indo-pak',
      description:
        'Updates, analysis, and news about the relationship between India and Pakistan, including border issues, diplomatic relations, and regional developments.',
      icon: '🗞️',
      startDate: now,
      endDate: oneYearFromNow,
      isActive: true,
      displayOrder: 10,
      badgeColor: 'red.500',
      apiEndpoint: '/api/admin/special-categories/fetch-indo-pak',
      apiConfig: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      fetchSchedule: '0 */2 * * *', // Every 2 hours
    })

    await indoPakCategory.save()
    console.log('Indo-Pak category created successfully')
    console.log(indoPakCategory)

    // Disconnect from the database
    mongoose.disconnect()
  } catch (error) {
    console.error('Error creating Indo-Pak category:', error)
    mongoose.disconnect()
    process.exit(1)
  }
}

// Run the script
createIndoPakCategory()
