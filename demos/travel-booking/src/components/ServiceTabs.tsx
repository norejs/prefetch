'use client'

import { Ticket, HelpCircle, Seat, Users } from 'lucide-react'

export default function ServiceTabs() {
  const services = [
    { icon: Ticket, label: '机票订单', href: '/orders' },
    { icon: HelpCircle, label: '航班助手', href: '/assistant' },
    { icon: Seat, label: '在线选座', href: '/seat-selection' },
    { icon: Users, label: '团体票', href: '/group-booking' }
  ]

  return (
    <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
      {services.map((service, index) => (
        <button
          key={index}
          className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
        >
          <service.icon className="w-5 h-5" />
          <span className="text-xs">{service.label}</span>
        </button>
      ))}
    </div>
  )
}