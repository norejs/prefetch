import { NextRequest, NextResponse } from 'next/server'

// 模拟航班搜索数据
const generateFlights = (from: string, to: string, date: string) => {
  const airlines = ['中国国航', '东方航空', '南方航空', '海南航空', '厦门航空', '深圳航空']
  const aircraftTypes = ['A320', 'A321', 'B737', 'B738', 'A330', 'B777']
  
  const flights = []
  const basePrice = Math.floor(Math.random() * 800) + 200
  
  for (let i = 0; i < 8; i++) {
    const departureHour = 6 + Math.floor(Math.random() * 16)
    const departureMinute = Math.floor(Math.random() * 60)
    const flightDuration = 120 + Math.floor(Math.random() * 180) // 2-5小时
    
    const arrivalTime = new Date()
    arrivalTime.setHours(departureHour, departureMinute)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDuration)
    
    const priceVariation = (Math.random() - 0.5) * 400
    const price = Math.max(200, basePrice + priceVariation)
    
    flights.push({
      id: `FL${1000 + i}`,
      flightNumber: `${airlines[i % airlines.length].slice(0, 2)}${1000 + Math.floor(Math.random() * 9000)}`,
      airline: airlines[i % airlines.length],
      aircraft: aircraftTypes[i % aircraftTypes.length],
      departure: {
        city: from,
        airport: `${from}首都国际机场`,
        terminal: `T${Math.floor(Math.random() * 3) + 1}`,
        time: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`
      },
      arrival: {
        city: to,
        airport: `${to}机场`,
        terminal: `T${Math.floor(Math.random() * 3) + 1}`,
        time: `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`
      },
      duration: `${Math.floor(flightDuration / 60)}小时${flightDuration % 60}分钟`,
      price: {
        economy: Math.floor(price),
        business: Math.floor(price * 2.5),
        first: Math.floor(price * 4)
      },
      availability: {
        economy: Math.floor(Math.random() * 50) + 10,
        business: Math.floor(Math.random() * 20) + 5,
        first: Math.floor(Math.random() * 10) + 2
      },
      onTime: Math.random() > 0.2, // 80% 准点率
      features: [
        '免费餐食',
        '娱乐系统',
        '免费行李',
        ...(Math.random() > 0.5 ? ['WiFi'] : []),
        ...(Math.random() > 0.7 ? ['充电插座'] : [])
      ]
    })
  }
  
  return flights.sort((a, b) => a.price.economy - b.price.economy)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from') || '北京'
  const to = searchParams.get('to') || '上海'
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const passengers = parseInt(searchParams.get('passengers') || '1')
  const cabinClass = searchParams.get('class') || 'economy'
  
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const flights = generateFlights(from, to, date)
  
  return NextResponse.json({
    success: true,
    searchParams: {
      from,
      to,
      date,
      passengers,
      cabinClass
    },
    flights,
    total: flights.length,
    searchTime: Date.now(),
    message: `找到 ${flights.length} 个航班`
  }, {
    headers: {
      'Cache-Control': 'public, max-age=180', // 3分钟缓存
      'X-API-Source': 'flight-search-api'
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { from, to, date, passengers, cabinClass, returnDate, tripType } = body
  
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  const outboundFlights = generateFlights(from, to, date)
  let returnFlights = []
  
  if (tripType === 'roundTrip' && returnDate) {
    returnFlights = generateFlights(to, from, returnDate)
  }
  
  return NextResponse.json({
    success: true,
    searchParams: {
      from,
      to,
      date,
      returnDate,
      passengers,
      cabinClass,
      tripType
    },
    outboundFlights,
    returnFlights,
    totalOutbound: outboundFlights.length,
    totalReturn: returnFlights.length,
    searchTime: Date.now(),
    message: `找到 ${outboundFlights.length} 个去程航班${returnFlights.length > 0 ? `，${returnFlights.length} 个返程航班` : ''}`
  }, {
    headers: {
      'Cache-Control': 'public, max-age=180',
      'X-API-Source': 'flight-search-api'
    }
  })
}