/**
 * 부스 데이터 임포트 스크립트
 * 엑셀 '부스' 시트 → DB booths 테이블
 */
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

const EXCEL_PATH = path.join(__dirname, '../../모두콘 TF  - 모두콘 2025.xlsx');

interface BoothRow {
  '타임스탬프': string;
  '단체명': string;
  '단체 소개': string;
  '담당자 성함': string;
  '부스 소개': string;
  '단체/부스 소개 이미지': string;
  '단체 구분': string;
  '해시태그': string;
  '제공 솔루션': string;
  '핵심 기술': string;
  '연구주제 및 목표': string;
  '주요 제품': string;
  '부스 내용(데모)': string;
}

async function importBooths() {
  console.log('🚀 부스 데이터 임포트 시작...');
  console.log(`📁 엑셀 파일: ${EXCEL_PATH}`);

  // 엑셀 파일 읽기
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets['부스'];

  if (!sheet) {
    console.error('❌ "부스" 시트를 찾을 수 없습니다.');
    return;
  }

  const rows = XLSX.utils.sheet_to_json<BoothRow>(sheet);
  console.log(`📊 총 ${rows.length}개 부스 데이터 발견`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row['단체명']?.toString().trim();
    if (!name) continue;

    // 코드 자동 생성 (B01, B02, ...)
    const code = `B${String(i + 1).padStart(2, '0')}`;

    try {
      // 해시태그 파싱 (#태그1 #태그2 형태)
      const hashtagStr = row['해시태그'] || '';
      const hashtags = hashtagStr
        .split(/[#\s]+/)
        .filter(t => t && t.trim() !== '');

      await prisma.booth.upsert({
        where: { code },
        update: {
          name,
          organization: name,
          orgType: row['단체 구분'] || null,
          description: row['단체 소개'] || null,
          boothDescription: row['부스 소개'] || null,
          hashtags,
          solutions: row['제공 솔루션'] || null,
          coreTech: row['핵심 기술'] || null,
          researchGoals: row['연구주제 및 목표'] || null,
          mainProducts: row['주요 제품'] || null,
          demoContent: row['부스 내용(데모)'] || null,
          imageUrl: row['단체/부스 소개 이미지'] || null,
          managerName: row['담당자 성함'] || null,
          isActive: true,
        },
        create: {
          code,
          name,
          organization: name,
          orgType: row['단체 구분'] || null,
          description: row['단체 소개'] || null,
          boothDescription: row['부스 소개'] || null,
          hashtags,
          solutions: row['제공 솔루션'] || null,
          coreTech: row['핵심 기술'] || null,
          researchGoals: row['연구주제 및 목표'] || null,
          mainProducts: row['주요 제품'] || null,
          demoContent: row['부스 내용(데모)'] || null,
          imageUrl: row['단체/부스 소개 이미지'] || null,
          managerName: row['담당자 성함'] || null,
          isActive: true,
        },
      });

      console.log(`✅ ${code}: ${name}`);
      success++;
    } catch (error) {
      console.error(`❌ ${code} (${name}) 실패:`, error);
      errors++;
    }
  }

  console.log('\n📊 부스 임포트 결과:');
  console.log(`   ✅ 성공: ${success}개`);
  console.log(`   ❌ 실패: ${errors}개`);
}

importBooths()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
