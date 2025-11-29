"use strict";
/**
 * 세션 데이터 (Google Sheets에서 가져옴)
 * 출처: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/
 * 시트: "세션"
 * 마지막 업데이트: 2025-11-29
 * 총 36개 세션
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSIONS_DATA = void 0;
exports.validateSessionsData = validateSessionsData;
/**
 * 시간 범위를 파싱하여 startTime과 endTime으로 분리
 */
function parseTimeRange(timeRange) {
    const [start, end] = timeRange.split('-').map(t => t.trim());
    return { startTime: start, endTime: end };
}
/**
 * 트랙에 따라 난이도 추정
 */
function inferDifficulty(track) {
    if (track === 'Track 00')
        return '중급'; // 키노트
    if (track === 'Track 01')
        return '고급'; // 연구/창업
    if (track === 'Track i')
        return '초급'; // 임팩트
    if (track === 'Track 101')
        return '중급'; // 아이펠
    return '중급'; // Track 10 등 기타
}
/**
 * 세션 데이터 (36개 전체)
 */
exports.SESSIONS_DATA = [
    // Track 00 - 키노트 (8개)
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
    // Track 01 - 연구/창업 (6개)
    {
        id: "01-01",
        name: "AI 혁신을 위한 핵심 학습기술 : AI 탑티어논문 시리즈 I - NeurIPS, CVPR",
        track: "Track 01",
        startTime: "11:10",
        endTime: "11:50",
        location: "컨퍼런스홀 B",
        speaker: "김정인, 백승민",
        difficulty: "고급",
        description: "[라벨링 비용을 줄이는 AI 학습 전략: Semantic Segmentation을 위한 Active Learning 프레임워크(NeurIPS 2025 발표)] 라벨링 비용이 제한된 환경에서도 효율적인 Semantic Segmentation을 달성하기 위한 새로운 Active Learning 기반 학습 전략을 소개합니다.",
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
        description: "[AI 분산 학습의 한계를 넘어, 통합 가상 메모리를 말하다(IISWC 2025 발표)] AI 모델의 규모가 점점 커지며, 하나의 GPU를 넘어 여러 GPU에 걸친 분산 학습이 보편화되고 있는 시점. 이러한 환경에서 통합 가상 메모리를 활용해 멀티 GPU 시스템을 효율적으로 병렬 처리하는 방법과, 이를 통해 얻을 수 있는 다양한 인사이트를 살펴봅니다.",
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
        description: "대학 졸업 후 세 번의 창업을 거쳐, 실패 속에서도 배운 '고객 집착의 힘'을 공유합니다. 이 강연에서는 단순히 창업 성공담이 아닌, 왜 첫 두 번의 창업은 실패했는지, 어떻게 고객을 중심으로 PMF(Product-Market Fit)를 찾았는지, 그리고 어떻게 '개발 중심의 스타트업'에서 '고객 중심의 비즈니스'로 전환했는지를 이야기합니다.",
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
    // Track 10 - 다오랩/Web3/AI 연구 (9개)
    {
        id: "10-01",
        name: "당신의 일과 조직은 안녕하십니까?",
        track: "Track 10",
        startTime: "11:10",
        endTime: "11:50",
        location: "컨퍼런스홀 A",
        speaker: "한재선, 이항심, 신상엽",
        difficulty: "중급",
        description: "다오랩은 미래 조직과 일을 연구하는 랩으로써 2024년부터 시작해 2년 가까이 운영되고 있습니다. 그 과정에서 다오랩 자체를 자율 커뮤니티로 만들었고, 현재는 커뮤니티를 넘어서 자율 조직으로 진화시키는 단계로 접어들었습니다. AI와 새로운 기술들로 인해 우리의 일은 급격한 변화를 맞이하고, 그에 따라 일을 하는 조직 역시 변할 것입니다.",
        hashtags: ["미래 조직", "DAO", "일의 미래"]
    },
    {
        id: "10-02",
        name: "AI Network: Agent-to-Agent Ontology, AP2, x402",
        track: "Track 10",
        startTime: "12:00",
        endTime: "12:40",
        location: "컨퍼런스홀 A",
        speaker: "김민현",
        difficulty: "중급",
        description: "AI Network는 자유롭게 살아가는 에이전트(agent)들의 네트워크를 꿈꾸며, 인간의 창의성을 보존하고 (기술과) 조화롭게 살아가며 인간이 새롭게 의미를 발견하는 것을 중요하게 여깁니다. 이는 Agent-to-Agent 프로토콜로 웹상에서 어떻게 에이전트 간의 온톨로지(Ontology)가 연결되는지, Agent Payment Protocol로 웹(Web)의 비즈니스 모델이 어떻게 바뀌는지, 그리고 x402 프로토콜로 Web3와 Web2가 어떻게 합쳐지는지를 다룹니다.",
        hashtags: ["A2A", "Ontology", "x402"]
    },
    {
        id: "10-03",
        name: "없는데 어떻게 해요? 합성 데이터로 만드는 (도메인 특화) 언어모델",
        track: "Track 10",
        startTime: "13:20",
        endTime: "14:00",
        location: "컨퍼런스홀 A",
        speaker: "손규진",
        difficulty: "중급",
        description: "언어모델은 필요한데 데이터가 없다면, 우리는 어떻게 해야 할까요? 언어모델이 사회 전반에 빠르게 확산되면서, 실제 데이터가 부족하거나 민감하여 활용하기 어려운 상황이 점점 더 많아지고 있습니다. 해례 랩은 이러한 한계를 넘어, 수학·과학·언어·암호학·퍼즐·한국 문화 등 다양한 분야에서 원천 데이터 수집과 합성데이터(Synthetic Data) 생성을 결합해 언어모델을 학습하고 평가해왔습니다.",
        hashtags: ["합성 데이터", "언어 모델", "도메인 특화"]
    },
    {
        id: "10-04",
        name: "연구실을 떠난 AI, AI for Impact",
        track: "Track 10",
        startTime: "14:10",
        endTime: "14:30",
        location: "컨퍼런스홀 A",
        speaker: "이효은",
        difficulty: "중급",
        description: "AI라는 업계의 진짜 숙제는 '어떻게 잘 쓰느냐'로 옮겨 왔다. 이론적 개념, 커팅 엣지 기술을 넘어, 우리 삶으로 넘어온 AI를 '진짜 잘 쓰기'위한 다양한 노력을 종합적으로 살펴봅니다.",
        hashtags: ["AI for Impact", "AI for Social Impact"]
    },
    {
        id: "10-05",
        name: "2025년, 양자컴퓨팅의 현주소와 미래: 원리, 트렌드, 산업적 응용",
        track: "Track 10",
        startTime: "14:30",
        endTime: "14:50",
        location: "컨퍼런스홀 A",
        speaker: "이진호",
        difficulty: "중급",
        description: "2025년 현재, 양자컴퓨팅은 순수 이론의 단계를 넘어 다양한 산업 현장에서의 적용 가능성을 모색하는 중요한 시점에 와 있습니다. 본 세션에서는 양자컴퓨터의 핵심 기본 원리부터, 초전도체, 이온트랩 등 최신 하드웨어 기술 동향까지 논문 기반 사례 중심으로 현주소를 짚어봅니다.",
        hashtags: ["양자컴퓨터", "양자컴퓨팅"]
    },
    {
        id: "10-06",
        name: "UOT-RFM for Long-Tailed Data Generation",
        track: "Track 10",
        startTime: "15:00",
        endTime: "15:20",
        location: "컨퍼런스홀 A",
        speaker: "김민중",
        difficulty: "중급",
        description: "Flow Matching(FM)은 기준 분포에서 데이터 분포로 이어지는 연속적 흐름(ODE 벡터장)을 학습하여 데이터를 생성하는 강력한 프레임워크이다. 하지만 Long-tailed 분포에서는 여전히 training signal이 majority class에 집중되어 majority bias가 발생하는 한계가 있다.",
        hashtags: ["Generative models", "Flow Matching", "Long-Tailed distribution"]
    },
    {
        id: "10-07",
        name: "from Data import Taste: 쩝쩝LAB의 실용 AI 여정",
        track: "Track 10",
        startTime: "15:20",
        endTime: "15:40",
        location: "컨퍼런스홀 A",
        speaker: "김성록",
        difficulty: "중급",
        description: "우리는 단순히 평가 지표가 높은 모델을 만드는 것을 넘어, 실제 서비스 환경에서 진짜 잘 작동하는 모델을 탐구했습니다. 즉, 기술적 성능의 향상을 넘어서 현실 속에서 ML/DL을 어떻게 써야 '잘 쓰이는가'에 집중했습니다.",
        hashtags: ["추천시스템", "취향 탐구", "맛집"]
    },
    {
        id: "10-08",
        name: "Biosignal Markers for Human-Centered Clinical AI",
        track: "Track 10",
        startTime: "15:50",
        endTime: "16:10",
        location: "컨퍼런스홀 A",
        speaker: "김준우",
        difficulty: "중급",
        description: "최근 오디오 및 생체 신호 분석 기술의 발전으로 인해 인간의 신체와 정신 상태 간의 상호작용을 정량적으로 이해할 수 있는 새로운 가능성이 열리고 있음. 본 발표에서는 생체 신호, 음성, 환자 인터뷰 등 다양한 생체 데이터를 활용하여 인간의 신체적, 정신적 상태를 정량적으로 이해하고 예측하는 인공지능 연구 수행 결과들이 정신건강 평가 및 임상 지원을 위한 바이오마커로 어떻게 활용될 수 있는지를 중심으로, RSC 랩에서 진행한 주요 연구 성과를 종합적으로 소개하고자 함.",
        hashtags: ["Biosignal Analysis", "Respiratory Sound Modeling", "Voice Biomarkers"]
    },
    {
        id: "10-09",
        name: "AI 에이전트, 현실과 만나다: 홈 로보틱스",
        track: "Track 10",
        startTime: "16:10",
        endTime: "16:30",
        location: "컨퍼런스홀 A",
        speaker: "현청천",
        difficulty: "중급",
        description: "본 연구는 AI 에이전트와 로봇을 결합하여 가정 환경에서 다양한 임무를 수행하는 것을 목표로 한다. AI 에이전트는 언어와 상황을 이해해 로봇에게 지시를 내리고, 로봇은 이를 실제 환경에서 실행하며 사람과 협력한다.",
        hashtags: ["AI에이전트", "지능형로봇", "스마트홈"]
    },
    // Track i - 임팩트 (6개)
    {
        id: "i-01",
        name: "AI_TOP_100: AI와 성장하는 사람들",
        track: "Track i",
        startTime: "11:10",
        endTime: "11:50",
        location: "B146",
        speaker: "이효은",
        difficulty: "초급",
        description: "AI까지가 능력인 시대' 입니다. AI를 쓰지 않고 일하는 지식 노동자가 드문 이 시대에 , AI를 잘 쓴다는 건 무엇이며 어떤 모습일까요? AI의 임팩트에 앞서 먼저 고민해야 할 질문을 AI_TOP_100에서 던져보았습니다. 질문을 던지는 과정과 답을 찾는 여정을 나눕니다.",
        hashtags: ["AI_TOP_100", "브라이언임팩트", "카카오임팩트"]
    },
    {
        id: "i-02",
        name: "AI로 열어가는 비영리 활동가의 미래",
        track: "Track i",
        startTime: "12:00",
        endTime: "12:40",
        location: "B146",
        speaker: "동그라미재단",
        difficulty: "초급",
        description: "AI 기술이 비영리 섹터의 연구와 현장 활동을 어떻게 혁신하고 있는지 확인하는 시간입니다. 제한된 자원 속에서 더 큰 임팩트를 만들어야 하는 비영리 활동가들이 AI를 활용해 정책 분석, 캠페인 기획, 업무 자동화 등 실무 전 과정의 효율을 극적으로 높인 사례를 공유합니다.",
        hashtags: ["동그라미재단", "비영리활동가", "업무생산성"]
    },
    {
        id: "i-03",
        name: "[테크포임팩트LAB] 일상의 장벽을 허무는 돕는 기술",
        track: "Track i",
        startTime: "13:20",
        endTime: "14:00",
        location: "B146",
        speaker: "조현욱, 정효정, 황윤경",
        difficulty: "초급",
        description: "AI 기술로 접근성을 확장하는 세 팀을 소개합니다. 이동약자를 위한 실내 접근성 분석 AI '동접 LAB', 인공와우 사용자를 위한 재활 훈련 도구 '온소리 LAB', 그리고 누구나 이해할 수 있는 쉬운말 번안 AI 'B-Peach LAB'. 일상의 장벽을 기술로 낮추며 포용적 세상을 만들어가는 이들의 도전과 성장을 만나보세요.",
        hashtags: ["동접 LAB", "B-Peach LAB", "온소리 LAB"]
    },
    {
        id: "i-04",
        name: "[테크포임팩트LAB] 사람을 잇는 돕는 기술",
        track: "Track i",
        startTime: "14:10",
        endTime: "14:50",
        location: "B146",
        speaker: "김성준, 서보람, 윤수영",
        difficulty: "초급",
        description: "커뮤니티 기술로 사람과 사람, 지역과 사회를 연결하는 세 팀을 소개합니다. 학교 밖 청소년을 위한 커뮤니티 '유어덴티티 LAB', 자립준비청년의 성장과 일자리를 지원하는 '다정 LAB', 그리고 AR 게임으로 지역 관계를 확장하는 '이을 LAB'. 기술을 통해 서로의 거리를 좁히고, 함께 성장하는 연결의 이야기를 만나보세요.",
        hashtags: ["이을 LAB", "유어덴티티 LAB", "다정 LAB"]
    },
    {
        id: "i-05",
        name: "[테크포임팩트LAB] 퇴근 후 만드는 돕는 기술",
        track: "Track i",
        startTime: "15:00",
        endTime: "15:40",
        location: "B146",
        speaker: "최미연,김민석",
        difficulty: "초급",
        description: "일상의 기술로 세상을 조금 더 안전하게 바꾸는 사람들. '가방싸 LAB'은 재난 상황을 직접 체험하며 배울 수 있는 교육 게임을 개발해 누구나 쉽고 재미있게 재난 대비를 익힐 수 있는 환경을 만듭니다. 이어서, 테크포임팩트 LAB 2기의 6개월간의 이야기와 함께 7개 LAB 공통 QnA가 진행됩니다!",
        hashtags: ["가방싸 LAB", "테크포임팩트", "테크포임팩트 LAB 2기"]
    },
    {
        id: "i-06",
        name: "테크포임팩트 ONLY",
        track: "Track i",
        startTime: "15:50",
        endTime: "16:30",
        location: "B146",
        speaker: "테크포임팩트",
        difficulty: "초급",
        description: "테크포임팩트 LAB 전용 세션입니다.",
        hashtags: []
    },
    // Track 101 - 아이펠 (4개)
    {
        id: "101-1",
        name: "6개월 후, 우리는 리서처가 되었다",
        track: "Track 101",
        startTime: "11:00",
        endTime: "12:00",
        location: "B144",
        speaker: "박광석, 담안용, 양지웅, 정상헌",
        difficulty: "중급",
        description: "아이펠 리서치 과정의 퍼실과 그루들이 성장하는 방식과 연구했던 내용, 산학계에서 인정받은 성과를 소개합니다",
        hashtags: ["아이펠", "AI취업", "AI부트캠프"]
    },
    {
        id: "101-2",
        name: "Google Antigravity로 만드는 인공지능 어플리케이션 구축하기",
        track: "Track 101",
        startTime: "12:30",
        endTime: "13:30",
        location: "B144",
        speaker: "이영빈",
        difficulty: "중급",
        description: "구글의 Gemini CLI를 사용해 간단한 어플리케이션을 만드는 핸즈온 세션입니다.",
        hashtags: ["Gemini", "바이브코딩", "아이펠"]
    },
    {
        id: "101-3",
        name: "AI 코딩 도구 Cursor로 만드는 나만의 서비스 – Vibe Coding 핸즈온",
        track: "Track 101",
        startTime: "14:00",
        endTime: "15:00",
        location: "B144",
        speaker: "김정현",
        difficulty: "중급",
        description: "AI 코딩 도구 Cursor와 Vibe Coding 방식을 활용하여 실제 서비스로 배포 가능한 챗봇 웹앱을 만들어보는 실습 세션입니다. 기획부터 개발, 데이터베이스, 배포까지 전 과정을 함께 따라가며 AI 기반 개발의 새로운 패러다임을 직접 체험할 수 있습니다.",
        hashtags: ["바이브코딩", "Cursor", "Chatbot"]
    },
    {
        id: "101-4",
        name: "지금, 발빠른 기업은 어떻게 AI 인재를 키우고 있을까?",
        track: "Track 101",
        startTime: "15:30",
        endTime: "16:30",
        location: "B144",
        speaker: "김도희, 오승환, 김영욱",
        difficulty: "중급",
        description: "AI 시대, 진짜 경쟁력은 기술이 아니라, AI를 도구로 문제를 해결할 수 있는 사람입니다. SKT, 한화시스템, 네이버 등 현장의 기업교육 사례를 통해 기업이 어떻게 AI인재를 성장시키는지 인사이트를 나눕니다.",
        hashtags: ["AX", "기업교육", "AI교육"]
    },
];
// 검증 함수 (개발 환경에서 확인용)
function validateSessionsData() {
    console.log(`Total sessions: ${exports.SESSIONS_DATA.length}`);
    const trackCounts = {};
    exports.SESSIONS_DATA.forEach(session => {
        trackCounts[session.track] = (trackCounts[session.track] || 0) + 1;
    });
    console.log('Track distribution:', trackCounts);
}
