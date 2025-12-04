const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://moducon.vibemakers.kr/checkin';

// Session codes from DB
const sessionCodes = [
  '00-00', '00-01', '00-02', '00-03', '00-04', '00-05', '00-06',
  '01-01', '01-02', '01-03', '01-04', '01-05', '01-06',
  '10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09',
  '101-1', '101-2', '101-3', '101-4',
  'i-01', 'i-02', 'i-03', 'i-04', 'i-05', 'i-06'
];

// Booth codes from DB
const boothCodes = [
  'booth_1', 'booth_2', 'booth_3', 'booth_4', 'booth_5',
  'booth_6', 'booth_7', 'booth_8', 'booth_9', 'booth_10',
  'booth_11', 'booth_12', 'booth_13', 'booth_14', 'booth_15'
];

// Paper codes from DB
const paperCodes = [
  'paper_1', 'paper_2', 'paper_3', 'paper_4', 'paper_5',
  'paper_6', 'paper_7', 'paper_8', 'paper_9', 'paper_10',
  'paper_11', 'paper_12', 'paper_13', 'paper_14', 'paper_15',
  'paper_16', 'paper_17', 'paper_18', 'paper_19', 'paper_20',
  'paper_21', 'paper_22', 'paper_23', 'paper_24', 'paper_25',
  'paper_26', 'paper_27', 'paper_28', 'paper_29', 'paper_30',
  'paper_31', 'paper_32', 'paper_33'
];

// Registration desk
const registrationCodes = ['desk_main'];

const qrOptions = {
  errorCorrectionLevel: 'H',
  type: 'png',
  quality: 0.92,
  margin: 2,
  width: 512,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};

async function generateQRCode(type, code, outputDir) {
  const url = `${BASE_URL}?type=${type}&id=${code}`;
  const filename = `${code}.png`;
  const filepath = path.join(outputDir, filename);

  try {
    await QRCode.toFile(filepath, url, qrOptions);
    console.log(`✅ Generated: ${filepath}`);
    return { success: true, filepath };
  } catch (error) {
    console.error(`❌ Failed: ${filepath} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const baseDir = path.join(__dirname, '..', 'qr_codes');

  // Ensure directories exist
  const dirs = ['sessions', 'booths', 'posters', 'registration'];
  dirs.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  console.log('🚀 Generating QR codes...\n');

  // Generate session QR codes
  console.log('📅 Sessions:');
  for (const code of sessionCodes) {
    await generateQRCode('session', code, path.join(baseDir, 'sessions'));
  }

  // Generate booth QR codes
  console.log('\n🏢 Booths:');
  for (const code of boothCodes) {
    await generateQRCode('booth', code, path.join(baseDir, 'booths'));
  }

  // Generate paper QR codes
  console.log('\n📄 Posters:');
  for (const code of paperCodes) {
    await generateQRCode('paper', code, path.join(baseDir, 'posters'));
  }

  // Generate registration QR codes
  console.log('\n🎫 Registration:');
  for (const code of registrationCodes) {
    await generateQRCode('registration', code, path.join(baseDir, 'registration'));
  }

  console.log('\n✨ QR code generation complete!');
  console.log(`📁 Output directory: ${baseDir}`);

  // Summary
  const totalCount = sessionCodes.length + boothCodes.length + paperCodes.length + registrationCodes.length;
  console.log(`\n📊 Summary:`);
  console.log(`   Sessions: ${sessionCodes.length}`);
  console.log(`   Booths: ${boothCodes.length}`);
  console.log(`   Posters: ${paperCodes.length}`);
  console.log(`   Registration: ${registrationCodes.length}`);
  console.log(`   Total: ${totalCount} QR codes`);
}

main().catch(console.error);
