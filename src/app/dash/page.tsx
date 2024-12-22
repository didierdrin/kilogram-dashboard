'use client';
import { useState } from 'react';
import { auth } from '../../../firebaseApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FaHome, FaShoppingCart, FaBoxes, FaHistory, FaAd, FaQuestionCircle, FaCog, FaSignOutAlt, FaBell } from 'react-icons/fa';

// Import components
import Overview from '@/components/Overview';
import Inventory from '@/components/Inventory';
import CurrentOrders from '@/components/CurrentOrders';
import RecentOrders from '@/components/RecentOrders';
import Advertise from '@/components/Advertise';
import Help from '@/components/Help';
import Settings from '@/components/Settings';

export default function Dashboard() {
  //const [user] = useAuthState(auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const menuItems = [
    { name: 'overview', icon: FaHome, component: Overview },
    { name: 'Garmets', icon: FaBoxes, component: Inventory },
    { name: 'Current orders', icon: FaShoppingCart, component: CurrentOrders },
    { name: 'recent orders', icon: FaHistory, component: RecentOrders },
    { name: 'advertise', icon: FaAd, component: Advertise },
    { name: 'help', icon: FaQuestionCircle, component: Help },
    { name: 'settings', icon: FaCog, component: Settings },
  ];

  const ActiveComponent = menuItems.find(item => item.name === activeTab)?.component || (() => <div>Not found</div>);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-500 min-h-screen flex flex-col text-white p-5 transition-all duration-300`}>
        <div className='flex flex-col flex-grow'>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className=" mb-5 w-full text-left hover:text-slate-300">
          {sidebarOpen ? '« ' : '»'}
        </button>
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex hover:text-slate-300 hover:underline items-center mb-4 ${activeTab === item.name ? 'text-blue-300' : ''} ${sidebarOpen ? 'w-full' : 'w-10'} overflow-hidden`}
          >
            <item.icon className="mr-2" />
            {sidebarOpen && <span>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>}
          </button>
        ))}
    
        </div>
        <button onClick={handleLogout} className="flex items-center mt-5 border-t-[1px] pt-3 text-slate-300 hover:text-red-600 hover:underline ">
          <FaSignOutAlt className="mr-2" />
          {sidebarOpen && <span>Log out</span>}
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-full transition-width duration-300 ease-in-out"> 
        {/* Header  */}
        <div className="flex items-center justify-between m-2">
          <div className="relative mx-8">
            <input
              type="text"
              placeholder="Search"
              className="text-slate-500 text-[20px] cursor-pointer border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-sm w-[600px] py-1 px-10 pr-12"
            />
            <svg
              className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-indigo-500 hover:text-slate-800"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex space-x-8 mr-8">
            <FaBell className="bg-white h-8 w-8 p-2 border border-black rounded-lg hover:bg-black hover:text-indigo-300 cursor-pointer" />
            {/* <FaUser className="bg-white h-8 w-8 p-2 border border-black rounded-lg hover:bg-black hover:text-teal-300 cursor-pointer" /> */}
          </div>
        </div>
        {/* <h2 className="text-2xl font-bold mb-5">Dashboard</h2>
        <p className="mb-5">Welcome, {user?.displayName}!</p> */}

        <ActiveComponent />
      </div>
    </div>
  );
}


//"flex-1 p-10 overflow-auto">