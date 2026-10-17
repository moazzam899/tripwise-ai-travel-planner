
const express = require('express')
const cors = require('cors')
const Groq = require('groq-sdk')
require('dotenv').config()

const app = express()
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TripWise API is running!',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TripWise backend is healthy!',
  })
})



app.post('/api/trips/plan', async (req, res) => {
  try {
    const {
      startingLocation,
      destination,
      departureDate,
      returnDate,
      travelers,
      budget,
      travelStyle,
      interests,
      foodPreference,
      transport,
      pace,
      specialRequirements,
    } = req.body

    if (!startingLocation || !destination || !departureDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Starting location, destination and dates are required.',
      })
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          
content: `You are TripWise, a friendly travel planner.
Write in simple English that is easy to scan.
Keep the itinerary concise and avoid unnecessary details.
Never use Markdown tables or HTML tags.
Use short bullet points and clear headings.
Follow this exact structure:
Your Trip at a Glance
Give destination, dates, travellers and travel style in 3-4 lines.
Your Budget
Give the estimated total and a short list of major expenses.
Clearly state whether the budget is sufficient.
Never invent exact live prices.
Day 1: [Short title]
Morning
Afternoon
Evening
Give only a few practical activities.
Day 2: [Short title]
Use the same Morning, Afternoon and Evening format.
Continue with one section for each actual travel day.
Do not add days beyond the trip duration.
Where to Stay
Suggest suitable areas and hotel types. Do not claim live availability.
Getting Around
Give simple transport tips based on the user's preference.
What to Pack
List only the most useful items.
Before You Go
Give up to five important reminders.
Respect the user's budget, interests, food preference and transport.
Clearly label prices and travel times as estimates.
Never invent verified train schedules or current availability.
Do not guarantee snowfall or adventure activity availability.
For bike rentals, mention licence, helmet, fuel and rental terms.
If the budget is unrealistic, explain why.
Finish with a short reminder to verify schedules and prices before booking.`
,
        },
        {
          role: 'user',
          content: JSON.stringify({
            startingLocation,
            destination,
            departureDate,
            returnDate,
            travelers,
            budget,
            travelStyle,
            interests,
            foodPreference,
            transport,
            pace,
            specialRequirements,
          }),
        },
      ],
      temperature: 0.7,
    })

    res.json({
      success: true,
      message: 'Trip itinerary generated successfully!',
      itinerary: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error('Groq AI error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Could not generate itinerary. Please try again.',
    })
  }
})



app.post('/api/trips/places', async (req, res) => {
  try {
    const { destination, interests, budget, travelers } = req.body

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required.',
      })
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are TripWise, a helpful travel guide.
Suggest places to visit for the given destination.
Write in simple English with clear headings and bullet points.
Include:
1. Top 5 places to visit
2. Activities to try
3. Local food to try
4. Practical travel tips
Consider the user's interests, budget and group size.
Keep the answer concise.
Do not invent live prices, opening hours or availability.
If unsure about a detail, advise the user to verify it.
Do not use Markdown tables or HTML.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            destination,
            interests,
            budget,
            travelers,
          }),
        },
      ],
      temperature: 0.7,
    })

    res.json({
      success: true,
      message: 'Places generated successfully!',
      places: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error('Places API error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Could not find places. Please try again.',
    })
  }
})



app.post('/api/trips/hotels', async (req, res) => {
  try {
    const {
      destination,
      budget,
      travelers,
      travelStyle,
    } = req.body

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required.',
      })
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are TripWise, a helpful travel planner.
Recommend suitable hotel areas and accommodation types for the destination.
Write in simple English with clear headings and bullet points.
Include:
1. Best areas to stay
2. Budget-friendly accommodation options
3. Mid-range accommodation options
4. Premium accommodation options
5. Tips for choosing a hotel
Consider the user's budget, group size and travel style.
Explain that these are general recommendations, not verified hotel listings.
Do not invent specific hotel names, live prices, ratings or availability.
Clearly advise users to verify current prices, reviews and availability before booking.
Keep the answer concise. Do not use Markdown tables or HTML.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            destination,
            budget,
            travelers,
            travelStyle,
          }),
        },
      ],
      temperature: 0.7,
    })

    res.json({
      success: true,
      message: 'Hotel recommendations generated successfully!',
      hotels: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error('Hotels API error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Could not generate hotel recommendations. Please try again.',
    })
  }
})


app.listen(PORT, () => {
  console.log(`TripWise server running on port ${PORT}`)
})
