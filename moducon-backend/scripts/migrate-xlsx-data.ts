import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

const XLSX_PATH = path.join(__dirname, '../../모두콘 TF  - 모두콘 2025.xlsx');

interface SessionRow {
  번호: string;
  페이지: string;
  트랙: string;
  위치: string;
  '발표-시간': string;
  '연사-명': string;
  '연사-소속': string;
  '연사-소개': string;
  '연사-프로필': string;
  '발표-제목': string;
  '발표-내용': string;
  키워드1: string;
  키워드2: string;
  키워드3: string;
}

interface BoothRow {
  타임스탬프: string;
  단체명: string;
  '단체 소개': string;
  '담당자 성함': string;
  '부스 소개': string;
  '단체/부스 소개 이미지': string;
  '단체 구분': string;
  해시태그: string;
  '제공 솔루션': string;
  '핵심 기술': string;
  '연구주제 및 목표': string;
  '주요 제품': string;
  '부스 내용(데모)': string;
}

interface PosterRow {
  저자: string;
  소속: string;
  학회명: string;
  논문명: string;
  원본파일: string;
  '논문 링크': string;
  구분: string;
  메일주소: string;
  '발표 시간': string;
  '발표 참여': string;
}

function parseHashtags(hashtagStr: string | undefined): string[] {
  if (!hashtagStr || typeof hashtagStr !== 'string') return [];
  return hashtagStr
    .split(/[#,\s]+/)
    .filter((tag) => tag.trim().length > 0)
    .map((tag) => tag.trim());
}

async function migrateSessionData() {
  console.log('📚 Migrating session data...');

  const workbook = XLSX.readFile(XLSX_PATH);
  const sheet = workbook.Sheets['세션'];
  const rows: SessionRow[] = XLSX.utils.sheet_to_json(sheet);

  let count = 0;
  for (const row of rows) {
    if (!row['번호'] || !row['발표-제목']) continue;

    const keywords = [row.키워드1, row.키워드2, row.키워드3].filter(
      (k) => k && typeof k === 'string' && k.trim()
    );

    try {
      await prisma.session.upsert({
        where: { code: row['번호'] },
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
        },
        create: {
          code: row['번호'],
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
        },
      });
      count++;
    } catch (error) {
      console.error(`Error inserting session ${row['번호']}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} sessions`);
}

async function migrateBoothData() {
  console.log('🏪 Migrating booth data...');

  const workbook = XLSX.readFile(XLSX_PATH);
  const sheet = workbook.Sheets['부스'];
  const rows: BoothRow[] = XLSX.utils.sheet_to_json(sheet);

  let count = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row['단체명']) continue;

    const code = `booth_${i + 1}`;
    const hashtags = parseHashtags(row['해시태그']);

    try {
      await prisma.booth.upsert({
        where: { code },
        update: {
          name: row['단체명'] || '',
          organization: row['단체명'] || null,
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
        },
        create: {
          code,
          name: row['단체명'] || '',
          organization: row['단체명'] || null,
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
        },
      });
      count++;
    } catch (error) {
      console.error(`Error inserting booth ${code}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} booths`);
}

async function migratePosterData() {
  console.log('📝 Migrating poster data...');

  const workbook = XLSX.readFile(XLSX_PATH);
  const sheet = workbook.Sheets['포스터목록'];
  const rows: PosterRow[] = XLSX.utils.sheet_to_json(sheet);

  let count = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row['논문명']) continue;

    const code = `paper_${i + 1}`;
    const hashtags = row['학회명'] ? [row['학회명']] : [];

    try {
      await prisma.poster.upsert({
        where: { code },
        update: {
          title: row['논문명'] || '',
          abstract: null,
          researcher: row['저자'] || null,
          affiliation: row['소속'] || null,
          hashtags,
          presentationTime: row['발표 참여'] || null,
        },
        create: {
          code,
          title: row['논문명'] || '',
          abstract: null,
          researcher: row['저자'] || null,
          affiliation: row['소속'] || null,
          hashtags,
          presentationTime: row['발표 참여'] || null,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error inserting poster ${code}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} posters`);
}

async function main() {
  console.log('🚀 Starting data migration from xlsx...\n');

  try {
    await migrateSessionData();
    await migrateBoothData();
    await migratePosterData();

    console.log('\n✅ All data migrated successfully!');

    // 확인
    const sessionCount = await prisma.session.count();
    const boothCount = await prisma.booth.count();
    const posterCount = await prisma.poster.count();

    console.log(`\n📊 Summary:`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Booths: ${boothCount}`);
    console.log(`   Posters: ${posterCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
