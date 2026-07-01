import os
import sys
import json
import argparse
import random
import math
from datetime import datetime, timedelta

random.seed()  # fresh seed each call for live-feel noise

# ─── Helpers ─────────────────────────────────────────────────────────────────

def jitter(val, pct=0.002):
    return round(val * (1 + random.uniform(-pct, pct)), 4)

def fmt_pct(val):
    return round(val + random.uniform(-0.001, 0.001), 4)

# ─── Black-Scholes Greeks (simplified, for display) ──────────────────────────

def norm_cdf(x):
    """Approximation of standard normal CDF."""
    k = 1 / (1 + 0.2316419 * abs(x))
    poly = k * (0.319381530 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429))))
    val = 1 - (1 / math.sqrt(2 * math.pi)) * math.exp(-0.5 * x**2) * poly
    return val if x >= 0 else 1 - val

def bs_greeks(S, K, T, r, sigma, option_type='call'):
    """Compute Black-Scholes price and Greeks."""
    if T <= 0: T = 0.001
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    nd1 = norm_cdf(d1)
    nd2 = norm_cdf(d2)
    phi_d1 = math.exp(-0.5 * d1**2) / math.sqrt(2 * math.pi)

    if option_type == 'call':
        price = S * nd1 - K * math.exp(-r * T) * nd2
        delta = nd1
    else:
        price = K * math.exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1)
        delta = nd1 - 1

    gamma = phi_d1 / (S * sigma * math.sqrt(T))
    theta = (-(S * phi_d1 * sigma) / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * nd2) / 365
    vega = S * phi_d1 * math.sqrt(T) / 100  # per 1% IV move
    rho = K * T * math.exp(-r * T) * nd2 / 100

    return {
        'price': round(price, 2),
        'delta': round(delta, 4),
        'gamma': round(gamma, 6),
        'theta': round(theta, 4),
        'vega': round(vega, 4),
        'rho': round(rho, 4),
    }

# ─── Market Overview ─────────────────────────────────────────────────────────

def get_market_overview():
    base = {
        # ── US Indices ──
        'SPY':      {'name': 'S&P 500 ETF',       'price': 523.41,  'sector': 'Index',       'market': 'US',  'currency': 'USD'},
        'QQQ':      {'name': 'Nasdaq 100 ETF',    'price': 448.82,  'sector': 'Index',       'market': 'US',  'currency': 'USD'},
        'IWM':      {'name': 'Russell 2000',      'price': 207.15,  'sector': 'Index',       'market': 'US',  'currency': 'USD'},
        'DIA':      {'name': 'Dow Jones ETF',     'price': 391.20,  'sector': 'Index',       'market': 'US',  'currency': 'USD'},
        'VIX':      {'name': 'Volatility Idx',    'price': 14.32,   'sector': 'Volatility',  'market': 'US',  'currency': 'USD'},
        # ── US Commodities / Bonds ──
        'GLD':      {'name': 'Gold ETF',          'price': 228.90,  'sector': 'Commodity',   'market': 'US',  'currency': 'USD'},
        'USO':      {'name': 'Oil ETF',           'price': 71.45,   'sector': 'Commodity',   'market': 'US',  'currency': 'USD'},
        'TLT':      {'name': '20yr Bond ETF',     'price': 92.10,   'sector': 'Fixed Income','market': 'US',  'currency': 'USD'},
        # ── Crypto ──
        'BTC':      {'name': 'Bitcoin',           'price': 68450.0, 'sector': 'Crypto',      'market': 'Crypto','currency': 'USD'},
        'ETH':      {'name': 'Ethereum',          'price': 3812.0,  'sector': 'Crypto',      'market': 'Crypto','currency': 'USD'},
        # ── India NSE ──
        'NIFTY50':  {'name': 'Nifty 50 Index',   'price': 24562.0, 'sector': 'Index',       'market': 'IN',  'currency': 'INR'},
        'SENSEX':   {'name': 'BSE Sensex',        'price': 80891.0, 'sector': 'Index',       'market': 'IN',  'currency': 'INR'},
        'RELIANCE': {'name': 'Reliance Industries','price': 2945.0, 'sector': 'Energy',      'market': 'IN',  'currency': 'INR'},
        'TCS':      {'name': 'Tata Consultancy',  'price': 3820.0,  'sector': 'Technology',  'market': 'IN',  'currency': 'INR'},
        'HDFCBANK': {'name': 'HDFC Bank Ltd',     'price': 1712.0,  'sector': 'Financial',   'market': 'IN',  'currency': 'INR'},
        'INFY':     {'name': 'Infosys Ltd',       'price': 1588.0,  'sector': 'Technology',  'market': 'IN',  'currency': 'INR'},
        'ICICIBANK':{'name': 'ICICI Bank',        'price': 1298.0,  'sector': 'Financial',   'market': 'IN',  'currency': 'INR'},
        'WIPRO':    {'name': 'Wipro Ltd',         'price': 478.0,   'sector': 'Technology',  'market': 'IN',  'currency': 'INR'},
        'ITC':      {'name': 'ITC Limited',       'price': 453.0,   'sector': 'Consumer',    'market': 'IN',  'currency': 'INR'},
        'BAJFINANCE':{'name': 'Bajaj Finance',    'price': 7124.0,  'sector': 'Financial',   'market': 'IN',  'currency': 'INR'},
        'NTPCGREEN': {'name': 'NTPC Green Energy', 'price': 95.1,    'sector': 'Utilities',   'market': 'IN',  'currency': 'INR'},
        # ── Canada TSX ──
        'TSX':      {'name': 'S&P/TSX Composite', 'price': 24218.0,'sector': 'Index',       'market': 'CA',  'currency': 'CAD'},
        'TD.TO':    {'name': 'TD Bank Group',     'price': 82.40,   'sector': 'Financial',   'market': 'CA',  'currency': 'CAD'},
        'RY.TO':    {'name': 'Royal Bank of Canada','price': 133.80,'sector': 'Financial',   'market': 'CA',  'currency': 'CAD'},
        'SHOP.TO':  {'name': 'Shopify Inc.',      'price': 94.60,   'sector': 'Technology',  'market': 'CA',  'currency': 'CAD'},
        'CNQ.TO':   {'name': 'Canadian Nat. Res.','price': 42.10,   'sector': 'Energy',      'market': 'CA',  'currency': 'CAD'},
        'SU.TO':    {'name': 'Suncor Energy',     'price': 54.80,   'sector': 'Energy',      'market': 'CA',  'currency': 'CAD'},
        'BNS.TO':   {'name': 'Bank of Nova Scotia','price': 71.20,  'sector': 'Financial',   'market': 'CA',  'currency': 'CAD'},
        'ABX.TO':   {'name': 'Barrick Gold',      'price': 24.90,   'sector': 'Materials',   'market': 'CA',  'currency': 'CAD'},
        'CP.TO':    {'name': 'Canadian Pacific',  'price': 108.40,  'sector': 'Industrials', 'market': 'CA',  'currency': 'CAD'},
        'MFC.TO':   {'name': 'Manulife Financial','price': 38.60,   'sector': 'Financial',   'market': 'CA',  'currency': 'CAD'},
        # ── BSE Sensex 30 Components (dual-listed NSE/BSE) ──
        'TITAN':      {'name': 'Titan Company',      'price': 3468.0,  'sector': 'Consumer',    'market': 'BSE', 'currency': 'INR'},
        'BHARTIARTL': {'name': 'Bharti Airtel',      'price': 1628.0,  'sector': 'Communication','market': 'BSE','currency': 'INR'},
        'LT':         {'name': 'Larsen & Toubro',    'price': 3892.0,  'sector': 'Industrials', 'market': 'BSE', 'currency': 'INR'},
        'SUNPHARMA':  {'name': 'Sun Pharmaceutical', 'price': 1742.0,  'sector': 'Healthcare',  'market': 'BSE', 'currency': 'INR'},
        'HINDUNILVR': {'name': 'Hindustan Unilever', 'price': 2289.0,  'sector': 'Consumer',    'market': 'BSE', 'currency': 'INR'},
        'ASIANPAINT': {'name': 'Asian Paints',       'price': 2418.0,  'sector': 'Materials',   'market': 'BSE', 'currency': 'INR'},
        'KOTAKBANK':  {'name': 'Kotak Mahindra Bank','price': 2048.0,  'sector': 'Financial',   'market': 'BSE', 'currency': 'INR'},
        'HCLTECH':    {'name': 'HCL Technologies',   'price': 1728.0,  'sector': 'Technology',  'market': 'BSE', 'currency': 'INR'},
        'POWERGRID':  {'name': 'Power Grid Corp',    'price': 318.0,   'sector': 'Utilities',   'market': 'BSE', 'currency': 'INR'},
        'NTPC':       {'name': 'NTPC Limited',       'price': 362.0,   'sector': 'Utilities',   'market': 'BSE', 'currency': 'INR'},
        'ULTRACEMCO': {'name': 'UltraTech Cement',   'price': 11248.0, 'sector': 'Materials',   'market': 'BSE', 'currency': 'INR'},
        'NESTLEIND':  {'name': 'Nestle India',       'price': 2198.0,  'sector': 'Consumer',    'market': 'BSE', 'currency': 'INR'},
        'BSE':        {'name': 'BSE Limited',        'price': 5842.0,  'sector': 'Financial',   'market': 'BSE', 'currency': 'INR'},
    }
    result = []
    for ticker, info in base.items():
        price = jitter(info['price'], 0.003)
        change_pct = round(random.uniform(-2.5, 2.5), 2)
        change = round(price * change_pct / 100, 2)
        result.append({
            'ticker': ticker,
            'name': info['name'],
            'price': round(price, 2),
            'change': change,
            'change_pct': change_pct,
            'volume': f"{random.randint(10, 200)}M",
            'sector': info['sector'],
            'market': info.get('market', 'US'),
            'currency': info.get('currency', 'USD'),
        })
    return result

# ─── Portfolio ────────────────────────────────────────────────────────────────

HOLDINGS_BASE = [
    # ── US Equities ──
    {'symbol': 'AAPL',     'quantity': 150,  'avg_buy_price': 172.50, 'current_price': 189.30,  'sector': 'Technology',    'market': 'US',  'currency': 'USD'},
    {'symbol': 'MSFT',     'quantity': 80,   'avg_buy_price': 380.00, 'current_price': 415.50,  'sector': 'Technology',    'market': 'US',  'currency': 'USD'},
    {'symbol': 'GOOGL',    'quantity': 120,  'avg_buy_price': 145.00, 'current_price': 173.50,  'sector': 'Communication', 'market': 'US',  'currency': 'USD'},
    {'symbol': 'AMZN',     'quantity': 110,  'avg_buy_price': 160.00, 'current_price': 185.20,  'sector': 'Consumer Cyclical','market': 'US','currency': 'USD'},
    {'symbol': 'NVDA',     'quantity': 40,   'avg_buy_price': 750.00, 'current_price': 880.00,  'sector': 'Technology',    'market': 'US',  'currency': 'USD'},
    {'symbol': 'JPM',      'quantity': 60,   'avg_buy_price': 195.00, 'current_price': 218.40,  'sector': 'Financial',     'market': 'US',  'currency': 'USD'},
    {'symbol': 'BRK.B',    'quantity': 45,   'avg_buy_price': 340.00, 'current_price': 378.50,  'sector': 'Financial',     'market': 'US',  'currency': 'USD'},
    {'symbol': 'JNJ',      'quantity': 75,   'avg_buy_price': 155.00, 'current_price': 163.20,  'sector': 'Healthcare',    'market': 'US',  'currency': 'USD'},
    # ── India NSE (prices in INR, USD equiv at 84 INR/USD) ──
    {'symbol': 'RELIANCE', 'quantity': 200,  'avg_buy_price': 2420.00,'current_price': 2945.00, 'sector': 'Energy',        'market': 'IN',  'currency': 'INR'},
    {'symbol': 'TCS',      'quantity': 150,  'avg_buy_price': 3280.00,'current_price': 3820.00, 'sector': 'Technology',    'market': 'IN',  'currency': 'INR'},
    {'symbol': 'HDFCBANK', 'quantity': 300,  'avg_buy_price': 1480.00,'current_price': 1712.00, 'sector': 'Financial',     'market': 'IN',  'currency': 'INR'},
    {'symbol': 'INFY',     'quantity': 250,  'avg_buy_price': 1350.00,'current_price': 1588.00, 'sector': 'Technology',    'market': 'IN',  'currency': 'INR'},
    {'symbol': 'BAJFINANCE','quantity': 80,  'avg_buy_price': 6200.00,'current_price': 7124.00, 'sector': 'Financial',     'market': 'IN',  'currency': 'INR'},
    # ── BSE Sensex Components ──
    {'symbol': 'TITAN',     'quantity': 120, 'avg_buy_price': 2890.00,'current_price': 3468.00, 'sector': 'Consumer',      'market': 'BSE', 'currency': 'INR'},
    {'symbol': 'BHARTIARTL','quantity': 200, 'avg_buy_price': 1280.00,'current_price': 1628.00, 'sector': 'Communication', 'market': 'BSE', 'currency': 'INR'},
    {'symbol': 'SUNPHARMA', 'quantity': 150, 'avg_buy_price': 1420.00,'current_price': 1742.00, 'sector': 'Healthcare',    'market': 'BSE', 'currency': 'INR'},
    {'symbol': 'HCLTECH',   'quantity': 180, 'avg_buy_price': 1390.00,'current_price': 1728.00, 'sector': 'Technology',    'market': 'BSE', 'currency': 'INR'},
    # ── Canada TSX (prices in CAD, USD equiv at 1.36 CAD/USD) ──
    {'symbol': 'RY.TO',    'quantity': 200,  'avg_buy_price': 118.50, 'current_price': 133.80,  'sector': 'Financial',     'market': 'CA',  'currency': 'CAD'},
    {'symbol': 'SHOP.TO',  'quantity': 500,  'avg_buy_price': 72.40,  'current_price': 94.60,   'sector': 'Technology',    'market': 'CA',  'currency': 'CAD'},
    {'symbol': 'CNQ.TO',   'quantity': 400,  'avg_buy_price': 35.80,  'current_price': 42.10,   'sector': 'Energy',        'market': 'CA',  'currency': 'CAD'},
    {'symbol': 'TD.TO',    'quantity': 300,  'avg_buy_price': 76.20,  'current_price': 82.40,   'sector': 'Financial',     'market': 'CA',  'currency': 'CAD'},
    {'symbol': 'ABX.TO',   'quantity': 600,  'avg_buy_price': 19.40,  'current_price': 24.90,   'sector': 'Materials',     'market': 'CA',  'currency': 'CAD'},
]

# FX conversion rates to USD (for portfolio aggregation)
FX_RATES = {
    'USD': 1.0,
    'INR': 1 / 84.0,    # 1 INR = 0.01190 USD
    'CAD': 1 / 1.362,   # 1 CAD = 0.7341 USD
}

TRANSACTIONS_BASE = [
    {'date': '2024-01-15', 'type': 'BUY',  'symbol': 'AAPL',      'quantity': 100,  'price': 175.20,  'total': 17520.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2024-02-08', 'type': 'BUY',  'symbol': 'NVDA',      'quantity': 20,   'price': 620.00,  'total': 12400.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2024-03-12', 'type': 'SELL', 'symbol': 'META',      'quantity': 30,   'price': 495.00,  'total': 14850.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2024-04-03', 'type': 'BUY',  'symbol': 'MSFT',      'quantity': 50,   'price': 385.00,  'total': 19250.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2024-05-20', 'type': 'BUY',  'symbol': 'GOOGL',     'quantity': 80,   'price': 148.00,  'total': 11840.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2024-06-18', 'type': 'BUY',  'symbol': 'RELIANCE',  'quantity': 200,  'price': 2420.00, 'total': 484000.00, 'currency': 'INR', 'market': 'IN'},
    {'date': '2024-07-10', 'type': 'BUY',  'symbol': 'TCS',       'quantity': 150,  'price': 3280.00, 'total': 492000.00, 'currency': 'INR', 'market': 'IN'},
    {'date': '2024-08-11', 'type': 'BUY',  'symbol': 'JPM',       'quantity': 60,   'price': 195.00,  'total': 11700.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2024-09-05', 'type': 'BUY',  'symbol': 'RY.TO',     'quantity': 200,  'price': 118.50,  'total': 23700.00,  'currency': 'CAD', 'market': 'CA'},
    {'date': '2024-10-05', 'type': 'SELL', 'symbol': 'TSLA',      'quantity': 25,   'price': 260.00,  'total': 6500.00,   'currency': 'USD', 'market': 'US'},
    {'date': '2024-11-14', 'type': 'BUY',  'symbol': 'SHOP.TO',   'quantity': 500,  'price': 72.40,   'total': 36200.00,  'currency': 'CAD', 'market': 'CA'},
    {'date': '2024-12-03', 'type': 'BUY',  'symbol': 'HDFCBANK',  'quantity': 300,  'price': 1480.00, 'total': 444000.00, 'currency': 'INR', 'market': 'IN'},
    {'date': '2025-01-22', 'type': 'BUY',  'symbol': 'BRK.B',     'quantity': 45,   'price': 340.00,  'total': 15300.00,  'currency': 'USD', 'market': 'US'},
    {'date': '2025-02-18', 'type': 'BUY',  'symbol': 'CNQ.TO',    'quantity': 400,  'price': 35.80,   'total': 14320.00,  'currency': 'CAD', 'market': 'CA'},
    {'date': '2025-03-11', 'type': 'BUY',  'symbol': 'BAJFINANCE', 'quantity': 80,  'price': 6200.00, 'total': 496000.00, 'currency': 'INR', 'market': 'IN'},
    {'date': '2025-04-25', 'type': 'BUY',  'symbol': 'INFY',      'quantity': 250,  'price': 1350.00, 'total': 337500.00, 'currency': 'INR', 'market': 'IN'},
    {'date': '2025-05-09', 'type': 'BUY',  'symbol': 'ABX.TO',    'quantity': 600,  'price': 19.40,   'total': 11640.00,  'currency': 'CAD', 'market': 'CA'},
    {'date': '2025-06-02', 'type': 'BUY',  'symbol': 'TD.TO',     'quantity': 300,  'price': 76.20,   'total': 22860.00,  'currency': 'CAD', 'market': 'CA'},
]


def get_portfolio():
    holdings = []
    for h in HOLDINGS_BASE:
        cp = jitter(h['current_price'], 0.002)
        fx = FX_RATES.get(h.get('currency', 'USD'), 1.0)
        mkt_val_local = round(h['quantity'] * cp, 2)
        mkt_val_usd   = round(mkt_val_local * fx, 2)
        cost_local     = round(h['quantity'] * h['avg_buy_price'], 2)
        cost_usd       = round(cost_local * fx, 2)
        pnl_usd       = round(mkt_val_usd - cost_usd, 2)
        pnl_pct       = round((pnl_usd / cost_usd) * 100, 2) if cost_usd else 0
        day_chg_pct   = round(random.uniform(-2.0, 2.5), 2)
        day_chg_usd   = round(mkt_val_usd * day_chg_pct / 100, 2)
        holdings.append({
            'symbol':                  h['symbol'],
            'sector':                  h['sector'],
            'market':                  h.get('market', 'US'),
            'currency':                h.get('currency', 'USD'),
            'quantity':                h['quantity'],
            'avg_buy_price':           h['avg_buy_price'],
            'current_price':           round(cp, 2),
            'market_value':            mkt_val_usd,
            'market_value_local':      mkt_val_local,
            'cost_basis':              cost_usd,
            'unrealized_pnl':          pnl_usd,
            'unrealized_pnl_percent':  pnl_pct,
            'day_change':              day_chg_usd,
            'day_change_pct':          day_chg_pct,
        })

    total_mkt = sum(h['market_value'] for h in holdings)
    for h in holdings:
        h['weight'] = round((h['market_value'] / total_mkt) * 100, 2)

    total_cost = sum(h['cost_basis'] for h in holdings)
    total_pnl = total_mkt - total_cost

    # Sector allocation
    sector_alloc = {}
    for h in holdings:
        s = h['sector']
        sector_alloc[s] = sector_alloc.get(s, 0) + h['market_value']
    sector_alloc_pct = {s: round((v / total_mkt) * 100, 2) for s, v in sector_alloc.items()}

    # VaR simulation (parametric)
    port_vol = 0.128
    var_95 = round(total_mkt * port_vol * 1.645 / math.sqrt(252), 2)
    var_99 = round(total_mkt * port_vol * 2.326 / math.sqrt(252), 2)

    return {
        'total_market_value': round(total_mkt, 2),
        'total_cost_basis': round(total_cost, 2),
        'total_unrealized_pnl': round(total_pnl, 2),
        'total_unrealized_pnl_percent': round((total_pnl / total_cost) * 100, 2),
        'total_day_change': round(sum(h['day_change'] for h in holdings), 2),
        'total_day_change_pct': round(random.uniform(-1.5, 2.0), 2),
        'holdings': holdings,
        'transactions': TRANSACTIONS_BASE,
        'sector_allocation': sector_alloc_pct,
        'metrics': {
            'sharpe': round(2.15 + random.uniform(-0.1, 0.1), 2),
            'sortino': round(2.87 + random.uniform(-0.1, 0.1), 2),
            'volatility': round(12.8 + random.uniform(-0.3, 0.3), 2),
            'beta': round(1.12 + random.uniform(-0.02, 0.02), 2),
            'alpha': round(3.4 + random.uniform(-0.2, 0.2), 2),
            'max_drawdown': round(-8.5 + random.uniform(-0.3, 0.3), 2),
            'var_95': var_95,
            'var_99': var_99,
            'risk_score': 68,
        }
    }

# ─── Options Chain ────────────────────────────────────────────────────────────

def get_options_chain(ticker='SPY'):
    S = jitter(523.41, 0.001)
    r = 0.053
    T_vals = [7/365, 14/365, 30/365, 60/365]  # expirations
    exp_labels = [
        (datetime.today() + timedelta(days=7)).strftime('%Y-%m-%d'),
        (datetime.today() + timedelta(days=14)).strftime('%Y-%m-%d'),
        (datetime.today() + timedelta(days=30)).strftime('%Y-%m-%d'),
        (datetime.today() + timedelta(days=60)).strftime('%Y-%m-%d'),
    ]

    # Build skew surface
    strikes = [480, 490, 500, 505, 510, 515, 520, 523, 525, 530, 535, 540, 545, 550, 560, 570]
    base_iv = 0.145

    def skew_iv(K, S, base):
        moneyness = (K - S) / S
        # Classic negative skew
        return max(0.05, base + 0.8 * moneyness**2 - 0.3 * moneyness)

    # Option chain for nearest expiry
    T = T_vals[1]
    exp_label = exp_labels[1]
    chain = []
    for K in strikes:
        iv = skew_iv(K, S, base_iv)
        iv = jitter(iv, 0.01)
        call = bs_greeks(S, K, T, r, iv, 'call')
        put  = bs_greeks(S, K, T, r, iv, 'put')
        itm_call = K < S
        itm_put  = K > S
        chain.append({
            'strike': K,
            'iv': round(iv * 100, 2),
            'call_price':  call['price'],
            'call_delta':  call['delta'],
            'call_gamma':  call['gamma'],
            'call_theta':  call['theta'],
            'call_vega':   call['vega'],
            'call_oi':     random.randint(100, 8000),
            'call_vol':    random.randint(10, 3000),
            'call_itm':    itm_call,
            'put_price':   put['price'],
            'put_delta':   put['delta'],
            'put_gamma':   put['gamma'],
            'put_theta':   put['theta'],
            'put_vega':    put['vega'],
            'put_oi':      random.randint(100, 8000),
            'put_vol':     random.randint(10, 3000),
            'put_itm':     itm_put,
        })

    # Vol surface (strike vs expiry)
    vol_surface = []
    for i, (T_exp, exp_lbl) in enumerate(zip(T_vals, exp_labels)):
        row = {'expiry': exp_lbl}
        for K in [490, 500, 510, 520, 530, 540, 550]:
            iv_val = skew_iv(K, S, base_iv + i * 0.005)
            row[str(K)] = round(jitter(iv_val, 0.01) * 100, 2)
        vol_surface.append(row)

    # Skew chart data
    skew_chart = [{'strike': K, 'iv': round(skew_iv(K, S, base_iv) * jitter(1, 0.005) * 100, 2)} for K in strikes]

    return {
        'ticker': ticker,
        'spot': round(S, 2),
        'expiry': exp_label,
        'chain': chain,
        'vol_surface': vol_surface,
        'skew_chart': skew_chart,
        'atm_iv': round(base_iv * 100, 2),
        'put_call_ratio': round(jitter(0.82, 0.05), 2),
        'term_structure': [
            {'days': 7,  'iv': round(jitter(18.2, 0.02), 2)},
            {'days': 14, 'iv': round(jitter(15.8, 0.02), 2)},
            {'days': 30, 'iv': round(jitter(14.5, 0.02), 2)},
            {'days': 60, 'iv': round(jitter(14.1, 0.02), 2)},
            {'days': 90, 'iv': round(jitter(15.2, 0.02), 2)},
            {'days': 180,'iv': round(jitter(16.4, 0.02), 2)},
        ]
    }

# ─── Bonds / Fixed Income ─────────────────────────────────────────────────────

def get_bonds():
    # US Treasury yield curve
    yield_curve = [
        {'maturity': '1M',  'tenor': 1/12,  'yield': jitter(5.30, 0.003)},
        {'maturity': '3M',  'tenor': 3/12,  'yield': jitter(5.25, 0.003)},
        {'maturity': '6M',  'tenor': 6/12,  'yield': jitter(5.15, 0.003)},
        {'maturity': '1Y',  'tenor': 1,     'yield': jitter(4.85, 0.003)},
        {'maturity': '2Y',  'tenor': 2,     'yield': jitter(4.62, 0.003)},
        {'maturity': '3Y',  'tenor': 3,     'yield': jitter(4.40, 0.003)},
        {'maturity': '5Y',  'tenor': 5,     'yield': jitter(4.28, 0.003)},
        {'maturity': '7Y',  'tenor': 7,     'yield': jitter(4.30, 0.003)},
        {'maturity': '10Y', 'tenor': 10,    'yield': jitter(4.35, 0.003)},
        {'maturity': '20Y', 'tenor': 20,    'yield': jitter(4.65, 0.003)},
        {'maturity': '30Y', 'tenor': 30,    'yield': jitter(4.55, 0.003)},
    ]

    # Bond pricing (price given yield)
    def bond_price(coupon, ytm, maturity, face=100):
        pv = 0
        for t in range(1, maturity * 2 + 1):
            pv += (coupon / 2) / (1 + ytm / 2) ** t
        pv += face / (1 + ytm / 2) ** (maturity * 2)
        return round(pv, 3)

    def duration(coupon, ytm, maturity, face=100):
        """Modified duration."""
        total = 0
        price = bond_price(coupon, ytm, maturity, face)
        for t in range(1, maturity * 2 + 1):
            cf = coupon / 2
            pv_cf = cf / (1 + ytm / 2) ** t
            total += (t / 2) * pv_cf
        total += maturity * face / (1 + ytm / 2) ** (maturity * 2)
        mac_dur = total / price
        return round(mac_dur / (1 + ytm / 2), 3)

    bonds_list = [
        {'name': 'US T-Note 4.875%', 'coupon': 4.875, 'maturity': 5,  'rating': 'AAA'},
        {'name': 'US T-Note 4.625%', 'coupon': 4.625, 'maturity': 2,  'rating': 'AAA'},
        {'name': 'US T-Bond 4.25%',  'coupon': 4.25,  'maturity': 30, 'rating': 'AAA'},
        {'name': 'Corp IG (A-) 5.5%','coupon': 5.5,   'maturity': 10, 'rating': 'A-'},
        {'name': 'Corp HY (BB) 7.2%','coupon': 7.2,   'maturity': 7,  'rating': 'BB'},
        {'name': 'Muni 3.8%',        'coupon': 3.8,   'maturity': 15, 'rating': 'AA'},
    ]
    ytm_map = {5: 4.28, 2: 4.62, 30: 4.55, 10: 4.35, 7: 4.30, 15: 4.50}
    bonds_data = []
    for b in bonds_list:
        ytm = jitter(ytm_map.get(b['maturity'], 4.5) / 100, 0.005)
        price = bond_price(b['coupon'] / 100, ytm, b['maturity'])
        dur = duration(b['coupon'] / 100, ytm, b['maturity'])
        spread = round((ytm - 4.35 / 100) * 10000, 1)  # vs 10Y treasury
        bonds_data.append({
            'name': b['name'],
            'coupon': b['coupon'],
            'ytm': round(ytm * 100, 3),
            'price': price,
            'duration': dur,
            'maturity': b['maturity'],
            'rating': b['rating'],
            'spread_bps': spread,
        })

    return {
        'yield_curve': yield_curve,
        'bonds': bonds_data,
        'spreads': {
            'hy_ig_spread': round(jitter(3.45, 0.02), 2),
            'ig_treasury_spread': round(jitter(1.12, 0.02), 2),
            'tips_breakeven_10y': round(jitter(2.31, 0.02), 2),
        }
    }

# ─── FX ──────────────────────────────────────────────────────────────────────

def get_fx():
    pairs = [
        {'pair': 'EUR/USD', 'rate': 1.0842, 'bid': 1.0840, 'ask': 1.0844},
        {'pair': 'GBP/USD', 'rate': 1.2674, 'bid': 1.2672, 'ask': 1.2676},
        {'pair': 'USD/JPY', 'rate': 156.82, 'bid': 156.80, 'ask': 156.84},
        {'pair': 'AUD/USD', 'rate': 0.6532, 'bid': 0.6530, 'ask': 0.6534},
        {'pair': 'USD/CHF', 'rate': 0.9012, 'bid': 0.9010, 'ask': 0.9014},
        {'pair': 'USD/CAD', 'rate': 1.3641, 'bid': 1.3639, 'ask': 1.3643},
        {'pair': 'NZD/USD', 'rate': 0.6043, 'bid': 0.6041, 'ask': 0.6045},
        {'pair': 'EUR/GBP', 'rate': 0.8554, 'bid': 0.8552, 'ask': 0.8556},
    ]
    result = []
    for p in pairs:
        r = jitter(p['rate'], 0.001)
        chg = round(random.uniform(-0.5, 0.5), 4)
        chg_pct = round(chg / r * 100, 3)
        result.append({
            'pair': p['pair'],
            'rate': round(r, 4),
            'bid': round(r - 0.0002, 4),
            'ask': round(r + 0.0002, 4),
            'change': chg,
            'change_pct': chg_pct,
            'session_high': round(r * 1.002, 4),
            'session_low': round(r * 0.998, 4),
        })

    # Intraday EUR/USD 5-min candles simulation (last 48 bars)
    eurusd_intraday = []
    base_price = 1.0842
    for i in range(48):
        base_price = jitter(base_price, 0.0015)
        eurusd_intraday.append({
            'time': i,
            'open': round(base_price, 4),
            'close': round(jitter(base_price, 0.0005), 4),
            'high': round(base_price * 1.001, 4),
            'low': round(base_price * 0.999, 4),
        })

    return {
        'pairs': result,
        'eurusd_intraday': eurusd_intraday,
        'central_bank_rates': [
            {'bank': 'Federal Reserve',  'rate': 5.25, 'last_change': '2024-07-31'},
            {'bank': 'ECB',              'rate': 4.00, 'last_change': '2024-06-06'},
            {'bank': 'Bank of England',  'rate': 5.25, 'last_change': '2024-08-01'},
            {'bank': 'Bank of Japan',    'rate': 0.10, 'last_change': '2024-03-19'},
            {'bank': 'RBA',              'rate': 4.35, 'last_change': '2023-11-07'},
        ]
    }

# ─── Macro / BLS ─────────────────────────────────────────────────────────────

def get_macro():
    return [
        {'indicator': 'CPI-U (YoY)',        'value': '3.3%',   'period': 'May 2026', 'trend': 'down'},
        {'indicator': 'Core CPI (YoY)',     'value': '3.4%',   'period': 'May 2026', 'trend': 'down'},
        {'indicator': 'Unemployment Rate',  'value': '4.0%',   'period': 'May 2026', 'trend': 'stable'},
        {'indicator': 'Nonfarm Payrolls',   'value': '+272K',  'period': 'May 2026', 'trend': 'up'},
        {'indicator': 'GDP Growth (QoQ)',   'value': '2.8%',   'period': 'Q1 2026',  'trend': 'down'},
        {'indicator': 'PCE Deflator (YoY)','value': '2.7%',   'period': 'Apr 2026', 'trend': 'down'},
        {'indicator': 'ISM Manufacturing', 'value': '48.7',   'period': 'May 2026', 'trend': 'down'},
        {'indicator': 'Retail Sales (MoM)','value': '+0.3%',  'period': 'Apr 2026', 'trend': 'up'},
        {'indicator': 'PPI (YoY)',          'value': '2.4%',   'period': 'Apr 2026', 'trend': 'down'},
        {'indicator': 'Trade Balance',      'value': '-$69.4B','period': 'Mar 2026', 'trend': 'stable'},
    ]

# ─── AI Agents ───────────────────────────────────────────────────────────────

def get_ai_agents():
    return [
        {
            'name': 'Warren Buffett',
            'style': 'Value Investing',
            'sentiment': 'BULLISH',
            'confidence': 78,
            'thesis': 'Market valuations remain elevated but quality compounders like AAPL and MSFT justify premium multiples given their durable competitive moats. FCF generation is exceptional. Recommend accumulating on dips below 200-day MA.',
            'top_picks': ['AAPL', 'BRK.B', 'KO', 'MCO'],
            'risk_level': 'MODERATE',
        },
        {
            'name': 'Ray Dalio',
            'style': 'Risk Parity / Macro',
            'sentiment': 'NEUTRAL',
            'confidence': 62,
            'thesis': 'The debt cycle is entering a deleveraging phase. Holding balanced exposure across equities, bonds, gold, and inflation-linked assets is prudent. Monetary policy divergence creates FX opportunities.',
            'top_picks': ['GLD', 'TLT', 'EEM', 'TIP'],
            'risk_level': 'CONSERVATIVE',
        },
        {
            'name': 'George Soros',
            'style': 'Global Macro / Reflexivity',
            'sentiment': 'BEARISH',
            'confidence': 55,
            'thesis': 'Reflexive dynamics are amplifying risk-off sentiment in EM. Short USD/EM FX pairs and long volatility through options structures. The Fed pivot narrative is premature — rates stay higher for longer.',
            'top_picks': ['SH', 'VXX', 'TBT'],
            'risk_level': 'AGGRESSIVE',
        },
        {
            'name': 'Peter Lynch',
            'style': 'Growth at Reasonable Price',
            'sentiment': 'BULLISH',
            'confidence': 71,
            'thesis': "GARP opportunities exist in mid-caps where PEG ratios are below 1.5. AI infrastructure plays and healthcare innovation names show accelerating earnings growth. Own what you know — NVDA dominance in AI compute is undeniable.",
            'top_picks': ['NVDA', 'AMZN', 'GOOGL', 'MSFT'],
            'risk_level': 'MODERATE',
        },
    ]

# ─── Master Payload ───────────────────────────────────────────────────────────

def get_full_payload():
    return {
        'status': 'OK',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'market_overview': get_market_overview(),
        'portfolio': get_portfolio(),
        'options': get_options_chain('SPY'),
        'bonds': get_bonds(),
        'fx': get_fx(),
        'macro': get_macro(),
        'ai_agents': get_ai_agents(),
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fincept Terminal Bridge CLI")
    parser.add_argument("--action", choices=["full", "portfolio", "options", "bonds", "fx", "market"], default="full")
    parser.add_argument("--ticker", default="SPY")
    args = parser.parse_args()

    if args.action == "full":
        print(json.dumps(get_full_payload(), indent=2))
    elif args.action == "portfolio":
        print(json.dumps(get_portfolio(), indent=2))
    elif args.action == "options":
        print(json.dumps(get_options_chain(args.ticker), indent=2))
    elif args.action == "bonds":
        print(json.dumps(get_bonds(), indent=2))
    elif args.action == "fx":
        print(json.dumps(get_fx(), indent=2))
    elif args.action == "market":
        print(json.dumps(get_market_overview(), indent=2))
