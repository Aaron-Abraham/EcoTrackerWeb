import React, { useState } from 'react';

export default function LogActivity({ onLogActivity, isSubmitting, error, successMsg }) {
  const [activityType, setActivityType] = useState('transport');
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    const floatVal = parseFloat(value);
    if (isNaN(floatVal) || floatVal <= 0) {
      setLocalError('Please enter a valid positive number');
      return;
    }

    onLogActivity(activityType, floatVal);
    setValue('');
  };

  const getUnit = () => {
    switch (activityType) {
      case 'transport': return 'Miles Driven';
      case 'diet': return 'Servings (Meat/Heavy)';
      case 'energy': return 'Consumption in kWh';
      default: return 'Value';
    }
  };

  const getHelpText = () => {
    switch (activityType) {
      case 'transport': return 'Log the total miles traveled. We estimate ~0.4 kg CO₂ generated per mile.';
      case 'diet': return 'Log servings of beef, pork, or other carbon-heavy meals. We estimate ~1.2 kg CO₂ per serving.';
      case 'energy': return 'Log household electricity used. We estimate ~0.8 kg CO₂ per kWh.';
      default: return '';
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <div className="bg-eco-darkCard border border-eco-darkBorder rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-eco-500 uppercase mb-1">
            New Entry
          </h2>
          <h3 className="text-2xl font-black text-white">Log Carbon Activity</h3>
          <p className="text-gray-400 text-sm mt-1">
            Enter your consumption metrics to calculate carbon emissions.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/15 border border-red-900/35 text-red-400 rounded-xl p-4 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-eco-900/15 border border-eco-700/35 text-eco-100 rounded-xl p-4 text-xs font-medium">
            🌱 {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Category Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={activityType}
              onChange={(e) => {
                setActivityType(e.target.value);
                setLocalError(null);
              }}
              className="w-full bg-eco-darkBg border border-eco-darkBorder text-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-eco-500 focus:border-eco-500 transition-colors"
            >
              <option value="transport">🚗 Transport</option>
              <option value="diet">🥩 Diet</option>
              <option value="energy">⚡ Energy</option>
            </select>
          </div>

          {/* Numerical Input value */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              {getUnit()}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setLocalError(null);
              }}
              placeholder={`Enter ${activityType === 'diet' ? 'servings' : 'amount'}`}
              className="w-full bg-eco-darkBg border border-eco-darkBorder text-gray-100 placeholder-gray-600 rounded-xl py-3 px-4 focus:ring-2 focus:ring-eco-500 focus:border-eco-500 transition-colors"
            />
            {localError && (
              <span className="text-red-400 text-xs font-medium block mt-1">
                {localError}
              </span>
            )}
            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              {getHelpText()}
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-eco-900 hover:bg-eco-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Calculating Footprint...
              </>
            ) : (
              'Calculate & Save'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
