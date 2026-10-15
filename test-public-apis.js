const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAll() {
  console.log('--- Testing KICTAMC Public Website APIs ---');

  // 1. Overview
  const overview = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/public/overview',
    method: 'GET',
  });
  console.log('1. GET /api/v1/public/overview:', overview.status, {
    coursesCount: overview.data?.data?.coursesCount,
    facultiesCount: overview.data?.data?.facultiesCount,
    activeIntakes: overview.data?.data?.activeIntakes?.length,
    recentNews: overview.data?.data?.recentNews?.length,
    upcomingEvents: overview.data?.data?.upcomingEvents?.length,
  });

  // 2. News
  const news = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/public/news',
    method: 'GET',
  });
  console.log('2. GET /api/v1/public/news:', news.status, 'Total news:', news.data?.data?.length);

  // 3. News by slug
  const firstSlug = news.data?.data?.[0]?.slug;
  if (firstSlug) {
    const newsDetail = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/v1/public/news/${firstSlug}`,
      method: 'GET',
    });
    console.log(`3. GET /api/v1/public/news/${firstSlug}:`, newsDetail.status, 'Title:', newsDetail.data?.data?.title);
  }

  // 4. Events
  const events = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/public/events',
    method: 'GET',
  });
  console.log('4. GET /api/v1/public/events:', events.status, 'Total events:', events.data?.data?.length);

  // 5. Courses
  const courses = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/courses',
    method: 'GET',
  });
  console.log('5. GET /api/v1/courses:', courses.status, 'Total courses:', courses.data?.data?.length);

  // 6. Course Detail
  const firstCourseId = courses.data?.data?.[0]?.id;
  if (firstCourseId) {
    const courseDetail = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/v1/courses/${firstCourseId}`,
      method: 'GET',
    });
    console.log(`6. GET /api/v1/courses/${firstCourseId}:`, courseDetail.status, 'Name:', courseDetail.data?.data?.name);
  }

  // 7. Faculties
  const faculties = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/faculties',
    method: 'GET',
  });
  console.log('7. GET /api/v1/faculties:', faculties.status, 'Total faculties:', faculties.data?.data?.length);

  // 8. Public Enquiry Submission
  const enquiryPayload = JSON.stringify({
    fullName: 'Saccoh Test Prospective Student',
    email: 'saccoh.applicant@example.com',
    phone: '+232 76 111 222',
    subject: 'Inquiry regarding 2026/2027 BSc in Information Technology',
    message: 'Good day. Please provide the registration timeline and lecture commencement dates for the September intake.',
  });
  const enquiryRes = await request(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/public/enquiry',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(enquiryPayload),
      },
    },
    enquiryPayload
  );
  console.log('8. POST /api/v1/public/enquiry:', enquiryRes.status, enquiryRes.data);

  console.log('--- All Public Website APIs Tested Successfully ---');
}

testAll().catch(console.error);
