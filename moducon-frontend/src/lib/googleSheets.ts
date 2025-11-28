/**
 * Google Sheets Data Fetcher
 * Google Sheets에서 부스 및 포스터 데이터를 가져오는 유틸리티
 */

export const SPREADSHEET_ID = '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g';

export interface Booth {
  id: string;
  name: string;
  type: string;
  description: string;
  contactPerson: string;
  boothDescription: string;
  imageUrl: string;
  hashtags: string[];
  solutions: string;
  technologies: string;
  researchGoals: string;
  mainProducts: string;
  demoContent: string;
}

export interface Paper {
  id: string;
  author: string;
  affiliation: string;
  conference: string;
  title: string;
  fileUrl: string;
  paperUrl: string;
  category: string;
  email: string;
  phone: string;
  presentationTime: string;
  willPresent: string;
}

/**
 * Google Sheets 부스 데이터를 Booth 타입으로 변환
 */
function parseBoothRow(row: string[], index: number): Booth {
  return {
    id: `booth-${index}`,
    name: row[1] || '',
    description: row[2] || '',
    contactPerson: row[3] || '',
    boothDescription: row[4] || '',
    imageUrl: row[5] || '',
    type: row[6] || '',
    hashtags: row[7] ? row[7].split('#').filter(t => t.trim()).map(t => t.trim()) : [],
    solutions: row[8] || '',
    technologies: row[9] || '',
    researchGoals: row[10] || '',
    mainProducts: row[11] || '',
    demoContent: row[13] || '',
  };
}

/**
 * Google Sheets 포스터 데이터를 Paper 타입으로 변환
 */
function parsePaperRow(row: string[], index: number): Paper {
  return {
    id: `paper-${index}`,
    author: row[0] || '',
    affiliation: row[1] || '',
    conference: row[2] || '',
    title: row[3] || '',
    fileUrl: row[4] || '',
    paperUrl: row[5] || '',
    category: row[6] || '',
    email: row[7] || '',
    phone: row[8] || '',
    presentationTime: row[9] || '',
    willPresent: row[10] || '',
  };
}

/**
 * 부스 데이터 가져오기 (하드코딩된 실제 데이터)
 */
export async function fetchBooths(): Promise<Booth[]> {
  // Google Sheets에서 가져온 실제 데이터 (13개 부스)
  const rawData = [
    ["타임스탬프", "단체명", "단체 소개", "담당자 성함", "부스 소개", "단체/부스 소개 이미지", "단체 구분", "해시태그", "제공 솔루션", "핵심 기술", "연구주제 및 목표", "주요 제품", "14열", "부스 내용(데모)", "13열"],
    ["2025. 11. 14 오후 12:06:14", "클라비", "클라비는 지난 3년간 다양한 문제를 해결하기 위해 50곳이 넘는 기관에 솔루션과 컨설팅을 제공해왔습니다. 앞으로도 끊임없는 연구개발로 고객의 비즈니스를 혁신하면서, AI와 클라우드로 더 나은 미래를 꿈꾸는 모든 분들과 만나고자 합니다.", "김정현", "클라비의 제품, 기술 소개 및 채용에 관심이 있는 모든 분들을 환영합니다. 클라비 전략기술연구소의 AIOps 팀, 연구기획팀, AX사업실 구성원들과 커피챗, 영업상담이 가능합니다. 언제든 방문해주세요.", "", "기업", "#AX SaaS #Agentic AI #클라우드 네이티브", "AX 솔루션(RAG 챗봇 기반), 매니지드 클라우드 서비스/관제 솔루션", "컨텍스트(프롬프트) 엔지니어링, 탐색기반 생성(RAG), 에이전트 오케스트레이션, LLM 파인튜닝, GPUaaS", "랩 부스에는 참여하지 않습니다", "생성형 AI 패키지 '클라비안 플랫폼' (https://www.clabi.co.kr/businessview/1)"],
    ["2025. 11. 14 오후 2:43:51", "K-HP (K-하이테크 플랫폼)", "모두의연구소 K-HP는 기업 재직자의 AI 활용 역량을 강화하기 위해, 세미나–실무형 단기훈련–워크숍으로 이어지는 AI 실무교육 체계를 운영하고 있습니다. 서울/수도권/대전 위주의 국내 유수 기업·연구기관이 모두의연구소 K-HP와 함께 하고 있습니다.\n2026년에는 마케팅, 세일즈, 기획, UX, 데이터, HR 등 8대 직무 중심의 AI 실무 전환(AX)을 지원하며, 모든 교육은 기업 부담 없이 참여 가능합니다.", "김혜민", "모두의연구소 K-HP 부스에서는 간단한 테스트만으로 \"나의 AI 역량 궤도(Orbit)\"를 확인하고, 나만의 별을 AI Universe에 남겨볼 수 있습니다. 현장에서 바로 참여할 수 있는 AI 세미나 사전 알림 신청, 무료 AI 실무교육 안내, 굿즈 수령 이벤트가 함께 진행됩니다.\nAI 실무 적용에 관심 있는 누구나 자연스럽게 참여하고 체험할 수 있는 인터랙티브 공간입니다.", "https://drive.google.com/file/d/1kfVfkxGPu54qduxDZrI1mBDtzMv0-AYx/view?usp=sharing", "모두의연구소 교육사업팀", "#AI재직자교육 #AX전환 #무료세미나 #해커톤", "", "", "", "1순위) AI Agent 세미나 (현업 노하우/인사이트 공유)\n2순위) 모두팝 세미나 (산업별 AI 트렌드 공유)\n3순위) Walk with AI (최신 AI 툴 활용법 공유, 실습)\n4순위) AI 플레이그라운드 (워크숍, 해커톤)"],
    ["2025. 11. 14 오후 4:09:30", "아이펠 리서치팀", "비전공자가 국제 학회 논문을 쓰고, AI 리서처가 되었다.\" 꿈이 아닌, 모두의연구소 AI학교 아이펠이 지난 'AI 리서처 과정'을 통해 만들어온 현실입니다. 8년간 출신 훈련생들이 국제학회 논문 및 150개의 AI 서비스를 만들도록 지도한 경험을 담아, 이번에는 'AI 엔지니어 과정'을 신설했습니다.\r\n100% 국비 지원(훈련장려금 지급)으로 비용 부담 없이 오직 성장에만 집중하세요.\r\n취업과 창업, 당신의 AI 커리어 그 첫 페이지를 장식할 차세대 엔지니어, 국제 무대에서 인정받을 다음 리서처를 모십니다.", "최서윤", "AI·데이터 전문가로 성장할 수 있는 실무 중심 교육 과정을 소개합니다.\n차별화된 교육 방식과 체계적인 커리큘럼, 실제 프로젝트 사례까지 확인하고 상담도 직접 받아보실 수 있습니다.\n방문객을 위한 깜짝 게임 이벤트와 굿즈, 그리고 AI 트렌드를 쏙쏙담은 리포트가 준비되어있습니다 :D\n가벼운 마음으로 내방해주세요", "https://drive.google.com/drive/folders/1x0RUdSCgKWS5_5DUfwS6RNS7D6GBpQpC?usp=sharing", "모두의연구소 교육사업팀", "#AI교육 #AI엔지니어 #AI리서처", "", "", "", " AI 학교 아이펠 , AI/DATA 교육 , 재직자 과정 → KDT 교육 과정 홍보 희망합니다."],
    ["2025. 11. 14 오후 6:33:17", "모두의연구소/비즈팀", "모두의연구소 비즈팀은 AI 기업 진단과 맞춤형 컨설팅을 통해 조직의 AI 교육 솔루션을 설계합니다", "이은경", "AI, 우리 팀만 잘 못 쓰는것 같아 불안하신가요? 모두의연구소 'AX 타로' 부스에서 여러분의 AI 고민 카드를 뽑아보세요! 재미있는 타로로, AX 역량을 점수로 확인하고, 맞춤형 교육 솔루션까지 처방해 드립니다!\n ", "https://drive.google.com/file/d/1xWXPjqoT1AiY-im73WByqI8KiHifgOUQ/view?usp=sharing", "모두의연구소 교육사업팀", "#AI 역량 진단 #AI교육 #AX ", "", "", "", "모두의연구소 비즈팀은 AI 기업 진단과 맞춤형 컨설팅을 통해 조직의 AI 교육 솔루션을 설계합니다. LAB에서 활동하는 다양한 도메인의 전문 강사와 문제 해결 능력을 기르는 아이디어톤을 통해 임직원의 AX역량 향상을 지원합니다."],
    ["2025. 11. 20 오후 2:49:09", "NVIDIA 기술랩 - Data Engineering with RAPIDS", "NVIDIA RAPIDS기반 GPU-based Data Engineering & Science를 연구하는 LAB입니다.", "이제영", "Tabular Dataset을 사용하여 GPU기반으로 Data 처리, 및 Machine Learning을 돌릴 수 있도록 도와주는 라이브러리 NVIDIA RAPIDS를 집중적으로 연구합니다.\nPandas, Scikit-learn, NetworkX등의 기존 라이브러리들의 매소드를 공유하여 쉽고 효과적으로 GPU기반 처리를 할 수 있습니다.\n해당 부분에 대해 자유롭게 이야기 하는 부스입니다.", "https://drive.google.com/file/d/15fFgNUM_Ip1TUpRfK282WN7NmMxIHrrb/view?usp=sharing", "모두의연구소 LAB", "#DataScience #NVIDIA #Tabular", "", "", "다양한 Data Science 및 Engineering 문제를 GPU기반으로 해결해보고, 또 NVIDIA RAPIDS의 사용률을 올려 데이터 과학 생태계에 이바지 하는 것.", "", "", "벤치마킹등을 포함하여, 미래 계획까지를 간단하게 소개하고자했는데 만약 데모가 필요하다면, 노트북을 준비하겠습니다."],
    ["2025. 11. 21 오후 12:57:33", "DAO LAB/다바코단 길드", "바이브코딩의 도구로, 길드원들이 자발적으로 모여 미래의 일하는 방식과 조직 문화를 실험합니다. \n해커톤·챌린지·세미나톤 등을 직접 기획하고 실행하고, 수익화 모델까지 만들어가며, 새로운 협업 패러다임을 만들어가는 DAO 기반 길드입니다. 활동 과정에서 운영 매뉴얼, 체크리스트, 가이드 등을 만들어가며, 커뮤니티 협업과 성장을 촉진하는 실험을 하게 됩니다.", "임성중", "전통적 회사가 아닌 DAO형 커뮤니티. - 자율·공유·재미 중심 - \"바이브코딩\"으로 작게 만들고, 빠르게 공유하며, 서로 배우기 중 일환으로 브랜드컬러매치를 개발했습니다\n\n컬러매치(Color Match)는 브랜드 대표 색상을 맞추는 초간단 인터랙티브 게임입니다. 짧은 플레이 타임과 높은 몰입도를 기반으로 행사장 체류 시간 증가 + 광고 노출 기반 수익화 테스트를 목표로 합니다\n\n다바코단은 → 세미나로 생각을 정제하고 → 해커톤으로 함께 실험하고 → 사업화로 진화하는 DAO기반의 자율 실험조직입니다", "https://drive.google.com/file/d/1WLFLxKOrquo7cCPPJPM6Yqf--L4JShFu/view?usp=sharing", "모두의연구소 LAB", "#바이브코딩교육 #챌린지툴킷 #학습에서_수익화까지", "", "", "바이브코딩으로 미래형 커뮤니티를 만들어 봅니다. 바이브코딩을 활용해 해커톤·챌린지·세미나톤 그리고, 수익화를 목표로 직접 기획하고 실행합니다. 활동 과정에서 운영 매뉴얼, 체크리스트, 가이드 등을 만들어가며, 커뮤니티 협업과 성장을 촉진하는 실험을 하게 됩니다.", "브랜드컬러매치. (게임을 모두콘 현장에서 대기 시간에 주관, 후원, 협력사의 홍보를 대신해주면서 사람들 분산도 하는 팝업 게임으로 쓰면 어떻겠는가! 하는 제안으로 시작했습니다)", "", "https://moducon.vercel.app/ (로고는 협의에 따라 변경될 수 있습니다)"],
    ["2025. 11. 21 오후 7:00:45", "Tenstorrent", "Tenstorrent는 AI를 위한 컴퓨터, 그리고 그 미래를 만들어가는 개발자를 위한 기술을 구축하고 있습니다.", "장형기", "Tenstorrent는 열린 미래를 믿습니다. Tenstorrent의 아키텍처와 소프트웨어는 누구나 수정하고, 포크하고, 소유할 수 있도록 설계되었습니다. 엔지니어와 혁신가, 제 1원리 기반 사고를 하는 이들로 구성된 Tenstorrent 팀은 하드웨어와 소프트웨어가 만나는 방식을 재정의하며 혁신을 가속하고 있습니다. 더 자세한 내용을 원하신다면 Tenstorrent 부스를 방문해 주세요!", "https://drive.google.com/drive/folders/1cgjmOV-V4p7jwen-LnrzmivbkuzKbMnU?usp=sharing", "기업", "#AI #RISC-V #NPU", "Tenstorrent는 RISC-V 기반 CPU와 AI 가속기, 모듈형 칩렛, 그리고 싱글 노드 운영부터 데이터센터급 배포까지 모든 스케일에서 개발자가 완전한 통제권을 갖도록 하는 확장형 컴퓨팅 시스템을 설계합니다.", "Tenstorrent의 PCIe 보드는 Tensix 코어와 경량 RISC-V 코어로 구성된 유연하고 확장 가능한 프로세서로, 기존 GPU 대비 뛰어난 비용 대비 성능을 제공합니다", "N/A", "Tenstorrent 부스에서는 대규모 확장성과 고성능 AI 처리를 위해 설계된 Wormhole™ 및 Blackhole™ PCIe 카드를 직접 만나볼 수 있습니다. 또한 워크스테이션 라인업인 TT-QuietBox™와 TT-LoudBox™도 전시되며, 각각 액체 냉각 및 공랭 옵션을 제공합니다.", "", "N/A"],
    ["2025. 11. 23 오후 10:21:49", "GenAI in Finance / RAG / Safety Generative Lab", "GenAI로 금융을 탐험하다. (AI Agent, RAG, Safety)", "이태경", "GenAI로 금융을 탐험하다. (AI Agent, RAG, Safety)", "https://drive.google.com/file/d/1aczzB_yw3WivVQ-Ww6OJDFSVmGSHT8sT/view?usp=sharing", "모두의연구소 LAB", "#AI Agent #RAG #Finance #GenAI", "", "", "금융에서 알파를 찾기 위한 AI Agent 개발", "금융 특화 AI Agent 및 RAG 파이프라인", "", "Market Context Analysis Agent\n단순 마켓의 긍/부정 Sentiment 분석이 아니라 Context를 이해하는 모델을 기반한 AI Agent 입니다.\n\nCall Summarizer Agent\n음성 입력시 어닝콜과 관련있는 공시, 리포트 등 관련 내용을 브리핑하는 AI Agent 입니다.\n\nDevil's Eye Agent\n뉴스의 펙트 체크와 비슷한 기능을, 리포트, 뉴스 등을 입력하면 이를 근거하는 내용 또는 반대되는 내용을 제공합니다.\n\nRAG 관련 논문\nDirect Embedding Optimization for Negation- and Exclusion-aware Retrieval\n-긍정, 무시 등을 반영하여 리트리벌 할 수 있게 하는 논문 (현재 EACL 언더 리뷰 중)\n\nQGuard-Question-based-Zero-shot-Guard-for-Multi-modal-LLM-Safety\nZeroshot으로 Safety Generative Model을 위한 Guardrail"],
    ["2025. 11. 24 오전 11:47:32", "Hell Maker", "세상에 쓸모는 없지만 재미난 것을 만드는 사람들 (You can try it and enjoy yourself)", "김도혁", "파이썬을 활용  인공 지능 그리고 로봇", "", "모두의연구소 LAB", "#파이썬 #인공지능 #로봇", "", "", "흡연 동작을 인식하여 음성 안내하는 장치 구현", "", "", "파이썬으로 제작 된  로봇 손과 고양이 데모"],
    ["2025. 11. 24 오후 7:49:55", "AI에이전트랩I에이전트랩", " AI Agent에 대한 원리 및 구조의 이해, 구현 방법 및 실제 응용 사례를 연구하고, 발표 토론하며, 팀별로 새로운 사례를 적용하여 결과를 공유합니다.", "최규남", " AI Agent에 대한 원리 및 구조의 이해, 구현 방법 및 실제 응용 사례를 연구하고, 발표 토론하며, 팀별로 새로운 사례를 적용하여 결과를 공유합니다.", "https://drive.google.com/file/d/1iAoG2ILcMO6aohSvnDPW7vmJEhhgFEIP/view?usp=sharing", "모두의연구소 LAB", "#AX #LLM #RAG", "", "", "AI 에이전트", "AI 에이전트", "", "AI 에이전트 랩원들이 개발한 에이전트"],
    ["2025. 11. 27 오후 12:45:34", "VLM Safety LAB", "아이펠 리서치 12기 그루와 이영완 멘토님이 함께 모여 VLM safety alignment를 연구하는 LAB입니다", "정상헌", "파인튜닝없이 프롬프트 엔지니어링만으로 멀티모달 입력(이미지+텍스트)의 잠재적 위험 의도를 사전에 탐지하는 과정을 추가하여 vision-language model이 유해한 입력에 대한 답변을 거절하거나 사용자의 안전한 의사결정을 유도하는 답변을 생성하는 프레임워크를 개발", "", "모두의연구소 LAB", "", "", "", "VLM safety alignment를 주제로 한 논문을 ai 학회에 발표", "", "", "ICCV 워크샵에서 발표한 포스터"],
    ["2025. 11. 28 오후 6:02:31", "피치마켓/B-Peach Lab", "피치마켓은 배움의 속도가 느린 이들이 스스로 성장할 수 있도록 돕는 소셜 임팩트 기업으로, 쉬운 글 콘텐츠 개발을 비롯해 교육, 공간 등 전방위적인 환경 개선을 통해 통합적 사회적응 환경을 만들고자 합니다.\nB-Peach LAB은 피치마켓의 가치관에 공감하여 모인 기획자, 디자이너, 그리고 엔지니어들이 속해 있습니다. 좋은 기술이란 그 쓰임으로 결정된다고 생각하여, AI를 활용한 번안 서비스를 개발했습니다.", "맹선호", "자신만의 속도에 맞춰 배움을 이어가는 이들을 위한\n맞춤형 쉬운글 번안기, 피치서가ai\n나에게 딱 맞는 쉬운글을 디자인하세요!", "", "테크포임팩트 부스", "#AX #융합 #AI리터러시", "", "", "본 연구(AI 활용 번안 서비스)는 다양한 이유로 정보 습득에 어려움을 겪는 사람들에게 AI 기술을 활용한 맞춤형 쉬운글을 제공하여, 실질 문해력 향상을 통한 정보 평등 사회를 이루고자 진행되었습니다. \n\n현대 사회에서 우리는 쏟아지는 정보와 함께 살아가고 있습니다. 그리고 사람들은 각자 저마다의 이유로 정보 습득에 어려움을 겪고 있습니다. \n\n피치마켓은 누구나 정보를 습득하고 학습하며 사회에서 살아갈 수 있도록, 세상의 여러 정보를 수기로 번안하여 제공했습니다. 하지만 시간이 지날수록 정보는 많아지고, 사람의 힘으로 이를 모두 번안하기에는 무리가 있었습니다.\n\n이와 같은 어려움을 해소하며 개인별 맞춤형 쉬운글을 제공하고자 AI 기술을 활용, 수요자가 직접 자신에게 적합한 형태로 쉬운글을 번안할 수 있는 서비스를 개발했습니다. ", "맞춤형 쉬운글 번안기, 피치서가ai", "", "피치서가ai는 피치마켓과 B-Peach Lab이 함께 개발한 AI 쉬운글 번안기로, 원문의 글을 쉬운 글로 번안해주는 서비스입니다.\n사용자는 배경지식, 어휘, 맥락, 글 구조, 문장 구조를 자신의 수준에 맞게 설정하여, 내가 가장 잘 이해할 수 있는 쉬운글을 만들 수 있습니다."]
  ];

  const booths = rawData.slice(1).map((row, index) => parseBoothRow(row, index + 1));
  return booths;
}

/**
 * 포스터 데이터 가져오기 (하드코딩된 실제 데이터)
 */
export async function fetchPapers(): Promise<Paper[]> {
  // Google Sheets에서 가져온 실제 데이터 (33개 포스터)
  const rawData = [
    ["저자", "소속", "학회명", "논문명", "원본파일", "논문 링크", "구분", "메일주소", "핸드폰", "발표 시간", "발표 참여"],
    ["김민중", "", "NIPS Workshop", "Reweighted Flow Matching via Unbalanced Optimal Transport for Long-tailed Generation", "https://drive.google.com/file/d/1etGvJOuTovhUoPCmqV2O8zN4bTAQ2qSf/view", "", "", "minjunggim@gmail.com", "010-2599-7799", "", "발표X"],
    ["김용석", "", "MICCAI 2025", "A New COPD Diagnostic Method Using Radiomics and Artificial Intelligence in Chest CT Imaging", "https://drive.google.com/file/d/12j-Mq2kUNcVkznFnh8hAXlNWs-_5nw65/view", "", "", "youngseok.kim0301@gmail.com", "", "", "발표X"],
    ["김준수", "NVIDIA Foundation Models Lab", "ICCV 2025", "MODULABS-25", "https://drive.google.com/file/d/1JRRw2nY08Xq3Go4HD6q4OM6IDSPmDFGm/view", "", "", "jjunsssk@unist.ac.kr", "010-6327-1570", "", "오후 참여 가능 (미정)"],
    ["김준우", "RSC LAB", "Interspeech 2025", "Improving Respiratory Sound Classification with Architecture-Agnostic Knowledge Distillation from Ensembles", "https://drive.google.com/file/d/1BVG2ydqOGf08MEuQQLnfl3fczaE3OKoJ/view", "", "", "kaen2891@gmail.com", "010-2304-8514", "", "2부 전체(14:10 ~ 16:30)"],
    ["김준우", "RSC LAB", "Interspeech 2025", "Language-Agnostic Suicidal Risk Detection Using Large Language Models", "https://drive.google.com/file/d/1zq1Bqc986uzp-zklrHjP1h9_cUy9q5D3/view", "", "", "kaen2891@gmail.com", "010-2304-8514", "", "2부 전체(14:10 ~ 16:30)"],
    ["김준우", "RSC LAB", "ICASSP 2025", "Noise-Agnostic Multitask Whisper Training for Reducing False Alarm Errors in Call-for-Help Detection", "https://drive.google.com/file/d/1vXzC33XVdJ9ad9Iri0SOphGDkwXO_LYS/view", "", "", "kaen2891@gmail.com", "010-2304-8514", "", "2부 전체(14:10 ~ 16:30)"],
    ["박광석", "AA LAB", "ICML", "AGACCI: Affiliated Grading Agents for Criteria-Centric Interface in Educational Coding Contexts", "https://drive.google.com/file/d/1cZb2vEgV_dKFX3C1vJfRK-NkR1ApYYJE/view", "", "", "kwangsikky@gmail.com", "010-2318-1908", "", "2부 집중발표 시간 (15:40 ~ 16:20)"],
    ["박동규", "Artificial Consciousness Lab", "Cognitive Systems Research", "Modeling Layered Consciousness with Multi-Agent Large Language Models", "https://drive.google.com/file/d/1avGR7vS4bBjOpGuAiHoOPwVNi4FmiFQg/view", "", "", "rnlgksclsrn@hanyang.ac.kr", "010-3887-9173", "", "1부 집중발표 시간 (12:40 ~ 13:20)"],
    ["박동규", "Artificial Consciousness Lab", "MODUCON", "Modeling Layered Consciousness with Multi-Agent Large Language Models - MODUCON 버전", "https://drive.google.com/file/d/1f6aYf7YImKKgoNVp2s3uvnUfSV49Xf4E/view", "", "", "rnlgksclsrn@hanyang.ac.kr", "010-3887-9173", "", "1부 집중발표 시간 (12:40 ~ 13:20)"],
    ["손규진", "HAERAE Lab", "MathNLP @ EMNLP 2025", "Pushing on Multilingual Reasoning Models with Language-Mixed Chain-of-Thought", "https://drive.google.com/file/d/1g68x4d91zKY6UYVvuZglGvR8lQnZWSYI/view", "", "", "spthsrbwls123@yonsei.ac.kr", "010-4991-1341", "", "발표X"],
    ["신혜주", "", "CIKM 2025 HCAI", "Fast Fourier Transform-Based Spectral and Temporal Gradient Filtering for Differential Privacy (FFTKF)", "https://drive.google.com/file/d/18FT0t5-A5wogHWe2Q2hIlk3-uimCkgER/view", "", "", "juyoung.yun@usc.edu", "", "", "1부 집중발표 시간 (12:40 ~ 13:20)"],
    ["이동건", "LLM Experimental LAB", "ACL", "ACL XLLM Typed-RAG", "https://drive.google.com/file/d/1oe6Fj2PYFbqFPj4FFhsRIW6kGT7H3vO7/view", "", "", "lee.dg.125@gmail.com", "010-3317-8739", "", "1부 전체(11:00 ~ 14:00)"],
    ["이지수", "", "", "AI Docent Based on Apple Vision Pro:Designing and Exploring the Potential of XR Exhibition Experience", "https://drive.google.com/open?id=1ZfnU-CITqXjr_JN0005HeuAi6MGJHQ2xJkgxOvh2Fdw", "", "", "", "", "", "발표X"],
    ["이태경", "Safe Generative AI", "ACL 2025", "QGuard: Question-based Zero-shot Guard for Multi-modal LLM Safety", "https://drive.google.com/file/d/1Wp1vrUbjqc8GoxRz7XNGuJWmSeKlmeql/view", "", "", "luckperson7@naver.com", "010-9724-9981", "", "발표X"],
    ["이한울", "", "", "NMIXX 포스터", "https://drive.google.com/file/d/1gL2K4VXZI_yvs1h3pwrFhaVuI_u17QLA/view", "", "", "gksdnf424@gmail.com", "010-2936-4641", "", "발표X"],
    ["이한울", "", "", "TWICE 포스터", "https://drive.google.com/file/d/1z0HJSraXAGUTBEqA3VMh2bMvyyxzLI7t/view", "", "", "gksdnf424@gmail.com", "010-2936-4641", "", "발표X"],
    ["조예은", "", "EMNLP UncertaiNLP Workshop", "모두연", "https://drive.google.com/file/d/1SWt7AJePZ0cH3pc76vQnajL9yAyCVyOn/view", "", "", "joyenn90@gmail.com", "010-2556-6506", "", "발표X"],
    ["명지윤", "PrompTart LAB", "RecSys 2025", "PrompTart", "https://drive.google.com/open?id=1tTbbdfmPlECRh0c1Lt4A4NjJkzkdr6P6nFt11ECNP_Q", "", "", "jiyoon0424@gmail.com", "010-2064-3761", "", "발표X"],
    ["한연규", "", "CVPR 2025", "Ano-Face-Fair", "https://drive.google.com/file/d/1t60wIQ6ceKRx-nRpRK3zSO5Vf4yhmPaQ/view", "", "", "dhlee.jubilee@gmail.com", "010-6880-4578", "", "1부 집중발표 시간 (12:40 ~ 13:20), 2부 집중발표 시간 (15:40 ~ 16:20)"],
    ["한연규", "", "CVPR 2025", "Ano-Skin", "https://drive.google.com/file/d/1zfmlDTiEIc9Yye-y-St3R5CU_lKF9lXW/view", "", "", "dhlee.jubilee@gmail.com", "010-6880-4578", "", "1부 집중발표 시간 (12:40 ~ 13:20), 2부 집중발표 시간 (15:40 ~ 16:20)"],
    ["한연규", "", "CVPR 2025", "Derm-FairAnon", "https://drive.google.com/file/d/1BZq1nb4Lp7IjUbKqX_4kDEIvi6BFt8Od/view", "", "", "dhlee.jubilee@gmail.com", "010-6880-4578", "", "1부 집중발표 시간 (12:40 ~ 13:20), 2부 집중발표 시간 (15:40 ~ 16:20)"],
    ["김홍엽", "", "CVPR 2025", "Question-Aware Gaussian Experts for Audio-Visual Question Answering", "https://drive.google.com/drive/folders/1qBJeahQM2jSSR0hfBQqFYdQzy9N1Wivs?usp=sharing", "", "", "redleaf.kim@skku.edu", "", "12:40-13:20", "12:40-13:20"],
    ["이찬", "", "AAAI 2025", "SAMPD: Multispectral Pedestrian Detection with Sparsely Annotated Label", "https://drive.google.com/file/d/1MAYXzzmDllFl-omM70sWpAD_j1PKY0Ey/view?usp=drive_link", "", "", "cksdlakstp12@khu.ac.kr", "", "12:40-13:20", "12:40-13:20"],
    ["유승욱", "", "ACL 2025", "Delving into Multilingual Language Bias: The MSQAD with Statistical Hypothesis Tests for Large Language Models", "https://drive.google.com/file/d/1KTCDYqHplxuGuIuF-64gnFjA3xfkrBb1/view?usp=sharing", "", "", "seungukyu@gmail.com", "", "12:40-13:20", "12:40-13:20"],
    ["박세진", "", "ICCV 2025", "IM-LUT: Interpolation Mixing Look-Up Tables for Image Super-Resolution", "https://drive.google.com/file/d/1Vmn-EIhf6lvcBg8ysW0Vib6NQXDBTSsL/view?usp=sharing", "", "", "sejin5485@korea.ac.kr", "", "12:40-13:20", "12:40-13:20"],
    ["이홍재", "", "ICCV 2025", "Text Embedding Knows How to Quantize Text-Guided Diffusion Models", "https://drive.google.com/file/d/1CuhTans9bdjOrW4grbErgJSX_86qC8Jo/view?usp=drive_link", "", "", "jimmy9704@korea.ac.kr", "", "12:40-13:20", "12:40-13:20"],
    ["권준형", "", "NAACL 2025", "See-Saw Modality Balance: See Gradient, and Sew Impaired Vision-Language Balance to Mitigate Dominant Modality Bias", "https://drive.google.com/drive/folders/1znavRlu00YEfxDsAZPxjT3xi8VT1FWWg", "", "", "herbwood27@gmail.com", "", "12:40-13:20", "12:40-13:20"],
    ["안재준", "", "NeurIPS 2025", "Efficient Multi-bit Quantization Network Training via Weight Bias Correction and Bit-wise Coreset Sampling", "https://drive.google.com/file/d/1LTz9KR6OlZKMF9TBno8FIT5zH-6l1g9i/view?usp=drive_link", "", "", "ajj8061@skku.edu", "", "12:40-13:20", "12:40-13:20"],
    ["안석호", "", "AAAI 2025", "Real-Time Calibration Model for Low-Cost Sensor in Fine-Grained Time Series", "https://drive.google.com/file/d/1ltquk7hMw70xZbbUf3p8KGBnb14kE7bj/view?usp=drive_link", "", "", "sohko0514@inha.edu", "", "12:40-13:20", "12:40-13:20"],
    ["장환", "", "EMNLP 2025", "Keep Security! Benchmarking Security Policy Preservation in Large Language Model Contexts Against Indirect Attacks in Question Answering", "https://drive.google.com/file/d/1xSlcwlFG_9q7b37nrpwmHmHU_4xhTVUO/view?usp=sharing", "", "", "hwanchang@cau.ac.kr", "", "12:40-13:20", "12:40-13:20"],
    ["백인걸", "", "EMNLP 2025", "How Do Large Vision-Language Models See Text in Image? Unveiling the Distinctive Role of OCR Heads", "https://drive.google.com/file/d/1zaTGwVTzXdEIfJ2Lcm1osmEkMowlbiex/view?usp=sharing", "", "", "ingeolbaek@cau.ac.kr", "", "12:40-13:20", "12:40-13:20"],
    ["이여름", "", "ICLR 2025", "Mitigating Parameter Interference in Model Merging via Sharpness-Aware Fine-Tuning", "https://drive.google.com/file/d/1neFzLC1oZAtI5YBWWRMP5Ddu41rrh823/view?usp=drivesdk", "", "", "leeyeoreum01@hanyang.ac.kr", "", "12:40-13:20", "12:40-13:20"],
    ["정상헌", "", "", "SIA: Enhancing Safety via Intent Awareness for Vision-Language Models", "https://docs.google.com/presentation/d/1m8m4iC1khNEWHO2hlEhXHVkSgcm4Pzu99PNy-ZYi-Xs/edit?usp=sharing", "", "아이펠", "shultra2@gmail.com", "010-2979-2449"]
  ];

  const papers = rawData.slice(1).map((row, index) => parsePaperRow(row, index + 1));
  return papers;
}

/**
 * 부스 필터링 (타입별)
 */
export function filterBoothsByType(booths: Booth[], type?: string): Booth[] {
  if (!type) return booths;
  return booths.filter(b => b.type === type);
}

/**
 * 포스터 필터링 (학회별, 발표시간별)
 */
export function filterPapers(
  papers: Paper[],
  conference?: string,
  presentationTime?: string
): Paper[] {
  let filtered = papers;

  if (conference) {
    filtered = filtered.filter(p => p.conference === conference);
  }

  if (presentationTime) {
    filtered = filtered.filter(p => p.presentationTime === presentationTime);
  }

  return filtered;
}

/**
 * 부스 검색
 */
export function searchBooths(booths: Booth[], query: string): Booth[] {
  const lowerQuery = query.toLowerCase();
  return booths.filter(
    b =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 포스터 검색
 */
export function searchPapers(papers: Paper[], query: string): Paper[] {
  const lowerQuery = query.toLowerCase();
  return papers.filter(
    p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.author.toLowerCase().includes(lowerQuery) ||
      p.conference.toLowerCase().includes(lowerQuery)
  );
}
