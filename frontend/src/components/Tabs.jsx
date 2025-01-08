import React from 'react';
import {
  DollarSign,
  Users,
  LayoutDashboard,
  GalleryVerticalEnd,
} from "lucide-react";

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabItems = [
    { 
      id: "summary", 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: "Summary" 
    },
    { 
      id: "transactions", 
      icon: <DollarSign className="w-5 h-5" />, 
      label: "Transactions" 
    },
    { 
      id: "updates", 
      icon: <GalleryVerticalEnd className="w-5 h-5" />, 
      label: "Updates" 
    }
  ];

  return (
    <>
      {/* Desktop/Tablet Top Navigation */}
      <div className="hidden md:flex bg-gray-100 border-b border-gray-200">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center 
              py-3 px-4 
              transition-colors duration-200 
              ${activeTab === tab.id 
                ? 'bg-black text-white' 
                : 'hover:bg-gray-200 text-gray-600'}
            `}
          >
            {tab.icon}
            <span className="ml-2 text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-3">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center justify-center 
                py-3 
                transition-colors duration-200 
                ${activeTab === tab.id 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {React.cloneElement(tab.icon, {
                className: `w-6 h-6 ${activeTab === tab.id ? 'scale-110' : ''}`
              })}
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tabs;
