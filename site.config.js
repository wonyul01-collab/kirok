/*
 * 키록 사이트 설정 — 이 파일 하나만 고치면 된다.
 * KAKAO_CHANNEL_URL: 카카오톡 채널을 만든 뒤 'http://pf.kakao.com/_xxxxx' 처럼 채널 주소만 넣는다(끝의 /chat 은 붙이지 않아도 된다).
 *                    비어 있으면 사이트의 카톡 단추가 '카카오톡 채널 준비 중'으로 보인다.
 * SUPABASE_URL / SUPABASE_KEY: 문의 남기기용 공개(publishable) 값. 배포 스크립트가 넣는다. 문의 표는 '쓰기'만 열려 있다.
 */
window.KIROK_CONFIG = {
  KAKAO_CHANNEL_URL: '',
  SUPABASE_URL: 'https://qrxcvxbxwpqdhqyaezcr.supabase.co',
  SUPABASE_KEY: 'sb_publishable_zPabvP5gWbTXfcYVF4gpCQ_Gm-_czgF',
  PLAY_RELEASE: '2026년 12월 출시 예정'
};
