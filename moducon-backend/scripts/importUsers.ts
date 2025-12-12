import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CsvRow {
  name: string;
  email: string;
  phone: string;
  group: string;
  organization: string;
  title: string;
}

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV 파싱 (쉼표가 포함된 값 처리)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    rows.push({
      name: values[0] || '',
      email: values[1] || '',
      phone: values[2] || '',
      group: values[3] || '',
      organization: values[4] || '',
      title: values[5] || ''
    });
  }

  return rows;
}

function extractPhoneLast4(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return null;
}

async function main() {
  const csvPath = path.join(__dirname, '../../사전등록자.csv');

  console.log('CSV 파일 읽는 중...');
  const rows = parseCsv(csvPath);
  console.log(`총 ${rows.length}개 행 발견\n`);

  const validUsers: Array<{
    name: string;
    phoneLast4: string;
    email: string | null;
    organization: string | null;
  }> = [];

  const invalidUsers: Array<{ name: string; phone: string; reason: string }> = [];

  for (const row of rows) {
    const name = row.name.trim();
    const phoneLast4 = extractPhoneLast4(row.phone);

    if (!name) {
      invalidUsers.push({ name: '(빈 이름)', phone: row.phone, reason: '이름 없음' });
      continue;
    }

    if (!phoneLast4) {
      invalidUsers.push({ name, phone: row.phone, reason: '전화번호 오류' });
      continue;
    }

    validUsers.push({
      name,
      phoneLast4,
      email: row.email.trim() || null,
      organization: row.organization.trim() || null
    });
  }

  console.log(`유효한 사용자: ${validUsers.length}명`);
  console.log(`제외된 사용자: ${invalidUsers.length}명\n`);

  if (invalidUsers.length > 0) {
    console.log('=== 제외된 사용자 ===');
    invalidUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} | 전화: '${u.phone}' | 사유: ${u.reason}`);
    });
    console.log('');
  }

  // DB에 삽입
  console.log('DB에 사용자 등록 중...');

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of validUsers) {
    try {
      await prisma.user.upsert({
        where: {
          unique_user: {
            name: user.name,
            phoneLast4: user.phoneLast4
          }
        },
        update: {
          email: user.email,
          organization: user.organization
        },
        create: {
          name: user.name,
          phoneLast4: user.phoneLast4,
          email: user.email,
          organization: user.organization,
          registrationType: 'pre_registered'
        }
      });
      inserted++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        skipped++;
      } else {
        errors.push(`${user.name}: ${error.message}`);
      }
    }
  }

  console.log('\n=== 결과 ===');
  console.log(`등록/업데이트: ${inserted}명`);
  console.log(`중복 스킵: ${skipped}명`);

  if (errors.length > 0) {
    console.log(`\n오류 발생: ${errors.length}건`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // 최종 사용자 수 확인
  const totalUsers = await prisma.user.count();
  console.log(`\nDB 총 사용자 수: ${totalUsers}명`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
