import { prisma } from '../../utils/prisma';

export const DEFAULT_LETTER_CONFIG = {
  title: 'Offer of Admission',
  institutionName: 'Kenema ICT & Management College',
  institutionMotto: 'Non Sibi Sed Patriae (Not For Self, But For Country)',
  institutionAddress: '19 Bockarie Gbay Street Kenema • Contact: +23272808080',
  institutionEmail: 'admissions@kictamc.edu.sl',
  institutionWebsite: 'www.kictamc.edu.sl',
  officeName: 'Office of the Registrar & Academic Admissions Board',
  salutationPrefix: 'Dear',
  openingText:
    'Following the official review of your secondary academic credentials and your successful completion and verification of the Admissions Interview, the Admissions Board of Kenema ICT & Management College is pleased to offer you admission into the following academic programme for the forthcoming session:',
  conditions: [
    'Credential Verification: You must present your original WASSCE / BECE certificates, birth certificate, and national identification to the Academic Registry for final verification during matriculation.',
    'Fee Compliance: Course registration and issuance of student matriculation number is strictly contingent upon payment of the first installment (60%).',
    'Offer Validity: This admission offer remains valid for twenty-one (21) days from the date of this letter.',
  ],
  validityDays: 21,
  firstInstallmentPercent: 60,
  closingText:
    'On behalf of the Governing Council and Academic Staff of KICTAMC, congratulations on your admission.',
  primarySignatoryName: 'Mr. S. M. Kallon',
  primarySignatoryTitle: 'Registrar & Secretary to Council',
  primarySignatoryOffice: 'KICTAMC Academic Registry',
  primarySignatureText: 'S. M. Kallon',
  secondarySignatoryName: 'Dr. A. B. Kamara',
  secondarySignatoryTitle: 'Dean of Academic Affairs',
  secondarySignatoryOffice: 'Admissions Board Chair',
  secondarySignatureText: 'Dr. A. B. Kamara',
  bankName1: 'Rokel Commercial Bank (SL) Ltd',
  accountNumber1: '01-002-394819-01',
  bankName2: 'Sierra Leone Commercial Bank',
  accountNumber2: '003-010-449102-02',
  mobileMoneyMerchant: '728080',
  sealTopText: 'KENEMA ICT & MANAGEMENT COLLEGE',
  sealCenterText: 'OFFICIALLY SEALED',
  sealBottomText: 'OFFICE OF THE REGISTRAR • SIERRA LEONE',
};

export const DEFAULT_RECEIPT_CONFIG = {
  title: 'Official Bursary Receipt',
  voucherTitle: 'Cryptographic Payment Confirmation Voucher',
  institutionName: 'Kenema ICT & Management College',
  institutionMotto: 'Non Sibi Sed Patriae (Not For Self, But For Country)',
  officeName: 'Office of the Bursar & Financial Services Directorate',
  address: '19 Bockarie Gbay Street Kenema',
  contactNumber: '+23272808080',
  email: 'bursar@kictamc.edu.sl',
  currencySymbol: 'SLE',
  auditorName: 'Internal Audit',
  auditorTitle: 'Admissions Audit Office',
  auditorOffice: 'Internal Audit Directorate • Kenema Campus',
  bursarName: 'Mr. Mohamed S. Koroma',
  bursarTitle: 'Bursar & Chief Financial Officer',
  bursarOffice: 'KICTAMC Finance Office',
  bursarSignatureText: 'M. S. Koroma',
  sealTextTop: 'OFFICE OF THE BURSAR',
  sealTextCenter: 'FEES CLEARED',
  sealTextBottom: 'KICTAMC • KENEMA CAMPUS',
  policyNotice:
    'This official electronic receipt and cryptographic payment token certify that the candidate has satisfied the statutory application fee requirement of Kenema ICT & Management College. This receipt is an official collegiate fiscal instrument. Please present this document along with your Offer of Admission letter during matriculation and physical document verification.',
};

let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DocumentConfig" (
        "key" VARCHAR(100) PRIMARY KEY,
        "value" JSONB NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableInitialized = true;
  } catch (error) {
    console.error('Failed to initialize DocumentConfig table:', error);
  }
}

export const documentConfigService = {
  async getConfig(type: 'letter' | 'receipt') {
    await ensureTable();
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "value" FROM "DocumentConfig" WHERE "key" = $1 LIMIT 1`,
        type
      );
      if (rows && rows.length > 0 && rows[0].value) {
        const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        const defaults = type === 'letter' ? DEFAULT_LETTER_CONFIG : DEFAULT_RECEIPT_CONFIG;
        return { ...defaults, ...val };
      }
    } catch (e) {
      console.warn(`Could not read DocumentConfig (${type}) from DB, returning defaults:`, e);
    }
    return type === 'letter' ? { ...DEFAULT_LETTER_CONFIG } : { ...DEFAULT_RECEIPT_CONFIG };
  },

  async setConfig(type: 'letter' | 'receipt', payload: any) {
    await ensureTable();
    const defaults = type === 'letter' ? DEFAULT_LETTER_CONFIG : DEFAULT_RECEIPT_CONFIG;
    const merged = { ...defaults, ...payload };

    await prisma.$executeRawUnsafe(
      `INSERT INTO "DocumentConfig" ("key", "value", "updatedAt")
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT ("key") DO UPDATE SET "value" = $2::jsonb, "updatedAt" = NOW()`,
      type,
      JSON.stringify(merged)
    );

    return merged;
  },
};
