export const profile = {
  name: 'JANG SEONG JU',
  koreanName: '장성주',
  nickname: 'SungJu',
  roles: ['DevOps', 'Backend', 'Frontend', 'ML'],
  intro:
    '대덕소프트웨어마이스터고등학교에서 DevOps · Backend · Frontend · ML 전반을 공부하는 개발자입니다. Kubernetes 환경에서 인프라를 설계하고, 확장 가능한 서비스를 만드는 것을 좋아합니다. 항상 새로운 기술을 학습하고 실제 프로젝트에 적용하는 것을 즐깁니다.',
  email: '20261112@dsm.hs.kr',
  github: 'https://github.com/sungjujjang',
  blog: 'https://velog.io/@sungjujjang/posts',
  followers: 36,
  following: 57,
  repositories: 40,
  stars: 14,
  achievements: ['Pull Shark', 'Pair Extraordinaire', 'YOLO'],
  solvedac: 'https://solved.ac/dsm20261112',
  youtube: 'https://www.youtube.com/watch?v=UCH9QOF2Czyq-sTCJy2kf2A',
}

export const skills = {
  languages: [
    'Python',
    'C',
    'C++',
    'Java',
    'JavaScript',
    'TypeScript',
    'C#',
    'NASM',
    'YAML',
    'JSON',
  ],
  devops: [
    'Docker',
    'Kubernetes',
    'AWS',
    'GCP',
    'Linux',
    'Nginx',
    'Prometheus',
    'Grafana',
    'Cloudflare',
    'Proxmox',
    'ArgoCD',
    'Helm',
  ],
  backend: [
    'Django',
    'Flask',
    'FastAPI',
    'Spring',
    'Express',
    'MySQL',
    'PostgreSQL',
    'Redis',
    'JPA',
    'SQLite',
  ],
  frontend: [
    'React',
    'Next.js',
    'Vite',
    'Figma',
    'Bootstrap',
    'Tailwind',
    'styled-components',
  ],
  ml: ['PyTorch', 'Matplotlib', 'Pandas'],
  mobile: ['Android', 'Flutter'],
  etc: ['Blender', 'Arduino', 'Raspberry Pi'],
}

export const projects = [
  {
    name: 'Teromox',
    emoji: '🖥️',
    description: '홈서버 기반 VPS 서비스',
    tags: ['Linux', 'Kubernetes', 'Proxmox'],
    github: 'https://github.com/sungjujjang/Teromox',
    highlight: true,
  },
  {
    name: 'Carin',
    emoji: '🚕',
    description: '택시 카풀 매칭 플랫폼',
    tags: ['HTML', 'Frontend', 'Service'],
    github: 'https://github.com/sungjujjang/Carin',
    highlight: true,
  },
  {
    name: 'sungjublog',
    emoji: '📝',
    description: 'Next.js 개인 기술 블로그',
    tags: ['Next.js', 'TypeScript'],
    github: 'https://github.com/sungjujjang/sungjublog',
    link: 'https://velog.io/@sungjujjang/posts',
    highlight: true,
  },
  {
    name: 'examplan',
    emoji: '📅',
    description: '실시간 공유 플래너 · 캘린더',
    tags: ['Java', 'Backend'],
    github: 'https://github.com/sungjujjang/examplan',
  },
  {
    name: 'NofiSender',
    emoji: '🔔',
    description: '휴대폰 알림 웹훅 전송 앱',
    tags: ['Java', 'Android'],
    github: 'https://github.com/sungjujjang/NofiSender',
  },
  {
    name: 'kbosunwe',
    emoji: '⚾',
    description: 'KBO 실시간 순위 집계 서비스',
    tags: ['Python', 'HTML', 'Data'],
    github: 'https://github.com/sungjujjang/kbosunwe',
  },
  {
    name: 'gokaist',
    emoji: '✨',
    description: '실시간 협업 웹 프로젝트',
    tags: ['JavaScript'],
    github: 'https://github.com/sungjujjang/gokaist',
  },
  {
    name: 'fastapi_user',
    emoji: '🔐',
    description: 'FastAPI 로그인 베이스 코드',
    tags: ['FastAPI', 'Python'],
    github: 'https://github.com/sungjujjang/fastapi_user',
  },
  {
    name: 'lolnaejeonbot',
    emoji: '🎮',
    description: 'LoL 내전 매치메이킹 봇',
    tags: ['Python', 'Discord Bot'],
    github: 'https://github.com/sungjujjang/lolnaejeonbot',
  },
  {
    name: 'instagramcopybot',
    emoji: '📸',
    description: '인스타 콘텐츠 백업 봇',
    tags: ['Python', 'Automation'],
    github: 'https://github.com/sungjujjang/instagramcopybot',
  },
  {
    name: 'life_excape_game',
    emoji: '🔓',
    description: 'Python 방탈출 게임',
    tags: ['Python', 'Game'],
    github: 'https://github.com/sungjujjang/life_excape_game',
  },
  {
    name: 'yunodiscord',
    emoji: '🃏',
    description: '디스코드 UNO 게임 봇',
    tags: ['Python', 'Discord Bot'],
    github: 'https://github.com/sungjujjang/unodiscord',
  },
  {
    name: 'study',
    emoji: '📚',
    description: '학습 내용을 기록하는 저장소',
    tags: ['Python'],
    github: 'https://github.com/sungjujjang/study',
  },
  {
    name: 'backjoon',
    emoji: '🧩',
    description: '백준 알고리즘 풀이 기록',
    tags: ['Python', 'Algorithm'],
    github: 'https://github.com/sungjujjang/backjoon',
  },
]

export const timeline = [
  {
    date: '2021',
    title: '대구교육대학교 정보영재원 수료',
    description:
      '정보 분야에 첫발을 내디디며 컴퓨터과학의 기초와 문제 해결 능력을 기르기 시작했습니다.',
    tag: '교육',
    emoji: '🎓',
  },
  {
    date: '2022',
    title: '대구교육대학교 정보영재원 심화과정 수료',
    description:
      '심화과정에서 알고리즘과 자료구조의 깊은 개념을 학습하며 실력을 더욱 탄탄하게 다졌습니다.',
    tag: '교육',
    emoji: '🏅',
  },
  {
    date: '2023',
    title: '대구영남중학교 정보동아리 SASAC 입단',
    description:
      '정보동아리 SASAC에 합류하여 동아리 활동과 프로젝트를 함께 시작했습니다.',
    tag: '활동',
    emoji: '🚀',
  },
  {
    date: '2023',
    title: 'SW-AI융합 학생동아리 AI모델 해커톤 참여',
    description:
      'AI 모델 해커톤에 참여하여 인공지능 모델 설계와 협업 개발을 경험했습니다.',
    tag: '대회',
    emoji: '🤖',
  },
  {
    date: '2024',
    title: '대구미래교육연구원 메타버스 빅데이터 캠프 참여',
    description:
      '메타버스와 함께하는 빅데이터 캠프에 참여해 "대구 자살률 조사"를 주제로 분석하여 우수 보고서로 선정되었습니다.',
    tag: '수상',
    emoji: '📊',
  },
  {
    date: '2025',
    title: '대구창의융합교육원 주관 해커톤 우승',
    description:
      '지역 교육청 주관 해커톤에 참가하여 문제 해결 프로젝트를 개발하고 우승을 차지했습니다.',
    tag: '수상',
    emoji: '🏆',
  },
  {
    date: '2025',
    title: '달빛연합 SW융합 학생 해커톤 우승',
    description:
      '대구창의융합교육원 & 광주광역시교육청교육연구정보원이 주관한 달빛연합 SW융합 학생 해커톤에서 최우수상(1등), 인기상, 창의상을 모두 수상했습니다.',
    tag: '수상',
    emoji: '👑',
  },
  {
    date: '2026',
    title: '대덕소프트웨어마이스터고등학교 입학 및 전공동아리 XQUARE 입단',
    description:
      '대덕소프트웨어마이스터고등학교에 입학하여 전공동아리 XQUARE에서 DevOps · Backend · Frontend 를 집중적으로 학습하고 있습니다.',
    tag: '학교',
    emoji: '💻',
  },
  {
    date: '2026',
    title: '대덕소프트웨어마이스터고등학교 교내 해커톤 우수상',
    description:
      '대덕소프트웨어마이스터고등학교에서 주관한 교내 해커톤에서 우수상을 수상하였습니다.',
    tag: '학교',
    emoji: '👑',
  },
  {
    date: '2026',
    title: '카카오 AI 루키캠프 수료',
    description:
      '카카오에서 주최한 AI 루키캠프를 수료하며 실무에 가까운 AI/ML 학습과 프로젝트 경험을 쌓았습니다.',
    tag: '교육',
    emoji: '🤖',
  },
]

export const techGroups = [
  { label: 'DevOps', items: skills.devops, color: '#F54900' },
  { label: 'Backend', items: skills.backend, color: '#38BDF8' },
  { label: 'Frontend', items: skills.frontend, color: '#818CF8' },
  { label: 'Mobile', items: skills.mobile, color: '#34D399' },
  { label: 'ML / AI', items: skills.ml, color: '#F472B6' },
]
