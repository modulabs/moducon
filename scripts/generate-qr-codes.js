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

// Booth codes from DB (B01~B17)
const boothCodes = [
  'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09',
  'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17'
];

// Paper codes from DB (P01~P32)
const paperCodes = [
  'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10',
  'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20',
  'P21', 'P22', 'P23', 'P24', 'P25', 'P26', 'P27', 'P28', 'P29', 'P30',
  'P31', 'P32'
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
