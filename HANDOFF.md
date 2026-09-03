# Portfolio Redesign Handoff

## 변경 사항

- 전체 사이트를 Black & White 기반의 미니멀 포트폴리오 스타일로 재구성했다.
- `/` 소개/Portfolio 페이지는 hero, about, skills, projects, career, contact 섹션으로 다시 설계했다.
- 기존 콘텐츠 데이터(`profile`, `skills`, `projects`, `timeline`)와 외부 링크 기능은 유지했다.
- 기존 커스텀 버튼/카드 중심 UI를 shadcn/ui `Button`, `Badge`, `Card`, `Separator`, `Sheet` 기반 구조로 정리했다.
- 전역 CSS 하단에 2026 redesign override를 추가해 typography, spacing, card, button, navigation, hover, responsive 규칙을 통일했다.
- Portfolio 영역에 GSAP 진입 애니메이션과 scroll reveal을 적용했다.
- Study/TIL 페이지는 장식적인 GSAP 애니메이션 없이 정적 읽기 경험을 우선하도록 처리했다.
- Markdown 렌더링 후 `highlight.js` syntax highlighting, code copy button, responsive table wrapper를 적용했다.

## shadcn/ui 사용 컴포넌트

- `Button`: hero CTA, navigation menu trigger, 프로젝트/연락 액션, back-to-top.
- `Badge`: hero role, skill stack, project tags, timeline tag.
- `Card`: profile, skill group, project, timeline, contact panel.
- `Separator`: hero 하단 index rule.
- `Sheet`: mobile navigation drawer.

## GSAP 적용 위치

- `src/App.tsx`의 `Hero`: 페이지 첫 진입 시 kicker, title, copy, actions, profile panel 순서로 timeline animation.
- `src/lib/gsap.ts`의 `useGsapReveal`: Portfolio 섹션의 `[data-gsap]` 요소에 scroll 기반 reveal.
- Study 페이지는 가독성 우선 요구에 맞춰 GSAP을 적용하지 않는다.

## Study Markdown 렌더링

- `marked`와 `DOMPurify` 기반 렌더링은 유지했다.
- 이미지 상대 경로를 GitHub raw URL로 변환하는 기존 기능을 유지했다.
- YouTube 링크/커스텀 문법 iframe 변환 기능을 유지했다.
- 렌더 후 `.md-body pre code`에 `highlight.js`를 적용한다.
- 각 code block에 `Copy` 버튼을 자동 삽입한다.
- Markdown table은 `.md-table-wrap`으로 감싸 좁은 화면에서 가로 스크롤되게 했다.
- Heading, paragraph, list, blockquote, inline code, code block, table, image, hr 스타일을 GitHub 문서 읽기 경험에 가깝게 재정리했다.

## Responsive 대응

- Navigation은 desktop nav와 mobile shadcn Sheet drawer로 분리했다.
- Portfolio grid는 980px 이하에서 1열로 전환된다.
- Study article/list 컨테이너는 모바일에서 padding과 typography를 줄여 overflow를 방지한다.
- Code block과 Markdown table은 모바일에서도 가로 스크롤로 내용을 유지한다.
- Hero, project actions, contact actions는 좁은 화면에서 세로 버튼 배치로 전환된다.

## 실행 방법

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5010
```

- 개발 서버 포트: `5010`
- 접속 URL: `http://localhost:5010`
- 프로덕션 빌드: `npm run build`

## 주요 환경 변수

- 현재 필수 환경 변수는 없다.
- Velog API는 Vite dev server proxy(`/velog-api` -> `https://v2.velog.io/graphql`)를 사용한다.

## 주요 구조

- `src/App.tsx`: Portfolio/소개 페이지, navigation, GSAP hero/section animation.
- `src/Study.tsx`: Study/TIL 라우팅, GitHub tree fetch, Velog fetch, Markdown 렌더링, code copy/highlight/table wrapper.
- `src/data.ts`: profile, skill, project, timeline 콘텐츠 데이터.
- `src/index.css`: shadcn token, 기존 스타일, 최종 redesign override, Markdown typography.
- `src/lib/gsap.ts`: Portfolio scroll reveal hook.
- `src/components/ui/*`: shadcn/ui 기반 컴포넌트.
- `vite.config.ts`: Vite 설정, alias, Tailwind plugin, dev server `5010`, Velog proxy.

## 주의사항

- 사이트 전체는 Black & White 기반의 미니멀한 포트폴리오 디자인을 유지한다.
- shadcn/ui를 기반으로 UI를 구성한다.
- GSAP은 Portfolio/소개 영역의 인터랙션과 애니메이션에 활용한다.
- Study 페이지는 애니메이션보다 가독성과 사용성을 최우선으로 하며, GitHub와 유사한 Markdown 읽기 경험을 유지한다.
- 개발 서버는 포트 `5010`을 사용한다.
- Study의 Markdown HTML은 `dangerouslySetInnerHTML`로 삽입되므로 DOMPurify sanitize 설정을 유지해야 한다.
- Markdown table/code block 동작은 렌더 후 DOM 보강 방식이므로 `content` 상태 변경 이후 실행되는 effect를 제거하지 않는다.
- 전역 디자인 토큰을 바꿀 때는 `src/index.css` 하단의 `2026 Portfolio Redesign Override` 영역을 우선 수정한다.
