/**
 * 세션 데이터 임포트 스크립트
 * 엑셀 '세션' 시트 → DB sessions 테이블
 */
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

const EXCEL_PATH = path.join(__dirname, '../../모두콘 TF  - 모두콘 2025.xlsx');

interface SessionRow {
  '번호': string;
  '페이지': string;
  '트랙': string;
  '위치': string;
  '발표-시간': string;
  '연사-명': string;
  '연사-소속': string;
  '연사-소개': string;
  '연사-프로필': string;
  '발표-제목': string;
  '발표-내용': string;
  '키워드1': string;
  '키워드2': string;
  '키워드3': string;
}

async function importSessions() {
  console.log('🚀 세션 데이터 임포트 시작...');
  console.log(`📁 엑셀 파일: ${EXCEL_PATH}`);

  // 엑셀 파일 읽기
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets['세션'];

  if (!sheet) {
    console.error('❌ "세션" 시트를 찾을 수 없습니다.');
    return;
  }

  const rows = XLSX.utils.sheet_to_json<SessionRow>(sheet);
  console.log(`📊 총 ${rows.length}개 세션 데이터 발견`);

  let success = 0;
  let errors = 0;

  for (const row of rows) {
    const code = row['번호']?.toString().trim();
    if (!code) continue;

    try {
      // 키워드 배열 생성 (빈 값 제외)
      const keywords = [
        row['키워드1'],
        row['키워드2'],
        row['키워드3']
      ].filter(k => k && k.toString().trim() !== '');

      await prisma.session.upsert({
        where: { code },
        update: {
          track: row['트랙'] || '',
          location: row['위치'] || '',
          timeSlot: row['발표-시간'] || '',
          speakerName: row['연사-명'] || '',
          speakerOrg: row['연사-소속'] || null,
          speakerBio: row['연사-소개'] || null,
          speakerProfileUrl: row['연사-프로필'] || null,
          title: row['발표-제목'] || '',
          description: row['발표-내용'] || null,
          keywords,
          pageUrl: row['페이지'] || null,
          isActive: true,
        },
        create: {
          code,
          track: row['트랙'] || '',
          location: row['위치'] || '',
          timeSlot: row['발표-시간'] || '',
          speakerName: row['연사-명'] || '',
          speakerOrg: row['연사-소속'] || null,
          speakerBio: row['연사-소개'] || null,
          speakerProfileUrl: row['연사-프로필'] || null,
          title: row['발표-제목'] || '',
          description: row['발표-내용'] || null,
          keywords,
          pageUrl: row['페이지'] || null,
          isActive: true,
        },
      });

      console.log(`✅ ${code}: ${(row['발표-제목'] || '').substring(0, 40)}...`);
      success++;
    } catch (error) {
      console.error(`❌ ${code} 실패:`, error);
      errors++;
    }
  }

  console.log('\n📊 세션 임포트 결과:');
  console.log(`   ✅ 성공: ${success}개`);
  console.log(`   ❌ 실패: ${errors}개`);
}

importSessions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
