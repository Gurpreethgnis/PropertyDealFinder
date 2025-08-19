import { useState, useEffect } from 'react'
import Head from 'next/head'
import ProtectedRoute from '../components/ProtectedRoute'

interface UnderwritingInputs {
  purchasePrice: number
  rehabCost: number
  afterRepairValue: number
  monthlyRent: number
  propertyTaxes: number
  insurance: number
  propertyManagement: number
  vacancyRate: number
  loanAmount: number
  interestRate: number
  loanTerm: number
  closingCosts: number
}

interface UnderwritingOutputs {
  totalInvestment: number
  monthlyExpenses: number
  monthlyNOI: number
  annualNOI: number
  capRate: number
  cashOnCash: number
  dscr: number
  flipMargin: number
  flipROI: number
}

const defaultInputs: UnderwritingInputs = {
  purchasePrice: 300000,
  rehabCost: 50000,
  afterRepairValue: 400000,
  monthlyRent: 2500,
  propertyTaxes: 6000,
  insurance: 1200,
  propertyManagement: 250,
  vacancyRate: 5,
  loanAmount: 240000,
  interestRate: 7.5,
  loanTerm: 30,
  closingCosts: 9000
}

function UnderwritePageContent() {
  const [inputs, setInputs] = useState<UnderwritingInputs>(defaultInputs)
  const [outputs, setOutputs] = useState<UnderwritingOutputs | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      calculateUnderwriting()
    }
  }, [mounted, inputs])

  const calculateUnderwriting = () => {
    const {
      purchasePrice,
      rehabCost,
      afterRepairValue,
      monthlyRent,
      propertyTaxes,
      insurance,
      propertyManagement,
      vacancyRate,
      loanAmount,
      interestRate,
      loanTerm,
      closingCosts
    } = inputs

    // Calculate monthly mortgage payment
    const monthlyRate = interestRate / 100 / 12
    const totalPayments = loanTerm * 12
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1)

    // Calculate expenses
    const monthlyTaxes = propertyTaxes / 12
    const monthlyInsurance = insurance / 12
    const monthlyVacancy = (monthlyRent * vacancyRate) / 100

    const monthlyExpenses = monthlyMortgage + monthlyTaxes + monthlyInsurance + propertyManagement + monthlyVacancy
    const monthlyNOI = monthlyRent - monthlyExpenses + monthlyMortgage // Add back mortgage for NOI calculation
    const annualNOI = monthlyNOI * 12

    // Calculate metrics
    const totalInvestment = purchasePrice + rehabCost + closingCosts
    const capRate = (annualNOI / afterRepairValue) * 100
    const cashOnCash = (annualNOI / totalInvestment) * 100
    const dscr = annualNOI / (monthlyMortgage * 12)
    const flipMargin = ((afterRepairValue - totalInvestment) / totalInvestment) * 100
    const flipROI = ((afterRepairValue - totalInvestment) / totalInvestment) * 100

    setOutputs({
      totalInvestment,
      monthlyExpenses,
      monthlyNOI,
      annualNOI,
      capRate,
      cashOnCash,
      dscr,
      flipMargin,
      flipROI
    })
  }

  const handleInputChange = (field: keyof UnderwritingInputs, value: string) => {
    const numValue = parseFloat(value) || 0
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  const getDSCRColor = (dscr: number) => {
    if (dscr >= 1.25) return 'text-green-600'
    if (dscr >= 1.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDSCRIcon = (dscr: number) => {
    if (dscr >= 1.25) return '✅'
    if (dscr >= 1.0) return '⚠️'
    return '❌'
  }

  const getCapRateColor = (capRate: number) => {
    if (capRate >= 8) return 'text-green-600'
    if (capRate >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Head>
        <title>Underwriting Calculator - PropertyFinder</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧮 Underwriting Calculator
            </h1>
            <p className="text-gray-600">
              Analyze cash flow, returns, and risk metrics for real estate investments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Investment Parameters</h2>
              
              <div className="space-y-6">
                {/* Purchase & Rehab */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase & Rehab</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purchase Price
                      </label>
                      <input
                        type="number"
                        value={inputs.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="300000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rehab Cost
                      </label>
                      <input
                        type="number"
                        value={inputs.rehabCost}
                        onChange={(e) => handleInputChange('rehabCost', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        After Repair Value
                      </label>
                      <input
                        type="number"
                        value={inputs.afterRepairValue}
                        onChange={(e) => handleInputChange('afterRepairValue', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="400000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Costs
                      </label>
                      <input
                        type="number"
                        value={inputs.closingCosts}
                        onChange={(e) => handleInputChange('closingCosts', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="9000"
                      />
                    </div>
                  </div>
                </div>

                {/* Income & Expenses */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Income & Expenses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Rent
                      </label>
                      <input
                        type="number"
                        value={inputs.monthlyRent}
                        onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Taxes (Annual)
                      </label>
                      <input
                        type="number"
                        value={inputs.propertyTaxes}
                        onChange={(e) => handleInputChange('propertyTaxes', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="6000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance (Annual)
                      </label>
                      <input
                        type="number"
                        value={inputs.insurance}
                        onChange={(e) => handleInputChange('insurance', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="1200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Management (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.propertyManagement}
                        onChange={(e) => handleInputChange('propertyManagement', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vacancy Rate (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.vacancyRate}
                        onChange={(e) => handleInputChange('vacancyRate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                {/* Financing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Financing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Amount
                      </label>
                      <input
                        type="number"
                        value={inputs.loanAmount}
                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="240000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.interestRate}
                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="7.5"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Term (Years)
                      </label>
                      <input
                        type="number"
                        value={inputs.loanTerm}
                        onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {outputs && (
                <>
                  {/* Key Metrics */}
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Total Investment</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(outputs.totalInvestment)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Monthly NOI</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(outputs.monthlyNOI)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Annual NOI</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(outputs.annualNOI)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Monthly Expenses</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(outputs.monthlyExpenses)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Returns & Ratios */}
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Returns & Ratios</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">Cap Rate</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPercentage(outputs.capRate)}
                          </div>
                        </div>
                        <div className={`text-2xl ${getCapRateColor(outputs.capRate)}`}>
                          {outputs.capRate >= 8 ? '✅' : outputs.capRate >= 6 ? '⚠️' : '❌'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">Cash on Cash Return</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatPercentage(outputs.cashOnCash)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm text-gray-600">DSCR (Debt Service Coverage)</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {outputs.dscr.toFixed(2)}
                          </div>
                        </div>
                        <div className={`text-2xl ${getDSCRColor(outputs.dscr)}`}>
                          {getDSCRIcon(outputs.dscr)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flip Analysis */}
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Flip Analysis</h2>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Flip Margin</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPercentage(outputs.flipMargin)}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Flip ROI</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPercentage(outputs.flipROI)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Assessment</h2>
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        outputs.dscr >= 1.25 ? 'bg-green-50 text-green-800' : 
                        outputs.dscr >= 1.0 ? 'bg-yellow-50 text-yellow-800' : 
                        'bg-red-50 text-red-800'
                      }`}>
                        <span className="text-sm font-medium">DSCR Threshold</span>
                        <span className="text-sm">
                          {outputs.dscr >= 1.25 ? 'Safe (≥1.25)' : 
                           outputs.dscr >= 1.0 ? 'Caution (≥1.0)' : 
                           'Risk (<1.0)'}
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        outputs.capRate >= 8 ? 'bg-green-50 text-green-800' : 
                        outputs.capRate >= 6 ? 'bg-yellow-50 text-yellow-800' : 
                        'bg-red-50 text-red-800'
                      }`}>
                        <span className="text-sm font-medium">Cap Rate Threshold</span>
                        <span className="text-sm">
                          {outputs.capRate >= 8 ? 'Strong (≥8%)' : 
                           outputs.capRate >= 6 ? 'Moderate (≥6%)' : 
                           'Weak (<6%)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!outputs && (
                <div className="card">
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🧮</div>
                    <p className="text-gray-600">
                      Fill out the form to see your underwriting analysis
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function UnderwritePage() {
  return (
    <ProtectedRoute>
      <UnderwritePageContent />
    </ProtectedRoute>
  )
}
