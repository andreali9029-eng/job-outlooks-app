/**
 * @file netPay.js
 * @description Canadian take-home pay (net pay) calculator for 2026.
 *   Uses CRA payroll-table method: tax = income × rate − constant K
 *   (K already embeds the basic personal amount credit).
 *   Quebec is approximated: KPMG 2026 brackets + QPP≈CPP + QPIP; EI at QC rate.
 *   Ontario adds surtax and health premium. Union dues are an optional %.
 * @author andreali9029-eng
 * @copyright © 2026 andreali9029-eng
 * @version 1.0.0
 */
import TAX from './data/tax-2026.json'

/**
 * Compute tax inside a bracket table: tax = income × rate − K.
 * @param {number} income - annual taxable income.
 * @param {Array<[number, number|null, number, number]>} brackets -
 *   [lower, upper|null, rate, K] rows.
 * @returns {number} tax amount.
 */
function bracketTax(income, brackets) {
  for (let i = 0; i < brackets.length; i++) {
    const [lo, hi, rate, K] = brackets[i]
    if (income >= lo && (hi === null || income < hi || i === brackets.length - 1)) {
      return Math.max(0, income * rate - (K || 0))
    }
  }
  return 0
}

// Ontario Health Premium (annual, employee-paid, ON residents > $20,000)
/**
 * Ontario Health Premium owed by an Ontario resident.
 * @param {number} income - annual income.
 * @returns {number} premium amount (0-900).
 */
function onHealthPremium(income) {
  if (income <= 20000) return 0
  if (income <= 48000) return 300
  if (income <= 72000) return Math.min(600, 450 + 0.25 * (income - 48000))
  if (income <= 200000) return Math.min(750, 600 + 0.25 * (income - 72000))
  return Math.min(900, 750 + 0.25 * (income - 200000))
}

/**
 * Calculate annual/hourly/biweekly net pay for a given province.
 * @param {{ hourlyWage?: number, hoursPerWeek?: number, province?: string, unionPct?: number }} opts
 * @returns {Object} gross/net amounts plus every deduction component
 *   (fedTax, provTax, health, cpp, ei, qpip, union).
 */
export function calcNetPay({ hourlyWage = 0, hoursPerWeek = 37.5, province = 'ON', unionPct = 0 }) {
  const annualGross = hourlyWage * hoursPerWeek * 52
  const annualGross2 = Math.max(0, annualGross)

  // Federal income tax
  const fedTax = bracketTax(annualGross2, TAX.federal.brackets)

  // Provincial income tax (+ ON surtax)
  let provTax = 0
  const prov = TAX.provinces[province]
  if (prov && prov.special) {
    // Quebec: brackets without K constant → subtract BPA × 14%
    const base = bracketTax(annualGross2, TAX.qc.brackets.map(b => [b[0], b[1], b[2], 0]))
    provTax = Math.max(0, base - TAX.qc.bpa * 0.14)
  } else if (prov) {
    provTax = bracketTax(annualGross2, prov.brackets)
    if (prov.surtax && provTax > prov.surtax[0]) {
      const base = provTax
      if (base > prov.surtax[1]) provTax = base + (prov.surtax[1] - prov.surtax[0]) * 0.20 + (base - prov.surtax[1]) * 0.36
      else provTax = base + (base - prov.surtax[0]) * 0.20
    }
  }

  // ON health premium
  const health = prov && prov.healthPremium ? onHealthPremium(annualGross2) : 0

  // CPP (QPP approximated for QC)
  const cppBase = Math.max(0, Math.min(annualGross2, TAX.cpp.ympe) - TAX.cpp.exemption) * TAX.cpp.rate
  const cpp2 = Math.max(0, Math.min(annualGross2, TAX.cpp.yampe) - TAX.cpp.ympe) * TAX.cpp.cpp2Rate

  // EI (lower QC rate)
  const ei = Math.min(annualGross2, TAX.ei.mie) * (province === 'QC' ? TAX.ei.qcRate : TAX.ei.rate)

  // Quebec Parental Insurance Plan
  const qpip = province === 'QC' ? Math.min(annualGross2, 100000) * TAX.qc.qpipRate : 0

  // Union dues (optional, % of gross)
  const union = annualGross2 * (Math.min(20, Math.max(0, unionPct)) / 100)

  const totalDeductions = fedTax + provTax + health + cppBase + cpp2 + ei + qpip + union
  const annualNet = Math.max(0, annualGross2 - totalDeductions)

  return {
    annualGross: annualGross2,
    annualNet,
    hourlyNet: annualNet / (hoursPerWeek * 52),
    biweeklyNet: annualNet / 26,
    fedTax,
    provTax,
    health,
    cpp: cppBase + cpp2,
    ei,
    qpip,
    union,
    totalDeductions,
  }
}
