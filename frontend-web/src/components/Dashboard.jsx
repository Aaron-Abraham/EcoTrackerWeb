import React from 'react';

export default function Dashboard({ dashboardData, isLoading, error, onRetry, onCreateUser }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-500"></div>
        <p className="mt-4 text-gray-400">Loading carbon analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-eco-darkCard border border-red-900/30 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-200 mb-2">Connection Offline</h3>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full bg-eco-900 hover:bg-eco-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            Retry Connection
          </button>
          <button
            onClick={onCreateUser}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            Create Test Account
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const {
    baseline_footprint,
    total_co2_this_month,
    remaining_budget,
    recent_activities,
    recommendations,
  } = dashboardData;

  const usagePercent = Math.min((total_co2_this_month / baseline_footprint) * 100, 100);
  const isBudgetExceeded = remaining_budget < 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Hero Summary Circular Gauge Section */}
      <section className="bg-gradient-to-br from-eco-darkCard to-eco-darkCard/50 border border-eco-darkBorder rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Central Circular Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Circular Track Background */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  className="stroke-eco-darkBorder"
                  strokeWidth="16"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  stroke={isBudgetExceeded ? '#EF4444' : '#4CAF50'}
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 96}
                  strokeDashoffset={2 * Math.PI * 96 * (1 - usagePercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Center Content */}
              <div className="text-center z-10">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  {total_co2_this_month}
                </span>
                <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                  kg CO₂ Logged
                </p>
              </div>
            </div>
            
            <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
              Usage: {Math.round((total_co2_this_month / baseline_footprint) * 100)}% of monthly budget
            </p>
          </div>

          {/* Budget Text details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-eco-500 uppercase mb-1">
                EcoTrack Scoreboard
              </h2>
              <h3 className="text-2xl font-black text-white">Monthly Footprint Summary</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-eco-darkCard/50 border border-eco-darkBorder p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-medium">Monthly Limit</span>
                <p className="text-xl font-bold text-gray-100 mt-1">{baseline_footprint} kg</p>
              </div>

              <div className={`border p-4 rounded-2xl ${
                isBudgetExceeded 
                  ? 'bg-red-950/20 border-red-900/30' 
                  : 'bg-eco-darkCard/50 border-eco-darkBorder'
              }`}>
                <span className="text-xs text-gray-400 font-medium">Remaining Budget</span>
                <p className={`text-xl font-bold mt-1 ${isBudgetExceeded ? 'text-red-400' : 'text-eco-500'}`}>
                  {isBudgetExceeded ? `${Math.abs(remaining_budget)} kg Over` : `${remaining_budget} kg Left`}
                </p>
              </div>
            </div>

            {isBudgetExceeded ? (
              <div className="bg-red-950/10 border border-red-900/20 rounded-xl p-4 text-sm text-red-400 flex items-start gap-2.5">
                <span>🚨</span>
                <p>You have exceeded your monthly carbon budget. Consider adopting the recommendations below to lower your emissions.</p>
              </div>
            ) : (
              <div className="bg-eco-900/10 border border-eco-700/20 rounded-xl p-4 text-sm text-eco-100 flex items-start gap-2.5">
                <span>🌱</span>
                <p>Great job! You are currently keeping your monthly emissions well under your baseline limit.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Actionable Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-200">Recommended Reductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-eco-darkCard/40 border border-eco-darkBorder/60 hover:border-eco-500/40 rounded-2xl p-5 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-eco-900/40 text-eco-500 border border-eco-500/20">
                    {rec.activity_type}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{rec.recommendation_text}</p>
                {rec.potential_savings > 0 && (
                  <span className="text-xs font-semibold text-eco-100 bg-eco-900/25 py-1 px-2.5 rounded-lg">
                    Est. Savings: ~{rec.potential_savings} kg CO₂ / mo
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Recent Activities History */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-200">Recent Logs</h3>
        
        {recent_activities.length === 0 ? (
          <div className="bg-eco-darkCard/30 border border-eco-darkBorder border-dashed rounded-2xl p-12 text-center">
            <span className="text-4xl">🍃</span>
            <p className="mt-4 text-gray-400 text-sm">No activities logged this month.</p>
            <p className="text-xs text-gray-500 mt-1">Select "Log Activity" in the navigation bar to add one.</p>
          </div>
        ) : (
          <div className="bg-eco-darkCard border border-eco-darkBorder rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-eco-darkBorder bg-eco-darkCard/80 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Quantity</th>
                    <th className="py-4 px-6">Impact</th>
                    <th className="py-4 px-6 text-right">Logged Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-eco-darkBorder/60 text-sm text-gray-300">
                  {recent_activities.map((act) => {
                    const unit = act.activity_type === 'transport' 
                      ? 'miles' 
                      : act.activity_type === 'diet' 
                        ? 'servings' 
                        : 'kWh';
                    
                    return (
                      <tr key={act.id} className="hover:bg-eco-darkCard/60 transition-colors">
                        <td className="py-4 px-6 font-semibold capitalize text-white flex items-center gap-2">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            act.activity_type === 'transport' ? 'bg-blue-500' : act.activity_type === 'diet' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`} />
                          {act.activity_type}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {act.value} {unit}
                        </td>
                        <td className="py-4 px-6 font-semibold text-red-400">
                          +{act.calculated_co2} kg CO₂
                        </td>
                        <td className="py-4 px-6 text-right text-gray-500 text-xs">
                          {new Date(act.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
