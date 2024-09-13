<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trip.com 旅行预订</title>
    <script src="https://unpkg.com/react/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <style>
        body { font-family: 'Noto Sans SC', sans-serif; }
        .clickable { transition: all 0.3s ease; }
        .clickable:hover { transform: scale(1.05); }
        .clickable:active { transform: scale(0.95); }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const CitySelector = ({ value, onChange, placeholder }) => (
            <select 
                className="text-xl font-bold bg-transparent border-none focus:outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">{placeholder}</option>
                <option value="上海">上海</option>
                <option value="北京">北京</option>
                <option value="广州">广州</option>
                <option value="深圳">深圳</option>
                <option value="成都">成都</option>
            </select>
        );

        const DatePicker = ({ value, onChange }) => (
            <input 
                type="date" 
                className="text-lg bg-transparent border-none focus:outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );

        const App = () => {
            const [selectedTab, setSelectedTab] = React.useState('机票');
            const [travelType, setTravelType] = React.useState('因公出行');
            const [tripType, setTripType] = React.useState('单程');
            const [departureCity, setDepartureCity] = React.useState('上海');
            const [arrivalCity, setArrivalCity] = React.useState('北京');
            const [travelDate, setTravelDate] = React.useState(() => {
                const today = new Date();
                return today.toISOString().split('T')[0];
            });

            const swapCities = () => {
                const temp = departureCity;
                setDepartureCity(arrivalCity);
                setArrivalCity(temp);
            };

            return (
                <div className="max-w-md mx-auto bg-gray-100">
                    <div className="bg-yellow-50 p-4 relative">
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1">境外热门</div>
                        <div className="text-lg font-bold mb-1">遨游兰德</div>
                        <div className="text-xl font-bold text-blue-900 mb-2">热门酒店超值订</div>
                        <button className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm clickable hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50" onClick={() => alert('正在查看热门酒店...')}>立即查看 GO&gt;</button>
                        <img src="https://placehold.co/300x150?text=Thai+temple+and+elephant" alt="Thai temple with ornate roof and a decorated elephant in the foreground" className="mt-2 w-full rounded-lg"/>
                    </div>
                    
                    <div className="bg-white p-4 border-b border-gray-200">
                        <div className="flex items-center text-orange-500 mb-2">
                            <i className="fas fa-info-circle mr-2"></i>
                            <span className="text-sm">预订提醒：为了提升Trip.com用户体验，提供更&gt;</span>
                        </div>
                        
                        <div className="flex mb-4">
                            {['机票', '酒店'].map(tab => (
                                <div 
                                    key={tab}
                                    className={`w-1/2 text-center py-2 clickable ${selectedTab === tab ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}
                                    onClick={() => setSelectedTab(tab)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex mb-4">
                            {['因公出行', '因私出行'].map(type => (
                                <div 
                                    key={type}
                                    className={`w-1/2 py-2 text-center border border-gray-300 clickable ${travelType === type ? 'bg-white' : 'bg-gray-100'} ${type === '因公出行' ? 'rounded-l' : 'rounded-r relative'}`}
                                    onClick={() => setTravelType(type)}
                                >
                                    {type}
                                    {type === '因私出行' && <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-1 rounded-bl">程享游</span>}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex mb-4 text-sm">
                            {['单程', '往返', '多程'].map(type => (
                                <div 
                                    key={type}
                                    className={`w-1/3 text-center py-1 clickable ${tripType === type ? 'border-b-2 border-blue-500' : ''}`}
                                    onClick={() => setTripType(type)}
                                >
                                    {type}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                            <CitySelector value={departureCity} onChange={setDepartureCity} placeholder="出发城市" />
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center clickable" onClick={swapCities}>
                                <i className="fas fa-exchange-alt text-blue-500 transform rotate-90"></i>
                            </div>
                            <CitySelector value={arrivalCity} onChange={setArrivalCity} placeholder="到达城市" />
                        </div>
                        
                        <div className="mb-4">
                            <DatePicker value={travelDate} onChange={setTravelDate} />
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-lg">不限舱位</div>
                            <div className="text-sm text-gray-500">1成人</div>
                        </div>
                        
                        <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold mb-4 clickable hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={() => alert('开始搜索航班...')}>因公出行</button>
                        
                        <div className="flex justify-between text-blue-500 text-sm">
                            {[
                                { icon: 'far fa-bookmark', text: '差标' },
                                { icon: 'fas fa-chair', text: '在线选座' },
                                { icon: 'fas fa-plane', text: '航班动态' }
                            ].map(item => (
                                <div key={item.text} className="flex items-center clickable" onClick={() => alert(`正在查看${item.text}...`)}>
                                    <i className={`${item.icon} mr-1`}></i>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 p-4 bg-white">
                        {[
                            { icon: 'fas fa-plane', text: '机票', color: 'blue' },
                            { icon: 'fas fa-hotel', text: '酒店', color: 'orange' },
                            { icon: 'fas fa-train', text: '火车', color: 'green' },
                            { icon: 'fas fa-car', text: '国内打车', color: 'purple' },
                            { icon: 'fas fa-shuttle-van', text: '接送机', color: 'red' },
                            { icon: 'fas fa-car-side', text: '用车', color: 'yellow' },
                            { icon: 'fas fa-ticket-alt', text: '汽车票', color: 'indigo' },
                            { icon: 'fas fa-th', text: '更多', color: 'gray' }
                        ].map(item => (
                            <div key={item.text} className="text-center clickable" onClick={() => alert(`正在进入${item.text}页面...`)}>
                                <i className={`${item.icon} text-${item.color}-500 text-2xl mb-1`}></i>
                                <div className="text-xs">{item.text}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="fixed bottom-0 left-0 right-0 flex justify-around bg-white border-t border-gray-200 py-2">
                        {[
                            { icon: 'fas fa-home', text: '首页', active: true },
                            { icon: 'fas fa-suitcase', text: '行程' },
                            { icon: 'far fa-comment-dots', text: '消息' },
                            { icon: 'far fa-user', text: '我的' }
                        ].map(item => (
                            <div key={item.text} className={`text-center clickable ${item.active ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => alert(`正在切换到${item.text}标签...`)}>
                                <i className={`${item.icon} text-xl`}></i>
                                <div className="text-xs">{item.text}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="fixed bottom-16 right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg clickable hover:bg-blue-600" onClick={() => alert('正在打开客服聊天...')}>
                        <i className="fas fa-comments text-white text-xl"></i>
                    </div>
                </div>
            );
        };

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>