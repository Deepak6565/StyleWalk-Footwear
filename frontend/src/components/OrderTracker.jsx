import React from 'react';
import { motion } from 'framer-motion';

// Helper function to format timestamp as: "04 Aug • 01:54 pm"
const formatTimestamp = (rawDate) => {
  if (!rawDate) return null;
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${day} ${month} • ${formattedHours}:${minutes} ${ampm}`;
};

export default function OrderTracker({ order }) {
  if (!order) return null;

  const { order_status, payment_status, created_at, status_history } = order;

  // Determine active step level (0 to 5)
  // 0: Cancelled / Rejected
  // 1: Order Placed
  // 2: Order Confirmed
  // 3: Packed
  // 4: Shipped
  // 5: Delivered
  const getStepLevel = () => {
    if (order_status === 'Cancelled' || payment_status === 'Payment Rejected') return 0;
    if (payment_status === 'Payment Verification Pending') return 1;

    switch (order_status) {
      case 'Confirmed': return 2;
      case 'Processing':
      case 'Packed': return 3;
      case 'In Transit':
      case 'Shipped': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  const activeLevel = getStepLevel();

  // Parse status history if available
  let parsedHistory = {};
  if (status_history) {
    if (typeof status_history === 'string') {
      try { parsedHistory = JSON.parse(status_history); } catch (e) {}
    } else if (typeof status_history === 'object') {
      parsedHistory = status_history;
    }
  }

  // Base created date
  const createdDate = created_at ? new Date(created_at) : new Date();

  const getStepTimestamp = (stepIdx) => {
    const keyMap = ['placed_at', 'confirmed_at', 'packed_at', 'shipped_at', 'delivered_at'];
    const key = keyMap[stepIdx - 1];

    if (parsedHistory[key]) {
      return formatTimestamp(parsedHistory[key]);
    }

    // Fallback timestamp generation for completed steps
    if (stepIdx <= activeLevel) {
      if (stepIdx === 1) return formatTimestamp(createdDate);
      if (stepIdx === 2) {
        const d = new Date(createdDate.getTime() + 60 * 1000);
        return formatTimestamp(d);
      }
      if (stepIdx === 3) {
        const d = new Date(createdDate.getTime() + 15 * 60 * 1000);
        return formatTimestamp(d);
      }
      if (stepIdx === 4) {
        const d = new Date(createdDate.getTime() + 2 * 3600 * 1000);
        return formatTimestamp(d);
      }
      if (stepIdx === 5) {
        const d = new Date(createdDate.getTime() + 4 * 3600 * 1000);
        return formatTimestamp(d);
      }
    }

    return null;
  };

  const steps = [
    { id: 1, label: 'Order Placed', icon: '🛒' },
    { id: 2, label: 'Order Confirmed', icon: '📋' },
    { id: 3, label: 'Packed', icon: '📦' },
    { id: 4, label: 'Shipped', icon: '🚚' },
    { id: 5, label: 'Delivered', icon: '🏠' }
  ];

  return (
    <div className="w-full my-6 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-x-auto text-left">
      <div className="min-w-[620px] max-w-4xl mx-auto py-2">
        
        {/* Visual Progress Line & Nodes */}
        <div className="relative flex items-center justify-between px-6">
          
          {/* Connector Line Background */}
          <div className="absolute left-12 right-12 top-7 h-1 bg-gray-200 -z-0 rounded-full" />
          
          {/* Active Connector Line Fill */}
          <motion.div
            initial={{ width: '0%' }}
            animate={{
              width: activeLevel <= 1 ? '0%' : `${((Math.min(activeLevel, 5) - 1) / 4) * 100}%`
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-12 top-7 h-1 bg-[#4F46E5] -z-0 rounded-full shadow-sm"
            style={{ maxWidth: 'calc(100% - 6rem)' }}
          />

          {steps.map((step) => {
            const isCompleted = activeLevel >= step.id;
            const isCurrent = activeLevel === step.id;
            const timestamp = getStepTimestamp(step.id);

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                
                {/* Node Circle */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Glowing Outer Ring for Active Node */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute w-16 h-16 rounded-full border-2 border-indigo-400/80 shadow-md"
                    />
                  )}

                  {/* Outer Ring / Icon Badge */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-indigo-50 border-2 border-[#4F46E5] text-[#4F46E5] shadow-sm'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-indigo-200 border-[#4F46E5] scale-105 bg-indigo-100' : ''}`}
                  >
                    <span className="text-xl select-none filter drop-shadow-sm">
                      {step.icon}
                    </span>
                  </div>
                </div>

                {/* Step Title & Timestamp Info */}
                <div className="mt-3 text-center w-28">
                  <h5
                    className={`text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'text-[#0F172A] font-extrabold'
                        : 'text-[#64748B] font-medium'
                    }`}
                  >
                    {step.label}
                  </h5>

                  {/* Timestamp String (e.g., 04 Aug • 01:54 pm) */}
                  <p className="text-[10px] mt-0.5 font-medium tracking-tight">
                    {timestamp ? (
                      <span className="text-[#475569] font-semibold">{timestamp}</span>
                    ) : (
                      <span className="text-[#94A3B8] italic">Pending</span>
                    )}
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
