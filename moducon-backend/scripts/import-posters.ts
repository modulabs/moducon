/**
 * 포스터 데이터 임포트 스크립트
 * 엑셀 '포스터목록' 시트 → DB posters 테이블
 */
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

const EXCEL_PATH = path.join(__dirname, '../../모두콘 TF  - 모두콘 2025.xlsx');

interface PosterRow {
  '저자': string;
  '소속': string;
  '학회명': string;
  '논문명': string;
  '원본파일': string;
  '논문 링크': string;
  '구분': string;
  '메일주소': string;
  '발표 시간': string;
  '발표 참여': string;
  '동행인': string;
}

async function importPosters() {
  console.log('🚀 포스터 데이터 임포트 시작...');
  console.log(`📁 엑셀 파일: ${EXCEL_PATH}`);

  // 엑셀 파일 읽기
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets['포스터목록'];

  if (!sheet) {
    console.error('❌ "포스터목록" 시트를 찾을 수 없습니다.');
    return;
  }

  const rows = XLSX.utils.sheet_to_json<PosterRow>(sheet);
  console.log(`📊 총 ${rows.length}개 포스터 데이터 발견`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = row['논문명']?.toString().trim();
    if (!title) continue;

    // 코드 자동 생성 (P01, P02, ...)
    const code = `P${String(i + 1).padStart(2, '0')}`;

    try {
      // 학회명을 해시태그로 사용
      const hashtags = row['학회명'] ? [row['학회명'].toString().trim()] : [];

      await prisma.poster.upsert({
        where: { code },
        update: {
          title,
          abstract: null,
          researcher: row['저자'] || null,
          affiliation: row['소속'] || null,
          hashtags,
          presentationTime: row['발표 시간'] || null,
          location: null,
          isActive: true,
        },
        create: {
          code,
          title,
          abstract: null,
          researcher: row['저자'] || null,
          affiliation: row['소속'] || null,
          hashtags,
          presentationTime: row['발표 시간'] || null,
          location: null,
          isActive: true,
        },
      });

      console.log(`✅ ${code}: ${title.substring(0, 50)}...`);
      success++;
    } catch (error) {
      console.error(`❌ ${code} 실패:`, error);
      errors++;
    }
  }

  console.log('\n📊 포스터 임포트 결과:');
  console.log(`   ✅ 성공: ${success}개`);
  console.log(`   ❌ 실패: ${errors}개`);
}

importPosters()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
