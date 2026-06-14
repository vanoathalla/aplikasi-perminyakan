// ============================================================
// CORE CALCULATION ENGINE - Migas Economic Analysis
// Ported from app.py with full report formula compliance
// ============================================================

export interface ProjectParams {
  projectDuration: number;
  capitalInvestment: number;
  nonCapitalInvestment: number;
  productionYears: number[]; // 7 values (year 1–7)
  declineRate: number;        // percentage
  oilPrice: number;           // $/bbl
  opexPerYear: number;        // $M
  depreciationMethod: "Straight Line" | "Declining Balance" | "Unit of Production";
  taxRate: number;            // percentage
  discountRate: number;       // percentage
}

export interface CashFlowRow {
  year: number;
  production: number;         // Mbbl
  income: number;             // $M
  capital: number;            // $M
  nonCapital: number;         // $M
  opex: number;               // $M
  depreciation: number;       // $M
  taxableIncome: number;      // $M
  tax: number;                // $M
  ncfUndiscounted: number;    // $M
  cumulativeNcf: number;      // $M
}

export interface EconomicIndicators {
  npv: number;
  pot: number | null;          // years, null if never recovered
  ror: number;                 // %
  totalNcf: number;
}

export interface CalculationResult {
  rows: CashFlowRow[];
  indicators: EconomicIndicators;
  productionProfile: number[]; // full production array years 1..n
}

// -------------------------------------------------------
// Production projection (exponential decline after year 7)
// -------------------------------------------------------
function buildProductionProfile(params: ProjectParams): number[] {
  const production: number[] = [...params.productionYears]; // indices 0–6 = year 1–7

  let lastProd = params.productionYears[6];
  for (let y = 8; y <= params.projectDuration; y++) {
    lastProd = lastProd * (1 - params.declineRate / 100);
    production.push(lastProd);
  }
  return production; // length = projectDuration
}

// -------------------------------------------------------
// Depreciation schedule
// Basis depresiasi = TOTAL investasi (Capital + Non-Capital)
// sesuai contoh perhitungan dosen: Di = (K + NK) / N
// -------------------------------------------------------
function buildDepreciationSchedule(
  params: ProjectParams,
  productionProfile: number[],
  totalInvestment: number          // <-- terima total investasi
): number[] {
  const n = params.projectDuration;
  const basis = totalInvestment;   // pakai total, bukan hanya capital
  const depr: number[] = [];

  if (params.depreciationMethod === "Straight Line") {
    // Di = Total / N  (flat setiap tahun)
    for (let i = 0; i < n; i++) {
      depr.push(basis / n);
    }
  } else if (params.depreciationMethod === "Declining Balance") {
    // Double Declining Balance
    const rate = 2 / n;
    let bookValue = basis;
    for (let i = 0; i < n; i++) {
      let d = bookValue * rate;
      if (d > bookValue) d = bookValue;
      depr.push(d);
      bookValue -= d;
    }
  } else {
    // Unit of Production: proporsional terhadap volume produksi
    const totalProd = productionProfile.reduce((a, b) => a + b, 0);
    for (let i = 0; i < n; i++) {
      depr.push(totalProd > 0 ? (basis / totalProd) * productionProfile[i] : 0);
    }
  }
  return depr;
}

// -------------------------------------------------------
// Main calculation function
// -------------------------------------------------------
export function calculate(params: ProjectParams): CalculationResult {
  const totalInvestment = params.capitalInvestment + params.nonCapitalInvestment;
  const n = params.projectDuration;
  const taxRateFrac = params.taxRate / 100;
  const discountRateFrac = params.discountRate / 100;

  const productionProfile = buildProductionProfile(params);
  const depreciationSchedule = buildDepreciationSchedule(params, productionProfile, totalInvestment);

  const rows: CashFlowRow[] = [];
  const ncfValues: number[] = [];

  // Year 0
  const year0Row: CashFlowRow = {
    year: 0,
    production: 0,
    income: 0,
    capital: params.capitalInvestment,
    nonCapital: params.nonCapitalInvestment,
    opex: 0,
    depreciation: 0,
    taxableIncome: 0,
    tax: 0,
    ncfUndiscounted: -totalInvestment,
    cumulativeNcf: -totalInvestment,
  };
  rows.push(year0Row);
  ncfValues.push(-totalInvestment);

  for (let i = 0; i < n; i++) {
    const prod = productionProfile[i];
    const income = prod * params.oilPrice;
    const opex = params.opexPerYear;
    const depr = depreciationSchedule[i];

    let taxableIncome = income - opex - depr;
    if (taxableIncome < 0) taxableIncome = 0;

    const tax = taxableIncome * taxRateFrac;
    // NCF = Taxable Income - Tax  (formula from report section 1.6.3)
    const ncf = taxableIncome - tax;

    ncfValues.push(ncf);

    rows.push({
      year: i + 1,
      production: prod,
      income,
      capital: 0,
      nonCapital: 0,
      opex,
      depreciation: depr,
      taxableIncome,
      tax,
      ncfUndiscounted: ncf,
      cumulativeNcf: 0, // filled below
    });
  }

  // Cumulative NCF
  let cumSum = 0;
  for (let i = 0; i < rows.length; i++) {
    cumSum += rows[i].ncfUndiscounted;
    rows[i].cumulativeNcf = cumSum;
  }

  // NPV
  const npv = ncfValues.reduce(
    (acc, val, t) => acc + val / Math.pow(1 + discountRateFrac, t),
    0
  );

  // Total NCF
  const totalNcf = ncfValues.reduce((a, b) => a + b, 0);

  // POT — first year cumulative NCF > 0
  let pot: number | null = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].cumulativeNcf > 0) {
      pot = rows[i].year;
      break;
    }
  }

  // ROR = (Total NCF / Total Investment) * 100
  const ror = totalInvestment > 0 ? (totalNcf / totalInvestment) * 100 : 0;

  return {
    rows,
    indicators: { npv, pot, ror, totalNcf },
    productionProfile,
  };
}

// -------------------------------------------------------
// CSV Export utility
// -------------------------------------------------------
export function exportToCSV(rows: CashFlowRow[]): string {
  const headers = [
    "Tahun",
    "Produksi (Mbbl)",
    "Pendapatan ($M)",
    "Inv. Kapital ($M)",
    "Inv. Non-Kapital ($M)",
    "Biaya Operasional ($M)",
    "Depresiasi ($M)",
    "Pend. Kena Pajak ($M)",
    "Pajak ($M)",
    "Aliran Kas Bersih ($M)",
    "Aliran Kas Kumulatif ($M)",
  ];

  const lines: string[] = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.year,
        row.production.toFixed(2),
        row.income.toFixed(2),
        row.capital.toFixed(2),
        row.nonCapital.toFixed(2),
        row.opex.toFixed(2),
        row.depreciation.toFixed(2),
        row.taxableIncome.toFixed(2),
        row.tax.toFixed(2),
        row.ncfUndiscounted.toFixed(2),
        row.cumulativeNcf.toFixed(2),
      ].join(",")
    );
  }

  // Total row
  const sum = (key: keyof CashFlowRow) =>
    rows.reduce((a, r) => a + (r[key] as number), 0).toFixed(2);

  lines.push(
    [
      "TOTAL",
      sum("production"),
      sum("income"),
      sum("capital"),
      sum("nonCapital"),
      sum("opex"),
      sum("depreciation"),
      sum("taxableIncome"),
      sum("tax"),
      sum("ncfUndiscounted"),
      rows[rows.length - 1]?.cumulativeNcf.toFixed(2) ?? "0.00",
    ].join(",")
  );

  return lines.join("\n");
}

export function formatCurrency(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1000) {
    return `${val < 0 ? "-" : ""}$${(abs / 1000).toFixed(2)}B`;
  }
  return `${val < 0 ? "-" : ""}$${abs.toFixed(2)}M`;
}

export function formatNumber(val: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}
