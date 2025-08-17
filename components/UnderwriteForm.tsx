import { useState } from 'react'

interface UnderwriteData {
  purchasePrice: number
  downPayment: number
  monthlyRent: number
  monthlyExpenses: number
  rehabCost: number
  afterRepairValue: number
  holdingPeriod: number
  exitStrategy: 'rental' | 'flip'
}

interface CalculationResults {
  capRate: number
  dscr: number
  flipSpread: number
  cashOnCash: number
  totalReturn: number
  monthlyCashFlow: number
  annualCashFlow: number
}

export default function UnderwriteForm() {
  const [formData, setFormData] = useState<UnderwriteData>({
    purchasePrice: 300000,
    downPayment: 20,
    monthlyRent: 2500,
    monthlyExpenses: 800,
    rehabCost: 0,
    afterRepairValue: 300000,
    holdingPeriod: 12,
    exitStrategy: 'rental'
  })

  const [results, setResults] = useState<CalculationResults | null>(null)

  const handleInputChange = (field: keyof UnderwriteData, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    setFormData(prev => ({ ...prev, [field]: numValue }))
  }

  const calculateResults = () => {
    const downPaymentAmount = (formData.purchasePrice * formData.downPayment) / 100
    const loanAmount = formData.purchasePrice - downPaymentAmount
    const monthlyMortgage = loanAmount * 0.005 // Simplified mortgage calculation
    const totalMonthlyExpenses = formData.monthlyExpenses + monthlyMortgage
    
    // Cap Rate
    const annualRent = formData.monthlyRent * 12
    const annualExpenses = totalMonthlyExpenses * 12
    const netOperatingIncome = annualRent - annualExpenses
    const capRate = (netOperatingIncome / formData.purchasePrice) * 100

    // DSCR
    const dscr = annualRent / (annualExpenses)

    // Flip Spread
    const totalInvestment = downPaymentAmount + formData.rehabCost
    const flipSpread = ((formData.afterRepairValue - formData.purchasePrice - formData.rehabCost) / totalInvestment) * 100

    // Cash on Cash Return
    const annualCashFlow = netOperatingIncome - (monthlyMortgage * 12)
    const cashOnCash = (annualCashFlow / totalInvestment) * 100

    // Total Return (for flip)
    const totalReturn = formData.exitStrategy === 'flip' ? flipSpread : cashOnCash

    setResults({
      capRate,
      dscr,
      flipSpread,
      cashOnCash,
      totalReturn,
      monthlyCashFlow: formData.monthlyRent - totalMonthlyExpenses,
      annualCashFlow
    })
  }

  const getCapRateColor = (rate: number) => {
    if (rate >= 8) return 'text-green-600'
    if (rate >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDSCRColor = (dscr: number) => {
    if (dscr >= 1.25) return 'text-green-600'
    if (dscr >= 1.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFlipSpreadColor = (spread: number) => {
    if (spread >= 20) return 'text-green-600'
    if (spread >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-2">🧮</span>
          <h2 className="text-xl font-semibold text-gray-900">Investment Analysis Calculator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Purchase Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($)
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="300000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment (%)
              </label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="20"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent ($)
              </label>
              <input
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Expenses ($)
              </label>
              <input
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="800"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rehab Cost ($)
              </label>
              <input
                type="number"
                value={formData.rehabCost}
                onChange={(e) => handleInputChange('rehabCost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                After Repair Value ($)
              </label>
              <input
                type="number"
                value={formData.afterRepairValue}
                onChange={(e) => handleInputChange('afterRepairValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="300000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holding Period (months)
              </label>
              <input
                type="number"
                value={formData.holdingPeriod}
                onChange={(e) => handleInputChange('holdingPeriod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="12"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exit Strategy
              </label>
              <select
                value={formData.exitStrategy}
                onChange={(e) => handleInputChange('exitStrategy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="rental">Rental (Long-term)</option>
                <option value="flip">Flip (Short-term)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={calculateResults}
            className="btn-primary w-full md:w-auto"
          >
            Calculate Analysis
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-investment-score rounded-lg">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Cap Rate</p>
                  <p className={`text-2xl font-bold ${getCapRateColor(results.capRate)}`}>
                    {results.capRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-rent-growth rounded-lg">
                  <span className="text-white text-lg">💰</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">DSCR</p>
                  <p className={`text-2xl font-bold ${getDSCRColor(results.dscr)}`}>
                    {results.dscr.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center">
                <div className="p-2 bg-realestate-permit-activity rounded-lg">
                  <span className="text-white text-lg">🧮</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    {formData.exitStrategy === 'flip' ? 'Flip Spread' : 'Cash on Cash'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    formData.exitStrategy === 'flip' 
                      ? getFlipSpreadColor(results.flipSpread)
                      : getCapRateColor(results.cashOnCash)
                  }`}>
                    {formData.exitStrategy === 'flip' 
                      ? `${results.flipSpread.toFixed(1)}%`
                      : `${results.cashOnCash.toFixed(1)}%`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cash Flow Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Cash Flow:</span>
                  <span className={`font-medium ${results.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${results.monthlyCashFlow.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Cash Flow:</span>
                  <span className={`font-medium ${results.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${results.annualCashFlow.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Investment:</span>
                  <span className="font-medium">
                    ${((formData.purchasePrice * formData.downPayment / 100) + formData.rehabCost).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cap Rate Risk:</span>
                  <span className={`status-badge ${
                    results.capRate >= 8 ? 'status-high' : results.capRate >= 6 ? 'status-medium' : 'status-low'
                  }`}>
                    {results.capRate >= 8 ? 'Low' : results.capRate >= 6 ? 'Medium' : 'High'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">DSCR Risk:</span>
                  <span className={`status-badge ${
                    results.dscr >= 1.25 ? 'status-high' : results.dscr >= 1.0 ? 'status-medium' : 'status-low'
                  }`}>
                    {results.dscr >= 1.25 ? 'Low' : results.dscr >= 1.0 ? 'Medium' : 'High'}
                  </span>
                </div>
                {formData.exitStrategy === 'flip' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flip Risk:</span>
                    <span className={`status-badge ${
                      results.flipSpread >= 20 ? 'status-high' : results.flipSpread >= 10 ? 'status-medium' : 'status-low'
                    }`}>
                      {results.flipSpread >= 20 ? 'Low' : results.flipSpread >= 10 ? 'Medium' : 'High'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-600 mt-0.5 mr-2">⚠️</span>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Investment Recommendations</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {results.capRate < 6 && (
                    <li>• Consider negotiating a lower purchase price to improve cap rate</li>
                  )}
                  {results.dscr < 1.0 && (
                    <li>• Monthly expenses may be too high relative to rental income</li>
                  )}
                  {formData.exitStrategy === 'flip' && results.flipSpread < 15 && (
                    <li>• Flip spread may be too narrow for adequate profit margin</li>
                  )}
                  {results.monthlyCashFlow < 0 && (
                    <li>• Negative cash flow indicates this may not be a good rental investment</li>
                  )}
                  {results.capRate >= 8 && results.dscr >= 1.25 && (
                    <li>• Strong fundamentals - this appears to be a solid investment opportunity</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
