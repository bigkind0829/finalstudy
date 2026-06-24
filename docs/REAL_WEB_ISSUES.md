# 작업 이슈 — 실사용 웹 수직 슬라이스

> 원칙: 각 슬라이스는 UI, API, DB가 함께 동작하는 end-to-end 단위다. 가로 레이어만 따로 만들지 않는다.

## Slice 0 — 배포/환경 기반 정리

**무엇을 만드나**
- `.env.example`을 실사용 웹 기준으로 갱신.
- Vercel/Supabase 환경변수 체크리스트 작성.
- Markdown 내보내기 잔여 문서/코드 참조 제거 확인.
- 로컬 개발 기준 `GEMINI_API_KEY`, `APP_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 정리.

**완료 기준**
- 새 개발자가 `.env.example`만 보고 필요한 키를 알 수 있음.
- Vercel에 넣어야 할 환경변수 목록 명확.
- 기존 MVP 기능이 로컬에서 계속 작동.

**의존성**: 없음

---

## Slice 1 — 단일 비밀번호 로그인

**무엇을 만드나**
- 로그인 페이지 또는 로그인 패널.
- `POST /api/auth/login`으로 `APP_PASSWORD` 검증.
- 성공 시 HttpOnly 세션 쿠키 발급.
- 로그아웃 API.
- 보호된 앱 화면: 인증 전에는 노트 UI 접근 불가.

**DB**
- 없음. 비밀번호는 `.env` 기반.

**API**
- `POST /api/auth/login`
- `POST /api/auth/logout`
- 서버 유틸: `requireOwner()` 또는 `getCurrentOwnerId()`

**UI**
- 비밀번호 입력 폼.
- 인증 실패 메시지.
- 로그아웃 버튼.

**완료 기준**
- 비밀번호 틀리면 접근 불가.
- 비밀번호 맞으면 앱 사용 가능.
- 쿠키는 HttpOnly.
- `getCurrentOwnerId()`는 현재 `"personal"` 반환.

**의존성**: Slice 0

---

## Slice 2 — Supabase notes 저장소 구축

**무엇을 만드나**
- Supabase SQL 스키마 작성.
- 서버 전용 Supabase admin client.
- notes CRUD 함수.
- `owner_id = "personal"` 필터 기본 적용.

**DB**
```sql
create table notes (
  id uuid primary key,
  owner_id text not null default 'personal',
  title text not null,
  source_file_name text not null,
  note_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**API**
- 아직 공개 API 전부 만들지 않아도 됨.
- 서버 저장소 모듈:
  - `listNotes(ownerId)`
  - `getNote(ownerId, id)`
  - `createNote(ownerId, note)`
  - `renameNote(ownerId, id, title)`
  - `deleteNote(ownerId, id)`

**UI**
- 없음 또는 개발 확인용 최소 연결.

**완료 기준**
- 서버에서 Supabase 연결 성공.
- notes 생성/조회/수정/삭제 함수가 타입 안정적으로 동작.
- Service Role key는 서버 코드에서만 사용.

**의존성**: Slice 1

---

## Slice 3 — 노트 목록/열기 서버화

**무엇을 만드나**
- localStorage 기반 노트 목록을 Supabase 기반으로 교체.
- `GET /api/notes`로 노트 목록 조회.
- `GET /api/notes/:id` 또는 `GET /api/notes?id=`로 단일 노트 조회.
- 기존 사이드바 UI 유지.

**DB**
- `notes` 조회.

**API**
- `GET /api/notes`
- 선택 구현:
  - `GET /api/notes/[id]`
  - 또는 query 기반 단일 route

**UI**
- 좌측 노트 목록 서버 데이터로 표시.
- 노트 클릭 시 DB 노트 렌더.
- 로딩/빈 상태 표시.

**완료 기준**
- 새 브라우저에서도 로그인 후 노트 목록 복원.
- localStorage에 의존하지 않음.
- owner_id 필터 적용.

**의존성**: Slice 2

---

## Slice 4 — 생성 결과 자동 DB 저장

**무엇을 만드나**
- 텍스트 생성과 오디오 생성 API가 생성 성공 후 Supabase에 노트 저장.
- 클라이언트는 생성 성공 시 저장된 DB 노트를 받음.
- 목록 최신순 갱신.

**DB**
- `notes` insert.
- `note_json`에 현재 Note JSON 저장.

**API**
- `POST /api/generate`
- `POST /api/note-from-audio`
- 두 API 모두 `requireOwner()` 적용.

**UI**
- 기존 생성 UI 유지.
- 생성 성공 시 현재 노트 선택.
- 실패 시 DB에 저장하지 않음.

**완료 기준**
- 텍스트 생성 후 DB에 노트 생성.
- 오디오 생성 후 DB에 노트 생성.
- 생성 중 Gemini 503 retry/fallback 유지.
- 새로고침 후 생성 노트가 목록에 있음.

**의존성**: Slice 3

---

## Slice 5 — 제목 수정/삭제 서버화

**무엇을 만드나**
- 제목 수정이 Supabase `notes.title`에 반영.
- 삭제가 DB row 삭제로 동작.
- 기존 제목 편집 UI와 삭제 버튼 유지.

**DB**
- `notes.title`, `updated_at` update.
- `notes` delete.

**API**
- `PATCH /api/notes/[id]`
- `DELETE /api/notes/[id]`

**UI**
- 제목 입력 시 저장 방식 결정:
  - 추천: debounce 저장.
- 삭제 확인창 유지.
- 삭제 후 다음 최신 노트 선택.

**완료 기준**
- 제목 수정 후 새로고침해도 유지.
- 삭제 후 DB에서 제거.
- 다른 owner_id 노트 수정/삭제 불가.

**의존성**: Slice 4

---

## Slice 6 — PDF 출력 실사용 마감

**무엇을 만드나**
- PDF 저장 기능 유지.
- 출력 CSS 점검.
- 모든 toggle 강제 펼침 보장.
- DB 저장 노트에서도 동일하게 출력.

**DB**
- 없음.

**API**
- 없음.

**UI**
- PDF 저장 버튼.
- print media CSS.
- 출력 시 사이드바/입력/버튼 숨김.

**완료 기준**
- PDF 미리보기에서 모든 toggle 내용 보임.
- Mermaid, table, examHint 배지 출력 가능.
- 제목과 source file name이 겹치지 않음.

**의존성**: Slice 5

---

## Slice 7 — 강의록 확장 준비 스키마

**무엇을 만드나**
- 실제 강의록 업로드 구현은 하지 않음.
- 나중에 강의록 파일/이미지/대본을 연결할 수 있게 `lecture_assets` 스키마와 타입만 준비.
- 확장 설계 문서로 이미지 삽입/강의록 동기화 경로를 명확히 남김.
- 현재 UI에는 노출하지 않음.

**DB**
```sql
create table lecture_assets (
  id uuid primary key,
  owner_id text not null,
  note_id uuid references notes(id) on delete cascade,
  kind text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

**API**
- 없음. 서버 타입만 준비.

**UI**
- 없음.

**완료 기준**
- 스키마 문서/마이그레이션에 포함.
- `lib/lecture-assets.ts`에 asset kind/type 정의.
- `docs/LECTURE_ASSETS_DESIGN.md`에 향후 구현 흐름 문서화.
- `owner_id`, `note_id`, `kind`, `metadata`로 강의록/PDF/이미지 확장 가능.
- 현재 기능에 영향 없음.

**의존성**: Slice 2

---

## Slice 8 — Vercel 배포 점검

**무엇을 만드나**
- Vercel 배포 설정.
- 환경변수 등록 문서.
- Supabase SQL 적용 체크리스트.
- 배포 후 smoke test.

**DB**
- Supabase production project 연결.

**API**
- 배포 환경에서 Gemini/Supabase/Auth 작동 확인.

**UI**
- 실제 URL에서 로그인 → 생성 → 저장 → 재접속 → PDF 저장 확인.

**완료 기준**
- Vercel URL 접속 가능.
- 비밀번호 로그인 가능.
- 텍스트 노트 생성 가능.
- 오디오 노트 생성 가능.
- DB 저장/목록/제목 수정/삭제 가능.
- PDF 저장 가능.

**의존성**: Slice 6

---

## 권장 구현 순서
`0 → 1 → 2 → 3 → 4 → 5 → 6 → 8`

`7`은 Slice 2 이후 아무 때나 병행 가능. 실제 기능 영향이 없으므로 DB 확장 준비로만 처리.

## 이번 단계에서 하지 않을 것
- 강의록 PDF/PPT 파싱.
- 강의록 그림 자동 삽입.
- 원본 오디오 저장.
- Supabase Auth.
- 멀티유저 UI.
- 결제/쿼터.
