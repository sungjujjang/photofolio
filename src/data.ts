export const profile = {
  name: 'JANG SEONG JU',
  koreanName: '장성주',
  nickname: 'SungJu',
  roles: ['DevOps', 'Backend', 'Frontend'],
  intro:
    '대덕소프트웨어마이스터고등학교에서 DevOps · Backend · Frontend 전반을 공부하는 개발자입니다. Kubernetes 환경에서 인프라를 설계하고, 확장 가능한 서비스를 만드는 것을 좋아합니다. 항상 새로운 기술을 학습하고 실제 프로젝트에 적용하는 것을 즐깁니다.',
  heroInfo: [
    { label: 'School', value: '대덕소프트웨어마이스터고등학교 1학년' },
    { label: 'Major', value: 'DevOps / Full-Stack Engineer' },
    { label: 'Birth', value: '2010' },
  ],
  email: 'cherrysungju@gmail.com',
  phone: '010-3006-9794',
  github: 'https://github.com/sungjujjang',
  linkedin: 'https://www.linkedin.com/in/성주-장-632798403/',
  blog: 'https://velog.io/@sungjujjang/posts',
  study: 'https://dev.sungju.xyz/study',
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
    'Java',
    'TypeScript',
    'JavaScript',
    'C',
    'C++',
    'YAML',
    'Go',
  ],
  devops: [
    'Kubernetes',
    'Docker',
    'AWS',
    'GCP',
    'Linux',
    'Proxmox',
    'Nginx',
    'ArgoCD',
    'Helm',
  ],
  backend: [
    'Spring',
    'JPA',
    'NestJS',
    'Express',
    'Django',
    'Flask',
    'FastAPI',
    'MySQL',
    'PostgreSQL',
    'Redis',
    'RabbitMQ',
    'Kafka',
  ],
  frontend: [
    'React',
    'Next.js',
    'Figma',
    'Emotion',
    'Tailwind',
    'Bootstrap',
    'GSAP',
    'TurboRepo',
    'FSD',
  ],
  etc: ['FSD Architecture', 'OAuth 2.0', 'JWT', 'REST API', 'GitOps'],
  mobile: ['Android', 'Flutter'],
}

export const projects = [
  {
    name: 'TeroMox',
    emoji: '⚡',
    description: 'On-Premise 서버에서 돌아가는 EC2 대여 서비스',
    tags: ['React', 'TypeScript', 'Vite', 'Spring', 'FastAPI', 'Proxmox'],
    github: 'https://github.com/TeroMox',
    highlight: true,
    detail: {
      period: '2026.05 ~ 2026.06',
      team: '1인 (개인 프로젝트)',
      stack: 'React / TypeScript / Spring / FastAPI / Proxmox',
      background:
        'AWS, GCP 같은 클라우드 서비스는 강력한 기능을 제공하지만, 학생 입장에서 실제로 사용해보려고 하면 여러 장벽에 부딪힙니다. 해외 결제가 가능한 신용카드가 필요하거나 무료 크레딧 사용 후 자동으로 유료 결제로 전환되는 구조 때문에 의도치 않은 과금이 발생할 위험이 있어, 학생들이 안심하고 사용하기 어렵습니다. 또한 콘솔 UI가 다양한 엔터프라이즈 기능을 포괄하다 보니 메뉴 구조가 복잡하고, 단순히 가상 머신 하나를 생성해서 포트 하나 열고 테스트 해 보고 싶은 학생에게는 오히려 학습 곡선이 더 높게 느껴집니다.',
      features: [
        '가상 인스턴스를 생성하고 시작·중지·삭제 및 초기화할 수 있는 VM 관리 기능',
        '인스턴스의 CPU·메모리 등 현재 사용량과 상태를 확인할 수 있는 모니터링 기능',
        '인스턴스에 필요한 외부 포트를 추가하고 삭제할 수 있는 포트 매핑 기능',
        '쿠폰을 등록하여 서비스 이용에 필요한 크레딧을 충전하고 잔액을 확인하는 기능',
        'JWT 기반 회원 인증과 이메일 변경, 계정 삭제 등 사용자 계정 관리 기능',
      ],
      coreImplementation: [
        'Proxmox VE 기반 가상화 환경을 구축하고 REST API를 연동하여 VM 생성·삭제·시작·중지·초기화 기능을 자동화',
        'Master VM을 게이트웨이로 구성하고 iptables DNAT을 활용하여 하나의 외부 환경에서 사용자별 VM 포트를 매핑',
        'FastAPI와 Spring Boot로 백엔드를 분리하여 인프라 제어와 사용자 인증·데이터 처리의 책임을 분리',
        'VM 생성 요청을 Queue 기반으로 처리하여 동시 요청으로 인한 VM 생성 충돌을 방지하고, MySQL로 사용자, VM, 포트 정보를 관리',
        'React 기반 SPA에서 VM 상태, 사용량 모니터링과 포트 관리 기능을 제공하고 JWT 기반 인증 및 크레딧·쿠폰 시스템을 구현',
      ],
      issues: [
        {
          title: 'iptable 및 Proxmox API 작업이 순서 없이 동시에 이루어짐에 따라 충돌 및 VM 상태 불일치 문제',
          solution:
            'FastAPI의 Queue를 활용하여 iptable 수정뿐만 아니라 Proxmox API를 통한 VM 생성, 삭제, 시작, 종료, 초기화 작업까지 순차적으로 처리하도록 변경했습니다. 반면 VM 정보 조회나 상태 확인과 같은 읽기 작업은 Queue를 거치지 않도록 분리하여 불필요한 대기 시간을 줄였습니다. 이를 통해 동시에 여러 요청이 들어오는 상황에서도 인프라 변경 작업의 안정성을 확보하면서, 읽기 작업은 즉시 처리할 수 있도록 하여 속도와 안정성을 모두 고려한 구조로 개선했습니다.',
        },
        {
          title: 'VM 증가에 따른 IP 대역 관리 및 네트워크 분리 문제',
          solution:
            'VM이 증가할수록 공유기에서 관리해야 하는 IP가 많아지고, 기존 네트워크와 VM 네트워크가 분리되지 않아 보안 문제가 발생할 가능성이 있었습니다. 이를 해결하기 위해 Proxmox 내부에 VLAN 기반의 VM 전용 네트워크를 구성하고, VM ID를 기반으로 IP를 할당하도록 설계했습니다. VM은 외부 네트워크와 직접 통신하지 않고 Gateway를 통해 외부로 통신하도록 구성하여 VM 네트워크와 기존 네트워크를 분리했습니다. 외부 통신 시에는 Gateway가 NAT를 수행하여 외부에서는 Gateway의 IP를 통해 통신하도록 함으로써 공유기의 IP 관리 부담을 줄이고 VM 간 네트워크 격리와 보안성을 확보했습니다.',
        },
      ],
      retrospective:
        '단순히 클라우드 서비스를 사용하는 것을 넘어 가상화, 네트워크, 인증, 자원 관리까지 직접 설계하며 인프라 전반에 대한 이해를 넓힐 수 있었다. Proxmox와 Master VM 구조를 구성하면서 제한된 자원으로 여러 사용자의 VM을 운영하기 위한 구조를 고민할 수 있었다. 또한 인프라 제어와 사용자 서비스를 FastAPI와 Spring Boot로 분리하며 시스템의 역할과 책임을 나누는 설계를 경험했다. 하나의 물리 서버와 Master VM에 의존하면서 자원 한계와 단일 장애점(SPOF)이라는 실제 운영 환경의 문제도 직접 경험했다. 이를 통해 기능 구현뿐만 아니라 확장성, 안정성, 보안까지 고려해야 실제 서비스 수준의 시스템을 만들 수 있다는 것을 배웠다.',
      future:
        '전공동아리 XQUARE에서 위 아이디어를 토대로 학생들에게 실제로 대여해주는 서비스를 기획하였고, 실제로 RAM 64GB, 300만원 상당의 GPU가 달린 노드를 3대 제공받아 실제 운영을 하고 있다. 현재는 대덕소프트웨어마이스터고 학생들을 대상으로 VM을 빌려주는 서비스로 발전되었고, 향후에 실제 AWS 인프라와 비슷한 ASG(Auto Scaling Group)나, LoadBalancer 등을 구축하여 학생들의 인프라 환경을 더욱 편하게 바꾸어 보고 싶다.',
    },
  },
  {
    name: 'DHC',
    emoji: '🏫',
    description: '대마고 기숙사 청소 관리 시스템',
    tags: ['React', 'TypeScript', 'TurboRepo', 'Vite', 'Spring', 'RabbitMQ'],
    github: 'https://github.com/12th-DHC',
    highlight: true,
  },
  {
    name: 'Dexam',
    emoji: '📅',
    description: '학교 일정 관리 및 반별 공유 시스템',
    tags: ['React', 'Vite', 'Spring'],
    github: 'https://github.com/12th-DHC',
    highlight: true,
  },
  {
    name: 'HomeServer Infra',
    emoji: '🌐',
    description: 'ArgoCD ApplicationSet을 활용한 GitOps 레포지토리',
    tags: ['ArgoCD'],
    github: 'https://github.com/sungjujjang/sungju-infra-applications',
    highlight: true,
  },
  {
    name: 'CarIn',
    emoji: '🚗',
    description: '택시 카풀 모집을 위한 서비스',
    tags: ['Django', 'Sqlite'],
    github: 'https://github.com/sungjujjang/Carin',
    highlight: true,
  },
]

export const timeline = [
  {
    date: '2021',
    title: '대구교육대학교 정보영재원 수료',
    description: '정보 분야에 첫발을 내디디며 컴퓨터과학의 기초와 문제 해결 능력을 기르기 시작했습니다.',
    tag: '교육',
  },
  {
    date: '2022',
    title: '대구교육대학교 정보영재원 심화과정 수료 (우수학생 선정)',
    description: '심화과정에서 알고리즘과 자료구조의 깊은 개념을 학습하며 실력을 더욱 탄탄하게 다졌습니다.',
    tag: '교육',
  },
  {
    date: '2023',
    title: '대구영남중학교 소프트웨어 동아리 SASAC 입단 (부장직 활동)',
    description: '정보동아리 SASAC에 합류하여 동아리 활동과 프로젝트를 함께 시작했습니다.',
    tag: '활동',
  },
  {
    date: '2023',
    title: 'SWAI융합 학생동아리 AI모델 해커톤 참여',
    description: 'AI 모델 해커톤에 참여하여 인공지능 모델 설계와 협업 개발을 경험했습니다.',
    tag: '대회',
  },
  {
    date: '2024',
    title: '대구미래교육연구원 메타버스 빅데이터 캠프 참여 (최우수 보고서 선정)',
    description: '메타버스와 함께하는 빅데이터 캠프에 참여해 "대구 자살률 조사"를 주제로 분석하여 우수 보고서로 선정되었습니다.',
    tag: '수상',
  },
  {
    date: '2025',
    title: '대구창의융합교육원 주관 해커톤 우승',
    description: '지역 교육청 주관 해커톤에 참가하여 문제 해결 프로젝트를 개발하고 우승을 차지했습니다.',
    tag: '수상',
  },
  {
    date: '2025',
    title: '달빛연합 SW융합 학생 해커톤 우승 (최우수상·인기상·창의상)',
    description: '대구창의융합교육원 & 광주광역시교육청교육연구정보원이 주관한 달빛연합 SW융합 학생 해커톤에서 최우수상(1등), 인기상, 창의상을 모두 수상했습니다. 청소년 정신 문제를 주제로 서비스를 기획·구현하고, 100명 이상 앞에서 발표하여 학생 투표로 선정된 인기상과 최종 투표 1등상을 모두 수상했습니다.',
    tag: '수상',
  },
  {
    date: '2026',
    title: '대덕소프트웨어마이스터고등학교 입학',
    description: '대덕소프트웨어마이스터고등학교에 입학하여 DevOps / Full-Stack Engineer 전공으로 학습을 시작했습니다.',
    tag: '학교',
  },
  {
    date: '2026',
    title: '대덕소프트웨어마이스터고등학교 전공동아리 XQUARE 활동',
    description: '전공동아리 XQUARE에서 DevOps · Backend · Frontend 를 집중적으로 학습하고 있습니다.',
    tag: '활동',
  },
  {
    date: '2026',
    title: '카카오 AI 루키캠프 수료 (전국 50명 선발)',
    description: '카카오에서 주최한 AI 루키캠프를 수료하며 실무에 가까운 AI/ML 학습과 프로젝트 경험을 쌓았습니다. 3박 4일 동안 팀원들과 협업하며 소통의 중요성을 배우고, 부스 전시와 100명 이상 앞에서 단독 발표를 진행했습니다.',
    tag: '교육',
  },
  {
    date: '2026',
    title: '대덕소프트웨어마이스터고등학교 교내 해커톤 우수상',
    description: '3일간 외부 API 연동 서비스 개발 중 네트워크 문제 등 급박한 상황에서도 원인을 파악해 해결하고, 1학년으로서 OpenAPI와 OAuth 연동을 직접 구현, 전교생 앞 메인 발표자로 프로젝트를 소개했습니다.',
    tag: '학교',
  },
]

export const certificates = [
  { name: '정보처리기능사 (프로그래밍기능사)', year: '2025', number: '25403042129P' },
]

export const coreCompetencies = [
  {
    title: 'Docker + Kubernetes 기반 엔지니어링',
    desc: '실제 온프레미스 Kubernetes 인프라를 구축, 운영해보며 여러 문제 상황들을 겪어보았습니다. 문제 상황을 즉각 대응하며 Kubernetes 문제 해결 능력을 갖추어 실제 실무에서 사용할 수 있는 수준까지 끌어 올렸습니다.',
  },
  {
    title: 'AWS 인프라 운영',
    desc: 'AWS의 여러 서비스들을 공부하며 구축 및 운영을 시도했습니다. 어떤 방식으로 인프라를 설계해야지 비용 절감, 응답 속도, 고가용성이 충족되는지 연구하며 설계하는 능력을 갖추었습니다. 현재는 SSA 자격증을 준비하며 실제 문제 상황에서도 대비가 가능하도록 준비하고 있습니다.',
  },
  {
    title: 'Spring 기반 백엔드 개발',
    desc: 'Spring 기반 백엔드 개발 경험을 쌓았습니다. JPA를 통한 CRUD 개발, RabbitMQ를 이용한 비동기 처리 시스템, Redis 등을 활용한 캐싱, 세션 등 Auth 로직, 외부 서비스와 원활한 연동을 지원하기 위해 OAuth 2.0 개발 및 사용 등을 경험하였습니다.',
  },
  {
    title: 'React 기반 프론트엔드 개발',
    desc: 'React 프레임워크를 기반으로 한 프론트엔드 개발 경험을 쌓았습니다. FSD 계층 구조를 활용한 원활한 협업 환경 구성, TurboRepo를 활용해 여러 애플리케이션 사이의 중복 코드 통합, Emotion, Tailwind CSS, GSAP 라이브러리를 활용한 애니메이션 기반 웹사이트 등을 경험하였습니다.',
  },
  {
    title: '프로젝트 리더십',
    desc: '최소 2인부터 최대 12인의 대형 프로젝트에서까지 Project Manager 직책을 맡으며 팀을 안정적으로 이끌어 나아갔습니다. 팀원들 간의 소통, 일정 조절, 불화 해결 등을 맡으며 어떤 방식으로 팀을 안정적으로 운영할 지, 또한 PM의 입장에서 어떤 팀원이 개발을 원활하게 진행하기에 편한 지 깨달았습니다.',
  },
]

export const techGroups = [
  { label: 'DevOps', items: skills.devops, color: '#111111' },
  { label: 'Backend', items: skills.backend, color: '#3f3f46' },
  { label: 'Frontend', items: skills.frontend, color: '#71717a' },
  { label: 'Languages', items: skills.languages, color: '#a1a1aa' },
  { label: 'Core', items: skills.etc, color: '#d4d4d8' },
]