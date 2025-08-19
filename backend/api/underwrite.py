"""
Underwriting API for Sprint 4
Handles financial calculations for real estate investments
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models import get_db
from auth import get_current_approved_user

router = APIRouter(prefix="/api/underwrite", tags=["underwrite"])

class UnderwritingInput(BaseModel):
    """Input parameters for underwriting calculation"""
    purchase_price: float
    rehab_cost: float = 0
    monthly_rent: float
    monthly_taxes: float = 0
    monthly_insurance: float = 0
    monthly_utilities: float = 0
    monthly_maintenance: float = 0
    property_management_fee: float = 0.08  # 8% default
    vacancy_rate: float = 0.05  # 5% default
    loan_amount: Optional[float] = None
    interest_rate: float = 0.075  # 7.5% default
    loan_term_years: int = 30
    flip_sale_price: Optional[float] = None
    holding_period_months: int = 6

class UnderwritingOutput(BaseModel):
    """Output results from underwriting calculation"""
    # Basic metrics
    total_investment: float
    monthly_income: float
    monthly_expenses: float
    monthly_cash_flow: float
    
    # Key ratios
    noi: float  # Net Operating Income (annual)
    cap_rate: float  # Capitalization Rate
    dscr: float  # Debt Service Coverage Ratio
    coc_return: float  # Cash on Cash Return
    
    # Flip metrics (if applicable)
    flip_profit: Optional[float] = None
    flip_roi: Optional[float] = None
    flip_margin: Optional[float] = None
    
    # Risk indicators
    risk_level: str  # "Low", "Medium", "High"
    risk_factors: list[str]

def calculate_underwriting(inputs: UnderwritingInput) -> UnderwritingOutput:
    """Calculate underwriting metrics for real estate investment"""
    
    # Basic calculations
    total_investment = inputs.purchase_price + inputs.rehab_cost
    down_payment = total_investment - (inputs.loan_amount or 0)
    
    # Monthly income
    gross_monthly_rent = inputs.monthly_rent
    vacancy_loss = gross_monthly_rent * inputs.vacancy_rate
    effective_monthly_rent = gross_monthly_rent - vacancy_loss
    
    # Monthly expenses
    property_management = effective_monthly_rent * inputs.property_management_fee
    total_monthly_expenses = (
        inputs.monthly_taxes +
        inputs.monthly_insurance +
        inputs.monthly_utilities +
        inputs.monthly_maintenance +
        property_management
    )
    
    # Monthly cash flow
    monthly_cash_flow = effective_monthly_rent - total_monthly_expenses
    
    # Annual NOI
    annual_noi = (effective_monthly_rent - total_monthly_expenses) * 12
    
    # Cap Rate
    cap_rate = (annual_noi / total_investment) * 100 if total_investment > 0 else 0
    
    # DSCR (if loan exists)
    if inputs.loan_amount and inputs.loan_amount > 0:
        monthly_payment = calculate_monthly_payment(
            inputs.loan_amount, 
            inputs.interest_rate, 
            inputs.loan_term_years
        )
        annual_debt_service = monthly_payment * 12
        dscr = annual_noi / annual_debt_service if annual_debt_service > 0 else 0
    else:
        dscr = float('inf')
    
    # Cash on Cash Return
    annual_cash_flow = monthly_cash_flow * 12
    coc_return = (annual_cash_flow / down_payment) * 100 if down_payment > 0 else 0
    
    # Flip calculations (if applicable)
    flip_profit = None
    flip_roi = None
    flip_margin = None
    
    if inputs.flip_sale_price:
        total_flip_cost = total_investment + (monthly_cash_flow * inputs.holding_period_months)
        flip_profit = inputs.flip_sale_price - total_flip_cost
        flip_roi = (flip_profit / total_flip_cost) * 100 if total_flip_cost > 0 else 0
        flip_margin = (flip_profit / inputs.flip_sale_price) * 100 if inputs.flip_sale_price > 0 else 0
    
    # Risk assessment
    risk_factors = []
    risk_level = "Low"
    
    if dscr < 1.25:
        risk_factors.append("DSCR below 1.25 (high debt risk)")
        risk_level = "High"
    elif dscr < 1.5:
        risk_factors.append("DSCR below 1.5 (moderate debt risk)")
        risk_level = "Medium"
    
    if cap_rate < 4:
        risk_factors.append("Cap rate below 4% (low yield)")
        risk_level = "Medium" if risk_level == "Low" else risk_level
    elif cap_rate > 12:
        risk_factors.append("Cap rate above 12% (high risk area)")
        risk_level = "High"
    
    if coc_return < 8:
        risk_factors.append("Cash on cash return below 8%")
        risk_level = "Medium" if risk_level == "Low" else risk_level
    
    if inputs.flip_sale_price and flip_margin and flip_margin < 15:
        risk_factors.append("Flip margin below 15%")
        risk_level = "High"
    
    if not risk_factors:
        risk_factors.append("All metrics within acceptable ranges")
    
    return UnderwritingOutput(
        total_investment=total_investment,
        monthly_income=effective_monthly_rent,
        monthly_expenses=total_monthly_expenses,
        monthly_cash_flow=monthly_cash_flow,
        noi=annual_noi,
        cap_rate=cap_rate,
        dscr=dscr,
        coc_return=coc_return,
        flip_profit=flip_profit,
        flip_roi=flip_roi,
        flip_margin=flip_margin,
        risk_level=risk_level,
        risk_factors=risk_factors
    )

def calculate_monthly_payment(principal: float, annual_rate: float, years: int) -> float:
    """Calculate monthly mortgage payment"""
    if annual_rate == 0:
        return 0
    
    monthly_rate = annual_rate / 12 / 100
    num_payments = years * 12
    
    if monthly_rate == 0:
        return principal / num_payments
    
    # P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    # where P = payment, L = loan amount, c = monthly interest rate, n = number of payments
    monthly_payment = principal * (monthly_rate * (1 + monthly_rate)**num_payments) / ((1 + monthly_rate)**num_payments - 1)
    return monthly_payment

@router.post("", response_model=UnderwritingOutput)
async def calculate_deal_underwriting(
    inputs: UnderwritingInput,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_approved_user)
):
    """
    Calculate underwriting metrics for a real estate investment
    
    Returns NOI, Cap Rate, DSCR, Cash on Cash Return, and risk assessment
    """
    try:
        result = calculate_underwriting(inputs)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Underwriting API"}
