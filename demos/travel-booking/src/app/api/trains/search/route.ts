import { NextRequest, NextResponse } from 'next/server'

// 模拟火车票搜索数据
const generateTrains = (from: string, to: string, date: string) => {
  const trainTypes = ['G', 'D', 'C', 'K', 'T', 'Z']
  const trainNames = {
    'G': '高速动车',
    'D': '动车',
    'C': '城际',
    'K': '快速',
    'T': '特快',
    'Z': '直达'
  }
  
  const trains = []
  const basePrice = Math.floor(Math.random() * 300) + 200
  
  for (let i = 0; i < 12; i++) {
    const trainType = trainTypes[Math.floor(Math.random() * trainTypes.length)]
    const trainNumber = `${trainType}${100 + Math.floor(Math.random() * 900)}`
    
    const departureHour = 6 + Math.floor(Math.random() * 16)
    const departureMinute = Math.floor(Math.random() * 60)
    const travelDuration = 120 + Math.floor(Math.random() * 300) // 2-7小时
    
    const arrivalTime = new Date()
    arrivalTime.setHours(departureHour, departureMinute)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + travelDuration)
    
    const priceMultiplier = trainType === 'G' ? 1.5 : trainType === 'D' ? 1.2 : 1
    const secondClassPrice = Math.floor(basePrice * priceMultiplier * (0.8 + Math.random() * 0.4))
    const firstClassPrice = Math.floor(secondClassPrice * 1.6)
    const businessPrice = Math.floor(secondClassPrice * 2.8)
    
    const availabilityOptions = ['有', '无', '候补', '紧张']
    
    trains.push({
      id: `train_${i + 1}`,
      trainNumber,
      trainType,
      trainName: trainNames[trainType as keyof typeof trainNames],
      departure: {
        time: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
        station: `${from}站`,
        platform: `${Math.floor(Math.random() * 20) + 1}站台`
      },
      arrival: {
        time: `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}`,
        station: `${to}站`,
        platform: `${Math.floor(Math.random() * 20) + 1}站台`
      },
      duration: `${Math.floor(travelDuration / 60)}小时${travelDuration % 60}分钟`,
      prices: {
        secondClass: secondClassPrice,
        firstClass: firstClassPrice,
        business: businessPrice
      },
      availability: {
        secondClass: availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)],
        firstClass: availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)],
        business: availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)]
      },
      features: [
        ...(Math.random() > 0.7 ? ['平均候补放票'] : []),
        ...(Math.random() > 0.6 ? ['智能动车'] : []),
        ...(Math.random() > 0.8 ? ['静音车厢'] : []),
        ...(Math.random() > 0.5 ? ['WiFi'] : []),
        ...(Math.random() > 0.7 ? ['充电插座'] : [])
      ],
      punctuality: Math.floor(Math.random() * 20) + 80, // 80-100%
      canBook: Math.random() > 0.2 // 80% 可预订
    })
  }
  
  return trains.sort((a, b) => a.departure.time.localeCompare(b.departure.time))
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from') || '上海'
  const to = searchParams.get('to') || '北京'
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const passengers = parseInt(searchParams.get('passengers') || '1')
  
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const trains = generateTrains(from, to, date)
  
  return NextResponse.json({
    success: true,
    searchParams: {
      from,
      to,
      date,
      passengers
    },
    trains,
    total: trains.length,
    searchTime: Date.now(),
    message: `找到 ${trains.length} 趟列车`
  }, {
    headers: {
      'Cache-Control': 'public, max-age=180', // 3分钟缓存
      'X-API-Source': 'train-search-api'
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { from, to, date, passengers, returnDate, tripType } = body
  
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const outboundTrains = generateTrains(from, to, date)
  let returnTrains = []
  
  if (tripType === 'roundTrip' && returnDate) {
    returnTrains = generateTrains(to, from, returnDate)
  }
  
  return NextResponse.json({
    success: true,
    searchParams: {
      from,
      to,
      date,
      returnDate,
      passengers,
      tripType
    },
    outboundTrains,
    returnTrains,
    totalOutbound: outboundTrains.length,
    totalReturn: returnTrains.length,
    searchTime: Date.now(),
    message: `找到 ${outboundTrains.length} 趟去程列车${returnTrains.length > 0 ? `，${returnTrains.length} 趟返程列车` : ''}`
  }, {
    headers: {
      'Cache-Control': 'public, max-age=180',
      'X-API-Source': 'train-search-api'
    }
  })
}