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
    detail: {
      period: '2025.08 ~ 2025.12',
      team: '4인 (PM 겸 백엔드)',
      stack: 'React / TypeScript / TurboRepo / Vite / Spring / RabbitMQ',
      background:
        '기숙사 생활을 하는 학생들의 청소 당번 관리가 수기로 이루어져 누락·중복·불공정 문제가 빈번했습니다. 학생들이 직접 확인하고 관리할 수 있는 투명한 시스템이 필요했습니다.',
      features: [
        '청소 구역·당번 자동 배정 및 알림 발송 기능',
        '청소 완료 인증 사진 업로드 및 검수 기능',
        '벌점·보상 포인트 시스템으로 공정성 확보',
        '관리자 대시보드: 미수행자 조회, 통계, 공지사항 관리',
        'RabbitMQ 기반 비동기 알림(이메일·푸시) 처리',
      ],
      coreImplementation: [
        'TurboRepo 모노레포로 프론트(React)·백엔드(Spring)·공통 타입·유틸리티 통합 관리',
        'Spring Boot + JPA로 도메인 모델 설계(학생, 구역, 일정, 벌점, 알림)',
        'RabbitMQ를 이용해 청소 마감 임박·미수행·인증 요청 등 이벤트 비동기 처리',
        'React + Vite SPA에서 실시간 알림(SSE) 및 반응형 UI 구현',
        'JWT 기반 인증·인가, 역할별 메뉴 권한 분리(학생/관리자)',
      ],
      issues: [
        {
          title: '청소 인증 사진 업로드 시 대용량 파일로 인한 서버 부하',
          solution:
            '클라이언트에서 이미지 리사이즈·압축 후 업로드하도록 처리하고, 서버에서는 Multipart 업로드 시 스트리밍 방식으로 저장하여 메모리 점유를 최소화했습니다. 또한 S3 호환 스토리지(MinIO)를 도입해 정적 파일을 분리 저장했습니다.',
        },
        {
          title: '동시 알림 발송 시 RabbitMQ 큐 적체',
          solution:
            '알림 타입별로 Exchange·Queue를 분리하고, 긴급 알림(마감 임박)은 우선순위 큐로, 일반 알림은 일반 큐로 라우팅했습니다. Consumer 스케일아웃과 Prefetch 조정으로 처리량을 확보했습니다.',
        },
      ],
      retrospective:
        '모노레포(TurboRepo) 구조로 프론트·백엔드·공통 코드를 하나의 저장소에서 관리하며 빌드·배포 파이프라인을 단순화할 수 있었습니다. RabbitMQ를 처음 도입해보며 이벤트 주도 아키텍처의 장점(결합도 낮춤, 확장성)과 운영 복잡도(큐 모니터링, 데드레터 처리) 모두를 체감했습니다. PM으로서 일정 조율·코드 리뷰·이슈 트래킹을 병행하며 기술적 의사결정과 팀 운영의 균형을 배웠습니다.',
      future:
        '학생회·교사용 별도 관리 포털 분리, 청소 구역 자동 최적화 알고리즘 도입, 타 기숙사로 확장 가능한 멀티 테넌트 구조로 발전시킬 계획입니다.',
    },
  },
  {
    name: 'Dexam',
    emoji: '📅',
    description: '학교 일정 관리 및 반별 공유 시스템',
    tags: ['React', 'Vite', 'Spring'],
    github: 'https://github.com/12th-DHC',
    highlight: true,
    detail: {
      period: '2025.03 ~ 2025.07',
      team: '3인 (풀스택)',
      stack: 'React / Vite / Spring / MySQL',
      background:
        '학교·학급·동아리별 일정이 흩어져 있어 학생들이 본인 관련 일정을 한눈에 보기 어려웠습니다. 구글 캘린더 연동 없이도 교내 일정을 통합 관리·공유할 수 있는 경량 시스템이 필요했습니다.',
      features: [
        '학교·학년·반·동아리별 계층형 일정 등록·조회',
        '반별 공유 캘린더(읽기/쓰기 권한 분리)',
        '일정 알림(당일/전일) 브라우저 푸시 알림',
        'ICS(캘린더) 내보내기 기능으로 외부 캘린더 연동',
        '관리자: 전체 일정 일괄 등록·수정·삭제',
      ],
      coreImplementation: [
        'Spring Boot + JPA로 계층형 일정 도메인(학교>학년>반>동아리) 설계',
        'React + Vite에서 FullCalendar 라이브러리 커스터마이징하여 월/주/일 뷰 제공',
        'Web Push API(VAPID)로 서비스 워커 기반 푸시 알림 구현',
        'ICS(RFC 5545) 포맷 생성기로 Google/Outlook 캘린더 호환 내보내기',
        '권한 기반 API: 학교 관리자 > 학년 관리자 > 반장 > 일반 학생',
      ],
      issues: [
        {
          title: '반복 일정(주간/월간) 생성 시 예외 날짜(공휴일·시험기간) 처리',
          solution:
            'RRULE 표준을 따르되 예외 날짜(EXDATE)를 별도 테이블로 관리하도록 설계했습니다. 프론트에서 반복 규칙 작성 시 예외 날짜를 다중 선택할 수 있는 UI를 제공하고, 백엔드에서 발생 인스턴스 생성 시 EXDATE를 제외하도록 필터링 로직을 추가했습니다.',
        },
        {
          title: '푸시 알림 구독 권한 거부 시 사용자 경험 저하',
          solution:
            '알림 권한 요청을 컨텍스트에 맞게(일정 등록 직후) 띄우고, 거부 시에도 앱 내 알림센터(인앱 알림)로 폴백하여 중요 정보를 놓치지 않도록 했습니다. 서비스 워커 수명 주기 관리 로직을 강화해 브라우저 재시작 후에도 구독이 유지되도록 했습니다.',
        },
      ],
      retrospective:
        '캘린더 도메인의 복잡도(반복, 예외, 권한, 타임존)를 직접 다루며 도메인 모델링의 중요성을 실감했습니다. 풀캘린더 커스터마이징 과정에서 날짜·시간대 처리의 미묘한 버그들을 경험하고, 테스트 코드로 검증하는 습관을 들였습니다. 3인 소규모 팀에서 풀스택을 오가며 개발 속도와 코드 품질 사이의 균형을 맞추는 연습이 되었습니다.',
      future:
        '교내 공식 시스템으로 채택되도록 보안 감사·접근성 검토를 진행하고, 교사용 출결 연동·학부모 알림 채널 확장을 고려 중입니다.',
    },
  },
  {
    name: 'HomeServer Infra',
    emoji: '🌐',
    description: 'ArgoCD ApplicationSet을 활용한 GitOps 레포지토리',
    tags: ['ArgoCD'],
    github: 'https://github.com/sungjujjang/sungju-infra-applications',
    highlight: true,
    detail: {
      period: '2025.11 ~ 현재',
      team: '1인 (개인 인프라 프로젝트)',
      stack: 'ArgoCD / Helm / Kubernetes / GitOps',
      background:
        '홈랩 환경에서 수동으로 매니페스트를 적용하다 보니 구성 드리프트, 롤백 어려움, 변경 이력 부재 문제가 발생했습니다. GitOps 원칙(단일 소스, 선언적, 자동 동기화)을 적용해 인프라를 코드로 관리하고자 했습니다.',
      features: [
        'ArgoCD ApplicationSet으로 다중 클러스터·다중 애플리케이션 선언적 관리',
        'Helm 차트 템플릿화로 공통 설정(리소스 제한, 프라비전, 인그레스) 재사용',
        'Kustomize 오버레이로 환경별(dev/staging/prod) 차이 흡수',
        'Renovate 봇으로 컨테이너 이미지·Helm 차트 버전 자동 업데이트 PR 생성',
        'ArgoCD 알림(Slack·Webhook)으로 동기화 상태·실패 실시간 감지',
      ],
      coreImplementation: [
        'ApplicationSet Generator(Cluster·Git·Matrix)로 신규 서비스 추가 시 매니페스트 1개만 추가하면 자동 등록',
        'Helm values.yaml 계층화: 공통 values → 서비스별 values → 환경별 values 오버라이드',
        'ArgoCD Project·RBAC로 네임스페이스·리소스 권한 격리',
        'Sync Wave·Hook(PreSync/PostSync)로 DB 마이그레이션·캐시 워밍 등 순서 제어',
        'Sealed Secrets / External Secrets Operator로 시크릿 Git 저장 안전화',
      ],
      issues: [
        {
          title: 'ArgoCD ApplicationSet 매트릭스 생성 시 네임스페이스 충돌',
          solution:
            'Generator 매트릭스에서 네임스페이스를 동적으로 생성하되, 클러스터별 네임스페이스 프리픽스를 부여해 충돌을 방지했습니다. 또한 ArgoCD Project 단위로 네임스페이스 생성 권한을 제한하여 무분별한 생성을 차단했습니다.',
        },
        {
          title: 'Helm 차트 업데이트 시 크로스 네임스페이스 리소스(CRD, ClusterRole) 적용 실패',
          solution:
            '클러스터 스코프 리소스는 별도 Helm 차트(인프라 차트)로 분리하고, ArgoCD Sync Wave를 이용해 애플리케이션 차트보다 먼저 적용되도록 순서를 제어했습니다. CRD는 설치 후 삭제되지 않도록 `helm.sh/resource-policy: keep` 어노테이션을 추가했습니다.',
        },
      ],
      retrospective:
        'GitOps로 전환한 후 배포 리드타임이 수 분에서 수 초로 단축되었고, 모든 변경이 Git 히스토리에 남아 감사 추적이 가능해졌습니다. ArgoCD의 선언적 모델이 주는 안정감과, 헬름·커스텀아이즈 조합으로 중복을 제거하는 설계 패턴을 익혔습니다. 단, ArgoCD 자체 업그레이드·CRD 마이그레이션 등 컨트롤 플레인 운영 부담도 있음을 인지했습니다.',
      future:
        '멀티 클러스터(클라우드+온프레미스) 통합 관리, Policy-as-Code(Kyverno/OPA) 도입으로 보안·컴플라이언스 자동 검증, 카나리·블루그린 배포 파이프라인 내재화를 목표로 합니다.',
    },
  },
  {
    name: 'CarIn',
    emoji: '🚗',
    description: '택시 카풀 모집을 위한 서비스',
    tags: ['Django', 'Sqlite'],
    github: 'https://github.com/sungjujjang/Carin',
    highlight: true,
    detail: {
      period: '2024.06 ~ 2024.08',
      team: '2인 (백엔드 리드)',
      stack: 'Django / SQLite / Django REST Framework / Vanilla JS',
      background:
        '심야·새벽 시간대 택시 잡기가 어렵고, 동승 의사가 있는 승객끼리 매칭되면 요금 분담과 배차 효율을 모두 높일 수 있습니다. 간단한 웹 기반 카풀 매칭 서비스를 프로토타입으로 제작했습니다.',
      features: [
        '출발지·도착지·희망 시간 입력으로 카풀 모집 글 작성',
        '경로 유사도(구간 겹침 비율) 기반 자동 매칭 추천',
        '실시간 채팅(웹소켓)로 탑승 조율',
        '매칭 완료 시 예상 요금 분담 계산 및 정산 가이드',
        '관리자: 부적절 게시물 신고·차단, 통계 대시보드',
      ],
      coreImplementation: [
        'Django + DRF로 REST API 설계(게시글, 매칭, 채팅, 사용자)',
        'SQLite + 공간 인덱스(PostGIS 미사용 시 위도/경도 기반 단순 거리 계산)로 경로 유사도 산출',
        'Django Channels + Redis로 웹소켓 실시간 채팅 구현',
        'JWT 인증 + 소셜 로그인(카카오/구글) 연동',
        '배포: Nginx + Gunicorn + systemd, SQLite는 백업 스크립트로 주기적 덤프',
      ],
      issues: [
        {
          title: '경로 유사도 알고리즘이 단순 거리 기반이라 실제 도로망과 괴리',
          solution:
            'OSRM(Open Source Routing Machine) 데모 서버를 활용해 실제 주행 거리·시간을 API로 조회하고, 구간 겹침 비율을 실경로 기준으로 재계산하도록 개선했습니다. 외부 API 호출 캐싱(TTL 1시간)으로 응답 속도와 쿼터를 관리했습니다.',
        },
        {
          title: '웹소켓 연결 불안정(모바일 네트워크 전환 시 끊김)',
          solution:
            '재연결 로직(지수 백오프 + 최대 5회)을 클라이언트에 추가하고, 서버 측에서 메시지 영속성(Redis Stream)을 두어 재연결 시 미수신 메시지를 동기화하도록 했습니다. 하트비트(핑/퐁)로 유휴 연결 정리도 병행했습니다.',
        },
      ],
      retrospective:
        '첫 Django 프로젝트로 ORM·마이그레이션·어드민·인증 등 프레임워크가 주는 생산성을 체감했습니다. 단, SQLite는 동시 쓰기 처리 한계가 있어 실서비스 전환 시 PostgreSQL 마이그레이션이 필수적임을 배웠습니다. 2인 팀에서 백엔드 전담하며 API 설계·테스트·배포 자동화까지 전주기를 경험했습니다.',
      future:
        'PostgreSQL + PostGIS 마이그레이션으로 정확한 경로 매칭 구현, 네이티브 앱(React Native/Flutter) 전환, 결제·정산 모듈 연동으로 실사업화 검토 중입니다.',
    },
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