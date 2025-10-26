import { NextRequest, NextResponse } from 'next/server'

// 模拟航班搜索数据
const generateFlights = (from: string, to: string, date: string) => {
  const airlines = [
    { code: 'CA', name: '中国国航', logo: '🛫' },
    { code: 'MU', name: '东方航空', logo: '✈️' },
    { code: 'CZ', name: '南方航空', logo: '🛩️' },
    { code: 'HU', name: '海南航空', logo: '🛫' },
    { code: 'MF', name: '厦门航空', logo: '✈️' },
    { code: 'ZH', name: '深圳航空', logo: '🛩️' }
  ]
  const aircraftTypes = ['A320', 'A321', 'B737', 'B738', 'A330', 'B777']
  
  const flights = []
  const basePrice = Math.floor(Math.random() * 600) + 300
  
  for (let i = 0; i < 10; i++) {
    const airline = airlines[i % airlines.length]
    const departureHour = 6 + Math.floor(Math.random() * 16)
    const departureMinute = Math.floor(Math.random() * 60)
    const flightDuration = 120 + Math.floor(Math.random() * 180) // 2-5小时
    
    const arrivalTime = new Date()
    arrivalTime.setHours(departureHour, departureMinute)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDuration)
    
    const priceVariation = (Math.random() - 0.5) * 300
    const economyPrice = Math.max(300, basePrice + priceVariation)
    
    const punctuality = Math.floor(Math.random() * 30) + 70 // 70-100%
    const isDirectFlight = Math.random() > 0.3 // 70% 直飞
    
    flights.push({
      id: `FL${1000 + i}`,
      flightNumber: `${airline.code}${1000 + Math.floor(Math.random() * 9000)}`,
      airline: airline.name,
      airlineLogo: airline.logo,
      aircraft: aircraftTypes[i % aircraftTypes.length],
      departure: {
        time: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
        airport: from === '上海' ? '浦东T2' : from === '北京' ? '首都T2' : `${from}机场`,
        terminal: `T${Math.floor(Math.random() * 3) + 1}`
      },
      arrival: {
        time: `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`,
        airport: to === '北京' ? '首都T2' : to === '上海' ? '浦东T2' : `${to}机场`,
        terminal: `T${Math.floor(Math.random() * 3) + 1}`
      },
      duration: `${Math.floor(flightDuration / 60)}小时${flightDuration % 60}分钟`,
      price: {
        economy: Math.floor(economyPrice),
        business: Math.floor(economyPrice * 2.2),
        first: Math.floor(economyPrice * 3.8)
      },
      punctuality: punctuality,
      isDirect: isDirectFlight,
      features: [
        ...(Math.random() > 0.3 ? ['有餐食'] : ['无餐食']),
        ...(Math.random() > 0.2 ? ['到达准点率 100%'] : []),
        ...(punctuality > 90 ? ['准点率高'] : []),
        ...(Math.random() > 0.4 ? ['免费托运20kg'] : []),
        ...(Math.random() > 0.6 ? ['优惠退票，退改¥147起'] : []),
        ...(Math.random() > 0.7 ? ['经济舱2.3折'] : []),
        ...(Math.random() > 0.8 ? ['国航新会员价'] : []),
        ...(Math.random() > 0.9 ? ['所有舱位机票非常可订'] : [])
      ],
      cabinClasses: {
        economy: {
          price: Math.floor(economyPrice),
          available: Math.random() > 0.1,
          discount: Math.floor(Math.random() * 5 + 2) / 10, // 0.2-0.7折
          features: ['免费托运20kg', '优惠退票，退改¥147起', `经济舱${Math.floor(Math.random() * 5 + 2)}.${Math.floor(Math.random() * 9)}折`]
        },
        business: {
          price: Math.floor(economyPrice * 2.2),
          available: Math.random() > 0.3,
          features: ['免费托运20kg', '优惠退票，退改¥206起', `经济舱${Math.floor(Math.random() * 3 + 4)}.${Math.floor(Math.random() * 9)}折`]
        }
      },
      promotions: [
        ...(Math.random() > 0.7 ? ['高端超值增值包 +¥40'] : []),
        ...(Math.random() > 0.8 ? ['延误补偿', '24小时退票立减', '40元*1张接送机券'] : []),
        ...(Math.random() > 0.6 ? ['立减', '购50元接送机券', '赠国际300里程'] : [])
      ]
    })
  }
  
  return flights.sort((a, b) => a.departure.time.localeCompare(b.departure.time))
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