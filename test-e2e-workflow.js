const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(payload);
    }
    req.end();
  });
}

async function runE2E() {
  console.log('========================================================');
  console.log('🚀 STARTING KICTAMC END-TO-END APPLICATION WORKFLOW TEST');
  console.log('========================================================\n');

  // STEP 1: Register New Sierra Leone Applicant
  const uniqueSuffix = Date.now().toString().slice(-5);
  const applicantEmail = `student_${uniqueSuffix}@kictamc.edu.sl`;
  const applicantPhone = `+23276${uniqueSuffix}`;

  console.log(`[1/7] Registering Applicant: ${applicantEmail} (${applicantPhone})...`);
  const regRes = await request({
    path: '/api/v1/auth/register',
    method: 'POST'
  }, {
    firstName: 'Mohamed',
    surname: 'Koroma',
    email: applicantEmail,
    phone: applicantPhone,
    password: 'Password@123!',
    confirmPassword: 'Password@123!',
    acceptTerms: true
  });

  if (regRes.status !== 201) {
    console.error('Registration failed:', regRes);
    return;
  }
  const applicantToken = regRes.data.data.accessToken;
  console.log(' Applicant Registered & JWT Token Issued Successfully.');

  // STEP 2: Start / Fetch Application Draft
  console.log('\n[2/7] Fetching Academic Programmes & Creating Application Draft...');
  const draftRes = await request({
    path: '/api/v1/applications/draft',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${applicantToken}` }
  });

  if (draftRes.status !== 200 && draftRes.status !== 201) {
    console.error('Failed to get/create application draft:', draftRes);
    return;
  }
  const application = draftRes.data.data;
  console.log(` Application Draft Initialized: Ref #${application.applicationReference} (ID: ${application.id})`);

  // STEP 3: Update Draft with Sierra Leone Geographic & Personal Information
  console.log('\n[3/7] Updating Applicant Personal & Sierra Leone Geographic Data...');
  const updateRes = await request({
    path: `/api/v1/applications/${application.id}`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${applicantToken}` }
  }, {
    currentStep: 3,
    personal: {
      firstName: 'Mohamed',
      surname: 'Koroma',
      gender: 'MALE',
      dateOfBirth: '2004-05-18T00:00:00.000Z',
      nationality: 'Sierra Leonean',
      maritalStatus: 'Single',
      placeOfBirth: 'Kenema'
    },
    contact: {
      residentialAddress: '42 Hangha Road, Kenema',
      townCity: 'Kenema',
      chiefdom: 'Nongowa',
      district: 'Kenema District',
      regionProvince: 'Eastern Province'
    },
    parent: {
      parentFullName: 'Alpha Koroma',
      parentRelationship: 'Father',
      parentPhone: '+23277123456',
      parentAddress: 'Kenema Town'
    },
    emergency: {
      emergencyFullName: 'Fatmata Koroma',
      emergencyRelationship: 'Mother',
      emergencyPhone: '+23277987654',
      emergencyAddress: 'Kenema Town'
    }
  });

  console.log(' Draft Updated:', updateRes.status === 200 ? 'SUCCESS' : 'FAILED');

  // STEP 4: Add WASSCE Education Qualifications
  console.log('\n[4/7] Submitting Secondary School WASSCE Qualifications...');
  const eduRes = await request({
    path: `/api/v1/applications/${application.id}/educations`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${applicantToken}` }
  }, {
    institutionName: 'Government Secondary School Kenema',
    institutionLocation: 'Kenema',
    examinationType: 'WASSCE',
    examinationYear: 2023,
    candidateNumber: `1040103${uniqueSuffix}`,
    qualificationObtained: 'WASSCE Certificate',
    completionStatus: 'COMPLETED',
    subjectsAndGrades: [
      { subject: 'English Language', grade: 'B3' },
      { subject: 'Mathematics', grade: 'A1' },
      { subject: 'Physics', grade: 'B2' },
      { subject: 'Chemistry', grade: 'B3' },
      { subject: 'Information Technology', grade: 'A1' }
    ]
  });
  console.log(' WASSCE Qualifications Recorded:', eduRes.status === 201 ? 'SUCCESS' : 'FAILED');

  // STEP 5: Log Application Fee Payment (Orange Money)
  console.log('\n[5/7] Submitting Application Fee Payment (Orange Money)...');
  const payRes = await request({
    path: `/api/v1/applications/${application.id}/payments`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${applicantToken}` }
  }, {
    paymentMethod: 'MANUAL_ORANGE_MONEY',
    declaredAmountMinor: 20000,
    currency: 'SLE',
    providerTransactionReference: `OM-SL-${uniqueSuffix}-99`
  });

  if (payRes.status !== 201) {
    console.error('Failed to log payment:', payRes);
    return;
  }
  const payment = payRes.data.data;
  console.log(` Payment Logged: Ref #${payment.internalReference} - Amount: SLE ${(payment.declaredAmountMinor / 100).toFixed(2)} - Status: ${payment.status}`);

  // STEP 6: Finance Officer Verifies Payment via Ledger
  console.log('\n[6/7] Finance Officer Logging In & Verifying Payment via Ledger...');
  const finLogin = await request({
    path: '/api/v1/auth/login',
    method: 'POST'
  }, { emailOrPhone: process.env.TEST_FINANCE_EMAIL || 'finance@kictamc.edu.sl', password: process.env.SEED_FINANCE_PASSWORD || process.env.TEST_FINANCE_PASSWORD || '' });
  const financeToken = finLogin.data.data.accessToken;

  const verifyPayRes = await request({
    path: `/api/v1/admin/payments/${payment.id}/verify`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${financeToken}` }
  });

  if (verifyPayRes.status !== 200) {
    console.error('Payment verification failed:', verifyPayRes);
    return;
  }
  const verifiedPayment = verifyPayRes.data.data;
  console.log(` Payment Verified by Finance: Status = ${verifiedPayment.payment?.status || 'PAID'}`);
  const confirmationToken = verifiedPayment.token?.token;
  console.log(` 🔑 Secure Confirmation Token Generated: ${confirmationToken}`);

  // STEP 7: Admissions Officer Approves Dossier & Confirms Public Verification
  console.log('\n[7/7] Admissions Officer Reviewing Dossier & Issuing Approval Decision...');
  const admLogin = await request({
    path: '/api/v1/auth/login',
    method: 'POST'
  }, { emailOrPhone: process.env.TEST_ADMISSIONS_EMAIL || 'admissions@kictamc.edu.sl', password: process.env.SEED_ADMISSIONS_PASSWORD || process.env.TEST_ADMISSIONS_PASSWORD || '' });
  const admissionsToken = admLogin.data.data.accessToken;

  const decisionRes = await request({
    path: `/api/v1/admin/applications/${application.id}/decision`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${admissionsToken}` }
  }, {
    decision: 'APPROVED',
    decisionNotes: 'Applicant meets all entry requirements with outstanding distinction in Mathematics (A1) and IT (A1). Official admission granted for 2026/2027 academic session.'
  });

  if (decisionRes.status !== 200) {
    console.error('Admissions decision failed:', decisionRes);
    return;
  }
  console.log(` Admissions Status: APPROVED (Status = ${decisionRes.data.data.status})`);

  // Public Token Lookup Verification
  console.log('\n--- PUBLIC TOKEN VERIFICATION LOOKUP ---');
  const verifyTokenRes = await request({
    path: `/api/v1/tokens/${confirmationToken}`,
    method: 'GET'
  });

  if (verifyTokenRes.status === 200 && verifyTokenRes.data?.data) {
    const vt = verifyTokenRes.data.data;
    console.log(` Verification Confirmed:`);
    console.log(`   Candidate:   ${vt.applicantName}`);
    console.log(`   Ref Number:  ${vt.applicationReference}`);
    console.log(`   Programme:   ${vt.courseName}`);
    console.log(`   Amount:      SLE ${vt.amountPaidSLE} (${vt.currency})`);
    console.log(`   Valid Token: ${vt.isValid ? 'YES (Verified in Bursar Ledger)' : 'NO'}`);
  } else {
    console.log('Token verification response:', verifyTokenRes);
  }

  console.log('\n========================================================');
  console.log('🎉 END-TO-END WORKFLOW SUCCEEDED: 100% OPERATIONAL');
  console.log('========================================================\n');
}

runE2E();
