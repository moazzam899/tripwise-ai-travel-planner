
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

function App() {
  const [form, setForm] = useState({
    startingLocation: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    travelers: '2',
    budget: '30000',
    travelStyle: 'Comfortable',
    interests: [],
foodPreference: 'No preference',
transport: 'AI recommendation',
pace: 'Balanced',
specialRequirements: '',
  })
  const [darkMode, setDarkMode] = useState(
  () => localStorage.getItem('tripwise-theme') === 'dark',
)

const [backendStatus, setBackendStatus] = useState('Checking backend...')

const [itinerary, setItinerary] = useState('')
const [isPlanning, setIsPlanning] = useState(false)


const [expandedDays, setExpandedDays] = useState({})


const [savedTrips, setSavedTrips] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('tripwise-saved-trips')) || []
  } catch {
    return []
  }
})


const [places, setPlaces] = useState('')
const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
const [placesError, setPlacesError] = useState('')

const [hotels, setHotels] = useState('')
const [isLoadingHotels, setIsLoadingHotels] = useState(false)
const [hotelsError, setHotelsError] = useState('')

useEffect(() => {
  async function checkBackend() {
    try {
      const response = await fetch('http://localhost:5000/api/health')
      const data = await response.json()

      setBackendStatus(data.message)
    } catch (error) {
      setBackendStatus('Backend connection failed')
      console.error('Backend error:', error)
    }
  }

  checkBackend()
}, [])


useEffect(() => {
  localStorage.setItem('tripwise-saved-trips', JSON.stringify(savedTrips))
}, [savedTrips])



function toggleTheme() {
  setDarkMode((previous) => {
    const next = !previous
    localStorage.setItem('tripwise-theme', next ? 'dark' : 'light')
    return next
  })
}

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-teal-400 ${
  darkMode
    ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400'
    : 'border-sky-100 bg-white text-slate-800 placeholder:text-slate-400'
}`

 
function handleChange(event) {
  const { name, value, type, checked } = event.target

  if (type === 'checkbox') {
    setForm((previousForm) => ({
      ...previousForm,
      interests: checked
        ? [...previousForm.interests, value]
        : previousForm.interests.filter((item) => item !== value),
    }))
    return
  }

  setForm((previousForm) => ({
    ...previousForm,
    [name]: value,
  }))
}


 

async function handleSubmit(event) {
  event.preventDefault()

  if (!form.startingLocation || !form.destination ||
      !form.departureDate || !form.returnDate) {
    alert('Please fill in your locations and travel dates.')
    return
  }

  if (new Date(form.returnDate) < new Date(form.departureDate)) {
    alert('Return date cannot be before departure date.')
    return
  }

  setIsPlanning(true)
  setItinerary('')

  try {
    const response = await fetch('http://localhost:5000/api/trips/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate itinerary')
    }

    setItinerary(data.itinerary)
  } catch (error) {
    console.error('Trip planning error:', error)
    alert(error.message || 'Could not connect to the server.')
  } finally {
    setIsPlanning(false)
  }
}



const handleSaveTrip = () => {
  if (!itinerary) {
    alert('Please generate a trip itinerary first.')
    return
  }

  const alreadySaved = savedTrips.some(
    (trip) =>
      trip.destination === form.destination &&
      trip.departureDate === form.departureDate &&
      trip.returnDate === form.returnDate
  )

  if (alreadySaved) {
    alert('This trip is already saved!')
    return
  }

  const newTrip = {
    id: Date.now(),
    destination: form.destination,
    startingLocation: form.startingLocation,
    departureDate: form.departureDate,
    returnDate: form.returnDate,
    form: { ...form },
    itinerary,
  }

  setSavedTrips((previousTrips) => [newTrip, ...previousTrips])
  alert('Trip saved successfully!')
}


const handleFindPlaces = async () => {
  setIsLoadingPlaces(true)
  setPlacesError('')
  setPlaces('')

  try {
    const response = await fetch('http://localhost:5000/api/trips/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: form.destination,
        interests: form.interests,
        budget: form.budget,
        travelers: form.travelers,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Could not find places.')
    }

    setPlaces(data.places)
  } catch (error) {
    setPlacesError(
  error instanceof TypeError
    ? 'Unable to connect to the server. Please make sure the backend is running.'
    : error.message || 'Unable to load places. Please try again.'
)
  } finally {
    setIsLoadingPlaces(false)
  }
}



const handleFindHotels = async () => {
  setIsLoadingHotels(true)
  setHotelsError('')
  setHotels('')

  try {
    const response = await fetch('http://localhost:5000/api/trips/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: form.destination,
        budget: form.budget,
        travelers: form.travelers,
        travelStyle: form.travelStyle,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Could not get hotel recommendations.')
    }

    setHotels(data.hotels)
  } catch (error) {
  setHotelsError(
  error instanceof TypeError
    ? 'Unable to connect to the server. Please make sure the backend is running.'
    : error.message || 'Unable to load hotel recommendations. Please try again.'
)
} finally {
    setIsLoadingHotels(false)
  }
}



const tripSummary = [
  {
    label: 'Destination',
    value: form.destination || 'Not selected',
    icon: '📍',
  },
  {
    label: 'Travel Dates',
    value:
      form.departureDate && form.returnDate
        ? `${form.departureDate} → ${form.returnDate}`
        : 'Not selected',
    icon: '📅',
  },
  {
    label: 'Travelers',
    value: `${form.travelers} traveler(s)`,
    icon: '👥',
  },
  {
    label: 'Budget',
    value: `₹${Number(form.budget || 0).toLocaleString('en-IN')}`,
    icon: '💰',
  },
]



  const duration =
    form.departureDate && form.returnDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(form.returnDate) - new Date(form.departureDate)) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null

  return (
    <div
    
  className={`min-h-screen transition-colors duration-300 ${
    darkMode
  ? 'bg-slate-900 text-slate-100'
  : 'bg-[#fff8ed] text-[#172554]'
  }`}
>
  
<nav className={`flex items-center justify-between border-b px-5 py-4 md:px-12 transition-colors duration-300 ${
  darkMode
    ? 'border-slate-700 bg-slate-900 text-[#fff8ed]'
    : 'border-[#e7dfd3] bg-white/95 text-[#172554]'
}`}>        <a href="#" className="text-2xl font-extrabold tracking-tight">
          Trip<span className="text-[#fb7185]">Wise</span>
          <span className="ml-2 hidden text-xs font-normal tracking-normal text-slate-400 sm:inline">
            Plan · Explore · Experience
          </span>
        </a>

        <button
  type="button"
  onClick={toggleTheme}
  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
>
  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
</button>
      </nav>

      <section
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
           `linear-gradient(90deg, ${
  darkMode
    ? 'rgba(15,23,42,0.97) 0%, rgba(23,37,84,0.88) 48%, rgba(23,37,84,0.35) 100%'
    : 'rgba(255,248,237,0.97) 0%, rgba(255,248,237,0.86) 48%, rgba(255,248,237,0.25) 100%'
}), url('/images/hero-beach.jpg')`
        }}
      >
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-5 sm:pb-14 sm:pt-16 md:px-10 md:pb-20 md:pt-24">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#fb7185]">
              Your next adventure awaits
            </p>

            <h1 className={`text-4xl font-extrabold leading-tight tracking-tight md:text-6xl ${
  darkMode ? 'text-[#fff8ed]' : 'text-[#172554]'
}`}>
              The world is waiting.
              <span className="block text-[#fb7185]">
                Let's explore it.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
              Tell us where you want to go. Get a personalized itinerary,
              travel suggestions, and a budget plan made around you.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-medium text-slate-700">
              <span className="rounded-full bg-white/90 px-4 py-2 shadow-sm">
                🏔️ Discover places
              </span>
              <span className="rounded-full bg-white/90 px-4 py-2 shadow-sm">
                🧭 Plan your days
              </span>
              <span className="rounded-full bg-white/90 px-4 py-2 shadow-sm">
                💰 Manage budget
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-5 md:px-8 md:pb-16">
        <form
          onSubmit={handleSubmit}
className={`relative -mt-5 rounded-3xl border p-4 sm:p-6 shadow-xl transition-colors duration-300 md:-mt-10 md:p-10 ${
  darkMode
    ? 'border-slate-700 bg-slate-900 shadow-black/20'
    : 'border-[#e7dfd3] bg-white shadow-orange-100/70'
}`}        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
              🗺️
            </div>
            <div>
              <h2
  className={`text-2xl font-bold ${
    darkMode ? 'text-white' : 'text-slate-900'
  }`}
>
  Plan your trip
</h2>
              <p className="mt-1 text-sm text-slate-500">
                A few details to start your next adventure.
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Starting location
              </label>
              <input
                name="startingLocation"
                value={form.startingLocation}
                onChange={handleChange}
                placeholder="e.g. Lucknow"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Destination
              </label>
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g. Manali"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Departure date
              </label>
              <input
                type="date"
                name="departureDate"
                value={form.departureDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Return date
              </label>
              <input
                type="date"
                name="returnDate"
                value={form.returnDate}
                onChange={handleChange}
                min={form.departureDate || undefined}
                required
                className={inputClass}
              />
            </div>

            {duration !== null && (
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 md:col-span-2">
                <p className="text-sm font-medium text-teal-700">
                  🗓️ Your adventure
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {duration} days of exploring
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Number of travelers
              </label>
              <select
                name="travelers"
                value={form.travelers}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="1">1 traveler</option>
                <option value="2">2 travelers</option>
                <option value="3">3 travelers</option>
                <option value="4">4 travelers</option>
                <option value="5">5 travelers</option>
                <option value="6+">6+ travelers</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Total trip budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min="1"
                required
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Your travel style
              </label>
              <select
                name="travelStyle"
                value={form.travelStyle}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Budget">🎒 Budget-friendly</option>
                <option value="Comfortable">🏕️ Comfortable</option>
                <option value="Luxury">✨ Luxury</option>
              </select>
            </div>
          </div>


<div className="space-y-6 border-t border-slate-100 pt-6 md:col-span-2">
  <div>
    <h3
  className={`font-bold ${
    darkMode ? 'text-white' : 'text-slate-900'
  }`}
>
  What do you love exploring?
</h3>
    <p
  className={`mt-1 text-sm ${
    darkMode ? 'text-slate-300' : 'text-slate-500'
  }`}
>
  Select all the interests that match your trip.
</p>

    <div className="mt-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {[
        'Nature',
        'Adventure',
        'History & Culture',
        'Local Food',
        'Shopping',
        'Nightlife',
        'Photography',
        'Relaxation',
        'Spiritual',
      ].map((interest) => (
        <label
          key={interest}
className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition hover:border-teal-400 ${
  darkMode
    ? 'border-slate-600 bg-slate-800 text-slate-100'
    : 'border-sky-100 bg-slate-50 text-slate-800'
}`}        >
          <input
            type="checkbox"
            value={interest}
            checked={form.interests.includes(interest)}
            onChange={handleChange}
            className="accent-teal-700"
          />
          {interest}
        </label>
      ))}
    </div>
  </div>

  <div className="grid gap-5 md:grid-cols-2">
    <div>
      <label className="mb-2 block text-sm font-semibold">
        Food preference
      </label>
      <select
        name="foodPreference"
        value={form.foodPreference}
        onChange={handleChange}
        className={inputClass}
      >
        <option>No preference</option>
        <option>Vegetarian</option>
        <option>Non-vegetarian</option>
        <option>Vegan</option>
        <option>Jain</option>
      </select>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold">
        Preferred transport
      </label>
      <select
        name="transport"
        value={form.transport}
        onChange={handleChange}
        className={inputClass}
      >
        <option>AI recommendation</option>
        <option>Train</option>
        <option>Flight</option>
        <option>Bus</option>
        <option>Car</option>
        <option value="Bike">Bike</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <label className="mb-2 block text-sm font-semibold">
        Trip pace
      </label>
      <select
        name="pace"
        value={form.pace}
        onChange={handleChange}
        className={inputClass}
      >
        <option>Relaxed</option>
        <option>Balanced</option>
        <option>Packed with activities</option>
      </select>
    </div>
  </div>
</div>


<div>
  <label className="mb-2 block text-sm font-semibold">
    Anything else we should know?
  </label>

  <textarea
    name="specialRequirements"
    value={form.specialRequirements}
    onChange={handleChange}
    placeholder="e.g. I want to see snowfall, prefer quiet places, avoid expensive activities..."
    rows={4}
    className={`${inputClass} resize-y`}
  />

  <p className="mt-2 text-xs text-slate-500">
    Add your special requests, places to avoid, dietary needs, or other preferences.
  </p>
</div>


          <button
            type="submit"
            className="mt-8 w-full rounded-xl bg-[#fb7185] px-6 py-4 font-bold text-[#172554] shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-[#fda4af] active:scale-[0.99]"
          >
            ✨ Create my trip →
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Your journey, your preferences, your adventure.
          </p>
        </form>

        <section className="grid gap-4 py-12 sm:grid-cols-3">
          <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
  darkMode
    ? 'border-slate-700 bg-slate-900'
    : 'border-[#e7dfd3] bg-white'
}`}>
            <span className="text-3xl">🧭</span>
            <h3 className="mt-4 font-bold">Personalized itineraries</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Discover day-by-day plans tailored to your interests.
            </p>
          </div>

          <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
  darkMode
    ? 'border-slate-700 bg-slate-900'
    : 'border-[#e7dfd3] bg-white'
}`}>
            <span className="text-3xl">💰</span>
            <h3 className="mt-4 font-bold">Smart budget planning</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Plan spending for stays, transport, food, and activities.
            </p>
          </div>

          <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
  darkMode
    ? 'border-slate-700 bg-slate-900'
    : 'border-[#e7dfd3] bg-white'
}`}>
            <span className="text-3xl">💚</span>
            <h3 className="mt-4 font-bold">Made for you</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Build a journey around your own travel style.
            </p>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
          TripWise · Make every journey count.
        </footer>


{isPlanning && (
  <div className="mx-auto my-8 max-w-4xl rounded-2xl bg-teal-50 p-6 text-center text-teal-800">
    <p className="animate-pulse text-lg font-semibold">
      ✨ TripWise AI is planning your trip...
    </p>
    <p className="mt-2 text-sm">
      Finding activities and preparing your itinerary.
    </p>
  </div>
)}

{itinerary && (
  <div className="mx-auto my-6 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {tripSummary.map((item) => (
      <div
        key={item.label}
        className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 ${
          darkMode
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-[#e7dfd3] bg-white text-[#172554]'
        }`}
      >
        <div className="mb-3 text-2xl">{item.icon}</div>

        <p className="mb-1 text-sm opacity-70">
          {item.label}
        </p>

        <p className="wrap-break-word font-bold">
          {item.value}
        </p>
      </div>
    ))}
  </div>
)}



<section
  className={`mx-auto my-8 max-w-4xl rounded-2xl p-6 shadow-lg ${
    darkMode
      ? 'bg-slate-900 text-slate-100'
      : 'bg-white text-slate-800'
  }`}
>
  <h2 className="mb-2 text-2xl font-bold">
    📍 Explore Places
  </h2>

  <p className="mb-5 text-sm opacity-75">
    Discover places, activities and local food at your destination.
  </p>

  <button
    type="button"
    onClick={handleFindPlaces}
    disabled={isLoadingPlaces || !form.destination}
    className="rounded-xl bg-[#fb7185] px-5 py-3 font-semibold text-[#172554] transition hover:bg-[#fda4af] disabled:cursor-not-allowed disabled:opacity-50"  >
    {isLoadingPlaces ? (
  <span className="inline-flex items-center gap-2">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#172554]/30 border-t-[#172554]" />
    Finding places...
  </span>
) : (
  '✨ Find Places to Visit'
)}
  </button>

  
{placesError && (
  <div className="mt-4">
    <p className="text-sm text-red-500">
      {placesError}
    </p>

    <button
      type="button"
      onClick={handleFindPlaces}
      disabled={isLoadingPlaces || !form.destination}
      className="mt-3 rounded-lg bg-[#fb7185] px-4 py-2 text-sm font-semibold text-[#172554] transition hover:bg-[#fda4af] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Try Again
    </button>
  </div>
)}


  
{places && (
  <div
    className={`mt-6 rounded-xl border p-5 ${
      darkMode
        ? 'border-slate-700 bg-slate-800 text-slate-100'
        : 'border-slate-200 bg-slate-50 text-slate-800'
    }`}
  >
    <div className="space-y-4">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 text-2xl font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-xl font-bold text-teal-600">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-7">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="leading-7">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
        }}
      >
        {places}
      </ReactMarkdown>
    </div>
  </div>
)}

</section>



<section
  className={`mx-auto my-8 max-w-4xl rounded-2xl p-6 shadow-lg ${
    darkMode
      ? 'bg-slate-900 text-slate-100'
      : 'bg-white text-slate-800'
  }`}
>
  <h2 className="mb-2 text-2xl font-bold">
    🏨 Hotel Recommendations
  </h2>

  <p className="mb-5 text-sm opacity-75">
    Find accommodation areas and hotel types that suit your budget and travel style.
  </p>

  <button
    type="button"
    onClick={handleFindHotels}
    disabled={isLoadingHotels || !form.destination}
    className="rounded-xl bg-[#fb7185] px-5 py-3 font-semibold text-[#172554] transition hover:bg-[#fda4af] disabled:cursor-not-allowed disabled:opacity-50"  >
    {isLoadingHotels ? (
  <span className="inline-flex items-center gap-2">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#172554]/30 border-t-[#172554]" />
    Finding hotels...
  </span>
) : (
  '✨ Find Hotel Recommendations'
)}
  </button>

  
{hotelsError && (
  <div className="mt-4">
    <p className="text-sm text-red-500">
      {hotelsError}
    </p>

    <button
      type="button"
      onClick={handleFindHotels}
      disabled={isLoadingHotels || !form.destination}
      className="mt-3 rounded-lg bg-[#fb7185] px-4 py-2 text-sm font-semibold text-[#172554] transition hover:bg-[#fda4af] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Try Again
    </button>
  </div>
)}


  {hotels && (
    <div
      className={`mt-6 rounded-xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800 text-slate-100'
          : 'border-slate-200 bg-slate-50 text-slate-800'
      }`}
    >
      <div className="space-y-4">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="mb-3 text-2xl font-bold">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-3 mt-5 text-xl font-bold text-teal-600">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 leading-7">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="leading-7">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
          }}
        >
          {hotels}
        </ReactMarkdown>
      </div>
    </div>
  )}
</section>




{itinerary && (
  <section
    className={`mx-auto my-8 max-w-4xl rounded-2xl p-6 shadow-lg ${
      darkMode
        ? 'bg-slate-900 text-slate-100'
        : 'bg-white text-slate-800'
    }`}
  >
    
<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
  <div>
    <h2 className="text-2xl font-bold">
      ✈️ Your Travel Plan
    </h2>
    <p className="mt-1 text-sm opacity-70">
      Your personalized itinerary, made simple.
    </p>
  </div>

  <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
    AI Generated
  </span>
</div>


    

<div className="space-y-4">
  {itinerary
    .replace(/\\([*_#`])/g, '$1')
    .split(/(?=^\s*(?:#{2,3}\s*)?Day\s+\d+\s*:)/im)
    .map((section, index) => {
      const isDay = /^\s*(?:#{2,3}\s*)?Day\s+\d+\s*:/im.test(section.trim())

      if (!isDay) {
        return (
          <div key={index} className="leading-7">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-4 mt-6 text-3xl font-bold">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-3 mt-6 text-2xl font-bold text-teal-600">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-4 text-lg font-semibold">
                    {children}
                  </h3>
                ),
                p: ({ children }) => <p className="mb-3">{children}</p>,
                ul: ({ children }) => (
                  <ul className="mb-4 list-disc space-y-2 pl-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 list-decimal space-y-2 pl-6">
                    {children}
                  </ol>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold">{children}</strong>
                ),
              }}
            >
              {section}
            </ReactMarkdown>
          </div>
        )
      }

      const dayNumber = section.match(/^\s*(?:#{2,3}\s*)?Day\s+(\d+)\s*:/im)?.[1]
      const isExpanded = expandedDays[dayNumber] ?? dayNumber === '1'

      return (
        <div
          key={index}
          className={`overflow-hidden rounded-xl border ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() =>
              setExpandedDays((previous) => ({
                ...previous,
                [dayNumber]: !isExpanded,
              }))
            }
            className={`flex w-full items-center justify-between gap-3 p-4 text-left ${
              darkMode
                ? 'bg-slate-800 hover:bg-slate-700'
                : 'bg-[#fff0e8] hover:bg-[#ffe0d2] text-[#172554]'
            }`}
          >
            <span className="font-bold">
  🗓️ {section.match(/^#{2,3}\s+(.+)$/m)?.[1] || `Day ${dayNumber}`}
</span>
            <span>{isExpanded ? '−' : '+'}</span>
          </button>

          {isExpanded && (
            <div className="p-4 leading-7">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-4 text-xl font-bold text-[#fb7185]">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 text-lg font-semibold">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => <p className="mb-3">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="mb-4 list-disc space-y-2 pl-6">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 list-decimal space-y-2 pl-6">
                      {children}
                    </ol>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold">{children}</strong>
                  ),
                }}
              >
                {section.replace(/^\s*#{2,3}\s+Day\s+\d+\s*:[^\n]*\n?/m, '')}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )
    })}
</div>




<button
  type="button"
  onClick={handleSaveTrip}
  className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
>
  {savedTrips.some(
    (trip) =>
      trip.destination === form.destination &&
      trip.departureDate === form.departureDate &&
      trip.returnDate === form.returnDate
  )
    ? '✓ Trip Saved'
    : '💾 Save Trip'}
</button>



  </section>
)}


{savedTrips.length > 0 && (
  <section
    className={`mx-auto my-8 max-w-4xl rounded-2xl p-6 shadow-lg ${
      darkMode
        ? 'bg-slate-900 text-slate-100'
        : 'bg-white text-slate-800'
    }`}
  >
    <h2 className="mb-5 text-2xl font-bold">
      🧳 My Saved Trips
    </h2>

    <div className="space-y-4">
      {savedTrips.map((trip) => (
        <div
          key={trip.id}
          className={`rounded-xl border p-4 ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <h3 className="text-lg font-bold">
            ✈️ {trip.startingLocation} → {trip.destination}
          </h3>

          <p className="mt-2 text-sm opacity-80">
            {trip.departureDate} to {trip.returnDate}
          </p>

          <p className="mt-2 text-sm">
            {trip.form.travelStyle} · {trip.form.travelers} traveler(s)
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setForm({ ...trip.form })
                setItinerary(trip.itinerary)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="rounded-lg bg-[#fb7185] px-4 py-2 font-semibold text-[#172554] transition hover:bg-[#fda4af]"
            >
              View Trip
            </button>

            <button
              type="button"
              onClick={() => {
                setSavedTrips((previousTrips) =>
                  previousTrips.filter((item) => item.id !== trip.id)
                )
              }}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}


      </main>
      
    </div>
    
  )
}

export default App
