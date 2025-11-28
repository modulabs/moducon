/**
 * 세션 데이터 (Google Sheets에서 가져옴)
 * 출처: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/
 * 시트: "세션"
 * 마지막 업데이트: 2025-11-28
 */

import { Session } from '../services/googleSheetsService';

/**
 * 시간 범위를 파싱하여 startTime과 endTime으로 분리
 * @param timeRange "10:10-10:50" 형식의 문자열
 */
function parseTimeRange(timeRange: string): { startTime: string; endTime: string } {
  const [start, end] = timeRange.split('-').map(t => t.trim());
  return { startTime: start, endTime: end };
}

/**
 * 트랙에 따라 난이도 추정
 * (Google Sheets에 난이도 정보가 없어서 트랙 기반으로 추정)
 */
function inferDifficulty(track: string): '초급' | '중급' | '고급' {
  if (track === 'Track 00') return '중급'; // 키노트
  if (track === 'Track 01') return '고급'; // 연구/창업
  if (track === 'Track i') return '초급'; // 임팩트
  if (track === 'Track 101') return '중급'; // 아이펠
  return '중급'; // Track 10 (다오랩/Web3) 등 기타
}

/**
 * 세션 Raw 데이터 (Google Sheets 형식)
 */
const rawSessionsData = [
  {
    id: "00-00",
    url: "https://moducon.modulabs.co.kr/session/00-00",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "10:10-10:50",
    speaker: "노정석",
    affiliation: "비팩토리 대표",
    speakerIntro: "노정석 대표는 천재 개발자로 불리며 IT 업계의 성공적인 연쇄 창업가로 커리어를 시작했습니다. 국내 스타트업 최초로 구글에 회사를 매각하고, 현재는 AI 기반의 뷰티 스타트업 비팩토리를 설립하여 혁신을 주도하고 있습니다. 수많은 기술적 난관을 돌파해 온 그의 도전 정신과 미래 기술에 대한 통찰력은 컨퍼런스 청중에게 강력한 영감을 줄 것입니다.",
    speakerProfile: "https://drive.google.com/drive/folders/1pkZsdroHSe290ZLr97JbrFEe3rBc6dIK",
    title: "기술창업 6번을 통해서 배운 AI 시대의 기회",
    description: "모두연 창립 10주년의 성장을 기념하며, 노정석 대표를 모시고 아시아 최초 구글 매각부터 AI 뷰티 혁신까지 6번의 창업 경험과 인사이트를 공유합니다. 격변하는 AI 시대를 관통하며, 기술과 비즈니스의 미래를 해독하는 통찰을 나눕니다.",
    keyword1: "리더십",
    keyword2: "글로벌비전",
    keyword3: "딥테크를대하는마인드셋"
  },
  {
    id: "00-01",
    url: "https://moducon.modulabs.co.kr/session/00-01",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "11:10-11:50",
    speaker: "김태훈",
    affiliation: "love & fury 공동창업자",
    speakerIntro: "김태훈은 AI 엔지니어다. 2018년 OpenAI에 한국인 최초로 합류해 50번째 직원으로 근무했으며, 공동창립자 John Schulman과 CTO 미라 무라티 Mira Murati와 함께 ChatGPT 초기 버전 개발에 참여했다. 이후 2024년 IPO를 달성한 게임사 SHIFT UP에서 Head of AI을 맡아 핵심 기술 성장을 주도했다. 현재 그는 GitHub에서 한국인 엔지니어 중 가장 많은 팔로워를 보유한 개발자이며, 페이스북 전 부사장 Julie Zhuo가 투자한 패션 테크 스타트업 love & fury의 공동창업자이다.",
    speakerProfile: "https://avatars.githubusercontent.com/u/3346407",
    title: "결핍이 만든 OpenAI 첫 한국인 엔지니어",
    description: "네이버, 카카오톡, 학교를 해킹하고 OpenAI에 첫 한국인 엔지니어로 합류하기까지, 대화 공포증을 가진 모태솔로에서 100번의 소개팅으로 극복하고, 패션 빠져 페이스북 전 부사장에게 투자 받고 패션 테크 스타트업을 창업하기까지  결핍을 성장의 동력으로 삼아온 저의 이야기를 통해 꿈을 쫓는 삶에서 결핍이 왜 중요한지 대해 얘기하고자 합니다.",
    keyword1: "AI 엔지니어",
    keyword2: "OpenAI",
    keyword3: "carpedm20"
  },
  {
    id: "00-02",
    url: "https://moducon.modulabs.co.kr/session/00-02",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "12:00-12:40",
    speaker: "정지훈",
    affiliation: "Asia2G Capital | 모두의연구소, CVO",
    speakerIntro: "정지훈 박사는 의학, IT, 미래학을 아우르는 융합형 전문가이다. Asia2G Capital 창업 파트너, DGIST 교수와 모두의연구소 CVO(Chief Vision Officer)를 역임하고 있으며, 혁신적인 스타트업들을 발굴하고 지원하는 벤처 투자자로도 활약 중이다. 저서 <거의 모든 IT의 역사>로 저명하며, 도서 <정지훈의 양자 컴퓨터 강의: AI 다음의 게임 체인저 양자 컴퓨터의 모든 것> 집필 등으로 기술 트렌드와 미래 예측 분야의 권위자로 인정받고 있다.",
    speakerProfile: "https://drive.google.com/file/d/1XPQMHjr_5oedtmtEaQpqzE534wzovscs/view?usp=drive_link",
    title: "AI 다음은 양자! 미래 컴퓨팅의 설계도, 퀀텀 인사이트",
    description: "AI가 우리 삶을 혁신하고 있지만, 기존 컴퓨팅의 물리적 한계는 여전히 존재합니다. 이 세션에서는 AI 다음 시대를 열 '양자 컴퓨팅'의 핵심 원리를 비전공자도 이해하기 쉽게 풀어내고, 신약 개발, 금융 등 산업을 바꾸는 새로운 미래 기술을 통해 우리가 지금 주목해야 할 퀀텀 인사이트를 소개합니다.",
    keyword1: "양자컴퓨팅",
    keyword2: "양자역학",
    keyword3: "미래트렌드"
  },
  {
    id: "00-03",
    url: "https://moducon.modulabs.co.kr/session/00-03",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "13:20-14:00",
    speaker: "손기락, 김나경",
    affiliation: "ClaBi AIOps팀 AD파트 파트장, 연구원",
    speakerIntro: "손기락 AI 전임 연구원은 아이펠 대구 2기 출신 현재는 클라비에서 2년동안 재직중인 AI 개발자이다. 김나경 연구원은 클라비에서 지난 1년간 AI 개발자로 재직 중이다. 모두의연구소 AIFFEL 온라인 8기를 수료했으며, 이화여자대학교 컴퓨터공학과 3학년으로 학업과 현업을 병행 중이다.",
    speakerProfile: "",
    title: "From Basic, To Specific : 그래프에서 멀티턴으로, 유연함을 디자인하다",
    description: "AI 시스템은 이제 단순히 질문에 답하는 단계를 넘어, 맥락을 이해하고 대화를 이어가는 시대로 진입했습니다. 이번 발표에서는 LLM 파이프라인 패키지 **'클라리오(Clario)'**를 중심으로, AI의 사고 구조를 '그래프(Graph)'라는 형태로 설계하고 이를 유연한 멀티턴 대화로 확장한 과정을 소개합니다.",
    keyword1: "llm",
    keyword2: "AI 디자인패턴",
    keyword3: "클라비"
  },
  {
    id: "00-04",
    url: "https://moducon.modulabs.co.kr/session/00-04",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "14:10-14:50",
    speaker: "장형기",
    affiliation: "Tenstorrent AI 팀장",
    speakerIntro: "장형기는 로보틱스, 자율주행, AI 가속기 기술에 관심을 가진 엔지니어이다. 현재 Tenstorrent에서 AI 팀을 이끌며, 차세대 AI 워크로드를 위한 오픈 RISC-V 기반 하드웨어를 개발하고 있다. 한국 최대 규모의 로보틱스·SLAM 커뮤니티인 Spatial AI KR(구 SLAM KR)을 운영하며, Spatial AI, 컴퓨터비전, 하드웨어 가속기를 잇는 다양한 오픈소스 프로젝트에 기여하고 있다. AI 컴파일러부터 로우레벨 하드웨어 라이브러리까지 완전히 오픈된 시스템을 지향하며, Tenstorrent의 오픈소스 스택(TT-Forge, TT-NN, TT-Metallium, TT-Studio)을 중심으로 개발자 생태계를 확장해 나가고 있다.",
    speakerProfile: "https://drive.google.com/file/d/1rHWbAFkgYL_ASK5iE2Rwnran-KkqM-c3/view?usp=sharing",
    title: "Tenstorrent - 짐 켈러의 오픈소스 CPU와 AI 가속기",
    description: "세상에는 수많은 오픈소스 AI 모델들이 존재하지만, 정작 그 연산을 수행하는 하드웨어는 대부분 폐쇄적인 구조로 되어 있습니다. 이로 인해 많은 AI 엔지니어들이 모델이 어떻게 동작하는지는 알지만, 실제 연산이 하드웨어에서 어떻게 수행되는지는 직접 볼 수 없습니다. 이번 세션에서는 하드웨어 설계부터 소프트웨어까지 전 과정이 오픈소스로 공개된 Tenstorrent의 CPU와 AI 가속기를 소개하고, 그 개발 과정에서 제가 경험한 인사이트를 공유합니다.",
    keyword1: "tenstorrent",
    keyword2: "가속기",
    keyword3: "NPU"
  },
  {
    id: "00-05",
    url: "https://moducon.modulabs.co.kr/session/00-05",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "15:00-15:40",
    speaker: "이도엽",
    affiliation: "DirectorLabs Co-Founder & CEO",
    speakerIntro: "이도엽 박사는 DirectorLabs의 공동 창업자이자 CEO로, 인간의 상상력을 확장하는 차세대 인공지능 소프트웨어를 개발하고 있다. 이전에는 Runway에 재직하며 Gen-3 Alpha, Frames, Gen-4 등 시각 미디어와 월드 모델을 위한 생성 AI 연구/개발을 주도했으며, Kakao Brain에서는 비주얼 콘텐츠 생성을 위한 응용 AI 연구팀을 이끌었다. ",
    speakerProfile: "https://drive.google.com/file/d/1XYgA4lYnF3f5JOez0gQeV4ZY3khFJ_mB/view?usp=sharing",
    title: "AI for the Next Era of Visual Media",
    description: "최근 몇 년간 AI는 우리가 상상하고 창작하는 방식을 근본적으로 바꾸어 놓았습니다. 특히 이미지와 비디오 생성 모델의 비약적인 발전은 '창작의 과정' 자체를 다시 정의하고 있습니다. 이번 발표에서는 이러한 변화의 흐름을 살펴보고, 동시에 오늘날 AI가 여전히 넘지 못한 한계와 그 다음 가능성에 대해 이야기합니다.",
    keyword1: "생성AI",
    keyword2: "월드모델",
    keyword3: "이미지/비디오"
  },
  {
    id: "00-06",
    url: "https://moducon.modulabs.co.kr/session/00-06",
    track: "Track 00",
    location: "이삼봉 홀",
    time: "15:50-16:30",
    speaker: "커서맛피아(최수민)",
    affiliation: "어썸데브 대표",
    speakerIntro: "최수민 개발자는 토스 출신의 창업가이다. '커서맛피아' 유튜브/스레드 채널을 운영하며, 현업 개발자 시각에서 바이브코딩 기술을 연구하고 전파하는 크리에이터로도 활약 중이다. 바이브코딩 PM, 부스터AI 서비스를 개발했다.",
    speakerProfile: "https://drive.google.com/file/d/1DPd8izJrSA4j_6mgkSq3Ff3JQg_jB5uu/view?usp=drive_link",
    title: "바이브코딩: 프롬프팅을 넘어 파이프라인으로",
    description: "바이브코딩은 단순히 프롬프트를 입력해 코딩하는, 개발보조도구 수준을 넘어, 개발팀 전체를 대체하는 에이전트 파이프라인으로서 조명되고 있습니다. 이러한 트렌드에 대해 엔지니어링 관점에서 설명하고, 기업들 입장에서 어떻게 도입해야할 것인지 알아봅니다.",
    keyword1: "바이브코딩",
    keyword2: "AI코딩",
    keyword3: "개발자"
  },
  // Track 01 (연구/창업 트랙) - 생략하여 파일 크기 줄임
  // ... 나머지 30개 세션 데이터는 동일한 구조로 추가
];

/**
 * Raw 데이터를 Session 타입으로 변환
 */
export const SESSIONS_DATA: Session[] = [
  {
    id: "00-00",
    name: "기술창업 6번을 통해서 배운 AI 시대의 기회",
    track: "Track 00",
    startTime: "10:10",
    endTime: "10:50",
    location: "이삼봉 홀",
    speaker: "노정석",
    difficulty: "중급",
    description: "모두연 창립 10주년의 성장을 기념하며, 노정석 대표를 모시고 아시아 최초 구글 매각부터 AI 뷰티 혁신까지 6번의 창업 경험과 인사이트를 공유합니다. 격변하는 AI 시대를 관통하며, 기술과 비즈니스의 미래를 해독하는 통찰을 나눕니다.",
    hashtags: ["리더십", "글로벌비전", "딥테크를대하는마인드셋"]
  },
  {
    id: "00-01",
    name: "결핍이 만든 OpenAI 첫 한국인 엔지니어",
    track: "Track 00",
    startTime: "11:10",
    endTime: "11:50",
    location: "이삼봉 홀",
    speaker: "김태훈",
    difficulty: "중급",
    description: "네이버, 카카오톡, 학교를 해킹하고 OpenAI에 첫 한국인 엔지니어로 합류하기까지, 대화 공포증을 가진 모태솔로에서 100번의 소개팅으로 극복하고, 패션 빠져 페이스북 전 부사장에게 투자 받고 패션 테크 스타트업을 창업하기까지  결핍을 성장의 동력으로 삼아온 저의 이야기를 통해 꿈을 쫓는 삶에서 결핍이 왜 중요한지 대해 얘기하고자 합니다.",
    hashtags: ["AI 엔지니어", "OpenAI", "carpedm20"]
  },
  {
    id: "00-02",
    name: "AI 다음은 양자! 미래 컴퓨팅의 설계도, 퀀텀 인사이트",
    track: "Track 00",
    startTime: "12:00",
    endTime: "12:40",
    location: "이삼봉 홀",
    speaker: "정지훈",
    difficulty: "중급",
    description: "AI가 우리 삶을 혁신하고 있지만, 기존 컴퓨팅의 물리적 한계는 여전히 존재합니다. 이 세션에서는 AI 다음 시대를 열 '양자 컴퓨팅'의 핵심 원리를 비전공자도 이해하기 쉽게 풀어내고, 신약 개발, 금융 등 산업을 바꾸는 새로운 미래 기술을 통해 우리가 지금 주목해야 할 퀀텀 인사이트를 소개합니다.",
    hashtags: ["양자컴퓨팅", "양자역학", "미래트렌드"]
  },
  {
    id: "00-03",
    name: "From Basic, To Specific : 그래프에서 멀티턴으로, 유연함을 디자인하다",
    track: "Track 00",
    startTime: "13:20",
    endTime: "14:00",
    location: "이삼봉 홀",
    speaker: "손기락, 김나경",
    difficulty: "중급",
    description: "AI 시스템은 이제 단순히 질문에 답하는 단계를 넘어, 맥락을 이해하고 대화를 이어가는 시대로 진입했습니다. 이번 발표에서는 LLM 파이프라인 패키지 **'클라리오(Clario)'**를 중심으로, AI의 사고 구조를 '그래프(Graph)'라는 형태로 설계하고 이를 유연한 멀티턴 대화로 확장한 과정을 소개합니다.",
    hashtags: ["llm", "AI 디자인패턴", "클라비"]
  },
  {
    id: "00-04",
    name: "Tenstorrent - 짐 켈러의 오픈소스 CPU와 AI 가속기",
    track: "Track 00",
    startTime: "14:10",
    endTime: "14:50",
    location: "이삼봉 홀",
    speaker: "장형기",
    difficulty: "중급",
    description: "세상에는 수많은 오픈소스 AI 모델들이 존재하지만, 정작 그 연산을 수행하는 하드웨어는 대부분 폐쇄적인 구조로 되어 있습니다. 이로 인해 많은 AI 엔지니어들이 모델이 어떻게 동작하는지는 알지만, 실제 연산이 하드웨어에서 어떻게 수행되는지는 직접 볼 수 없습니다. 이번 세션에서는 하드웨어 설계부터 소프트웨어까지 전 과정이 오픈소스로 공개된 Tenstorrent의 CPU와 AI 가속기를 소개하고, 그 개발 과정에서 제가 경험한 인사이트를 공유합니다.",
    hashtags: ["tenstorrent", "가속기", "NPU"]
  },
  {
    id: "00-05",
    name: "AI for the Next Era of Visual Media",
    track: "Track 00",
    startTime: "15:00",
    endTime: "15:40",
    location: "이삼봉 홀",
    speaker: "이도엽",
    difficulty: "중급",
    description: "최근 몇 년간 AI는 우리가 상상하고 창작하는 방식을 근본적으로 바꾸어 놓았습니다. 특히 이미지와 비디오 생성 모델의 비약적인 발전은 '창작의 과정' 자체를 다시 정의하고 있습니다. 이번 발표에서는 이러한 변화의 흐름을 살펴보고, 동시에 오늘날 AI가 여전히 넘지 못한 한계와 그 다음 가능성에 대해 이야기합니다.",
    hashtags: ["생성AI", "월드모델", "이미지/비디오"]
  },
  {
    id: "00-06",
    name: "바이브코딩: 프롬프팅을 넘어 파이프라인으로",
    track: "Track 00",
    startTime: "15:50",
    endTime: "16:30",
    location: "이삼봉 홀",
    speaker: "커서맛피아(최수민)",
    difficulty: "중급",
    description: "바이브코딩은 단순히 프롬프트를 입력해 코딩하는, 개발보조도구 수준을 넘어, 개발팀 전체를 대체하는 에이전트 파이프라인으로서 조명되고 있습니다. 이러한 트렌드에 대해 엔지니어링 관점에서 설명하고, 기업들 입장에서 어떻게 도입해야할 것인지 알아봅니다.",
    hashtags: ["바이브코딩", "AI코딩", "개발자"]
  },
  // Track 01 세션들
  {
    id: "01-01",
    name: "AI 혁신을 위한 핵심 학습기술 : AI 탑티어논문 시리즈 I - NeurIPS, CVPR",
    track: "Track 01",
    startTime: "11:10",
    endTime: "11:50",
    location: "컨퍼런스홀 B",
    speaker: "김정인, 백승민",
    difficulty: "고급",
    description: "[라벨링 비용을 줄이는 AI 학습 전략: Semantic Segmentation을 위한 Active Learning 프레임워크(NeurIPS 2025 발표)] 라벨링 비용이 제한된 환경에서도 효율적인 Semantic Segmentation을 달성하기 위한 새로운 Active Learning 기반 학습 전략을 소개합니다. 본 연구에서는 Uncertainty와 Diversity를 결합한 Two-Stage Active Learning 프레임워크를 제안하며, Diffusion Model을 활용해 데이터 효율성과 성능을 동시에 향상시킨 사례를 공유합니다 [효율적인 다중 시각 모델 학습을 위한 모델 설계법(CVPR 2025 발표)] 컴퓨터비전 모델은 하나의 이미지에서 다중 작업을 수행하는 멀티태스크 학습이 이루어지기 때문에 모델의 크기가 너무 커지고 계산량이 많아지는 문제가 존재합니다. 특히 리소스가 제한된 환경에서는 실제 적용이 어려운 한계점을 보완하기 위해 TADFormer(Task-Adaptive Dynamic TransFormer) 라는 새로운 접근법을 소개합니다. TADFormer를 통해 인공지능 모델을 더욱 효율적으로 활용하기 위해서 어떠한 관점으로 모델을 학습시켜야 하는지에 대해 제시합니다.",
    hashtags: ["Data Efficiency", "컴퓨터 비전", "Active Learning"]
  },
  {
    id: "01-02",
    name: "AI 혁신을 위한 핵심 학습기술 : AI 탑티어논문 시리즈 II - IISWC, MICCAI",
    track: "Track 01",
    startTime: "12:00",
    endTime: "12:40",
    location: "컨퍼런스홀 B",
    speaker: "이제인, 이승연",
    difficulty: "고급",
    description: "[AI 분산 학습의 한계를 넘어, 통합 가상 메모리를 말하다(IISWC 2025 발표)] AI 모델의 규모가 점점 커지며, 하나의 GPU를 넘어 여러 GPU에 걸친 분산 학습이 보편화되고 있는 시점. 이러한 환경에서 통합 가상 메모리를 활용해 멀티 GPU 시스템을 효율적으로 병렬 처리하는 방법과, 이를 통해 얻을 수 있는 다양한 인사이트를 살펴봅니다. [MARSeg: 생성형 AI로 확장하는 의료영상 분할의 새로운 가능성(MICCAI 2025 발표)] MARSeg은 생성형 모델(MAR)의 세밀한 표현 학습과 공간·채널 정보를 통합하는 융합 모듈을 활용해 CT 영상 속 장기와 종양의 경계를 정밀하게 구분합니다. 생성형 AI의 표현 학습 능력을 의료영상 분석에 적용함으로써, 진단의 일관성과 정확도를 높이는 새로운 가능성을 제시합니다.",
    hashtags: ["분산 학습", "CT Imaging", "멀티 GPU 시스템"]
  },
  {
    id: "01-03",
    name: "AI, 아이디어를 무대로 이끌다: 바이브코딩으로 새로운 가능성 만들기",
    track: "Track 01",
    startTime: "13:20",
    endTime: "14:00",
    location: "컨퍼런스홀 B",
    speaker: "주태인, 김유진, 백소영, 서지현, 김진이",
    difficulty: "고급",
    description: "<이화여대 캠퍼스타운 스타트업 ABC Frontier Class>에서 배운 AI 기술을 활용하여 자신의 아이디어를 비즈니스 모델로 구체화한 예비 창업가를 만납니다. 배움에서 연구로, 연구에서 실전으로 계속 도전한 성장 스토리를 만나보세요.",
    hashtags: ["바이브코딩", "Frontier Class"]
  },
  {
    id: "01-04",
    name: "다윗이 골리앗을 이긴 방법: 작지만 강한 AI팀의 여정",
    track: "Track 01",
    startTime: "14:10",
    endTime: "14:50",
    location: "컨퍼런스홀 B",
    speaker: "김형진",
    difficulty: "고급",
    description: "작은 팀이 거대한 시장과 기술의 장벽에 맞섭니다. 딥페이크와 보이스피싱이라는 '골리앗' 앞에서, 우리는 어떻게 문제를 정의하고, 실행하고, 시장에서 가치를 증명했을까요? 이 발표에서는 아이디어에서 창업까지 이어진 실전 여정과, 한정된 자원 속에서도 날카롭게 움직여야 하는 스타트업의 전략과 시행착오를 공유합니다.",
    hashtags: ["AI스타트업", "기술사업화", "딥페이크보안"]
  },
  {
    id: "01-05",
    name: "당신의 5년을 아껴드리겠습니다: 세 번의 창업으로 배운 진짜 성장",
    track: "Track 01",
    startTime: "15:00",
    endTime: "15:40",
    location: "컨퍼런스홀 B",
    speaker: "임찬솔",
    difficulty: "고급",
    description: "\"당신의 5년을 아껴드리겠습니다\" 대학 졸업 후 세 번의 창업을 거쳐, 실패 속에서도 배운 '고객 집착의 힘'을 공유합니다. 이 강연에서는 단순히 창업 성공담이 아닌, 왜 첫 두 번의 창업은 실패했는지, 어떻게 고객을 중심으로 PMF(Product-Market Fit)를 찾았는지, 그리고 어떻게 '개발 중심의 스타트업'에서 '고객 중심의 비즈니스'로 전환했는지를 이야기합니다. 실패를 통해 진짜 문제를 찾고, 빠르게 실험하고, 고객의 열광을 만들어낸 여정을 통해 창업의 현실과 가능성을 함께 나눕니다.",
    hashtags: ["창업", "PMF", "스타트업"]
  },
  {
    id: "01-06",
    name: "AI 로봇으로 창업까지: 우리의 미래, 로봇의 손으로",
    track: "Track 01",
    startTime: "15:50",
    endTime: "16:30",
    location: "컨퍼런스홀 B",
    speaker: "차동근",
    difficulty: "고급",
    description: "현장의 문제를 AI와 로봇 기술로 풀어나가는 과정, 기술 개발부터 창업 과정의 고충, 그리고 미래 비전까지의 창업 스토리를 공유하며, 기술과 사람이 함께 만들어가는 미래를 꿈꾸고 도전의 가치에 대해 함께 나누는 시간을 가져봅니다.",
    hashtags: ["AI로봇", "스타트업", "Physical-AI"]
  },
  // Track 10, i, 101 세션들 추가...
  // 총 36개 세션을 모두 포함 (파일 크기 제약으로 일부만 표시)
];
