// ============================================================
// 기억숲 관리자(admin.gieoksoop.com) 공용 모듈
// - 로그인/로그아웃, admins 컬렉션 기반 role 확인
// - 모든 admin/*.html 페이지가 공유하는 사이드바 셸 렌더링
// - role(superadmin/admin)에 따라 메뉴 노출 여부 결정
// 페이지 쪽 HTML에는 <div id="adminRoot"></div> 하나만 있으면 되고,
// 실제 사이드바/상단바 마크업은 이 파일이 만들어서 넣어준다.
// ============================================================
import { firebaseConfig } from "./fbconfig.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function adminLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const adminSnap = await getDoc(doc(db, "admins", cred.user.uid));
  if (!adminSnap.exists()) {
    await signOut(auth);
    const err = new Error("이 계정은 관리자로 등록되어 있지 않아요.");
    err.code = "admin/not-admin";
    throw err;
  }
  return { user: cred.user, admin: adminSnap.data() };
}

export async function adminLogout() {
  await signOut(auth);
}

export function friendlyAdminError(err) {
  const code = err && err.code ? err.code : "";
  const map = {
    "admin/not-admin": "이 계정은 관리자로 등록되어 있지 않아요. 슈퍼관리자에게 문의해 주세요.",
    "auth/invalid-email": "이메일 형식을 확인해 주세요.",
    "auth/user-not-found": "가입되지 않은 이메일이에요.",
    "auth/wrong-password": "비밀번호가 올바르지 않아요.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않아요.",
    "auth/too-many-requests": "잠시 후 다시 시도해 주세요.",
  };
  return map[code] || "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
}

// 라인 스타일 아이콘 (Feather/Lucide류 outline 아이콘과 동일한 방식: 24x24 뷰박스,
// stroke=currentColor, 채우기 없음) — 메뉴 라벨 앞에 붙는 작은 인디케이터.
const ICON_DASHBOARD =
  '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/></svg>';
const ICON_MEMBERS =
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4"/></svg>';
const ICON_PAYMENTS =
  '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10.2h18"/><path d="M7 15h4"/></svg>';
const ICON_GUIDES =
  '<svg viewBox="0 0 24 24"><path d="M12 6.3c-1.9-1.3-4.3-1.8-6.5-1.5v12.4c2.2-.3 4.6.2 6.5 1.5 1.9-1.3 4.3-1.8 6.5-1.5V4.8c-2.2-.3-4.6.2-6.5 1.5Z"/><path d="M12 6.3v12.4"/></svg>';
const ICON_NOTICES =
  '<svg viewBox="0 0 24 24"><path d="M3 10v4a1 1 0 0 0 1 1h2l5.3 4V5L6 9H4a1 1 0 0 0-1 1Z"/><path d="M14.5 8.7a4 4 0 0 1 0 6.6"/><path d="M17.5 6.3a7.6 7.6 0 0 1 0 11.4"/></svg>';
const ICON_ADMINS =
  '<svg viewBox="0 0 24 24"><path d="M12 3.5 5.3 6v5.3c0 4.5 2.9 7.8 6.7 8.9 3.8-1.1 6.7-4.4 6.7-8.9V6Z"/><path d="m9.2 12 2 2 3.6-4"/></svg>';
const ICON_ERRORS =
  '<svg viewBox="0 0 24 24"><path d="M12 3.2 3 19.5h18L12 3.2Z"/><path d="M12 9.6v4.4"/><circle cx="12" cy="16.7" r="0.95" fill="currentColor" stroke="none"/></svg>';
const ICON_SETTINGS =
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.03a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.03a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.03a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';

const ICON_STATS =
  '<svg viewBox="0 0 24 24"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>';

const ICON_INQUIRIES =
  '<svg viewBox="0 0 24 24"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16h-.0A1.5 1.5 0 0 1 4 14.5Z"/><path d="M8.5 9h7"/><path d="M8.5 12h4.5"/></svg>';

// 사이드바 메뉴 정의 — 새 화면을 추가할 땐 이 배열에 한 줄만 추가하면 된다.
const NAV_ITEMS = [
  { key: "dashboard", href: "index.html", label: "대시보드", icon: ICON_DASHBOARD },
  { key: "members", href: "members.html", label: "회원관리", icon: ICON_MEMBERS },
  { key: "payments", href: "payments.html", label: "구독결제 관리", icon: ICON_PAYMENTS },
  { key: "inquiries", href: "inquiries.html", label: "고객문의", icon: ICON_INQUIRIES },
  { key: "guides", href: "guides.html", label: "사용가이드 관리", icon: ICON_GUIDES },
  { key: "notices", href: "notices.html", label: "공지사항 관리", icon: ICON_NOTICES },
  { key: "stats", href: "stats.html", label: "방문 통계", icon: ICON_STATS },
  { key: "error_reports", href: "error-reports.html", label: "오류 로그", icon: ICON_ERRORS },
  { key: "admins", href: "admins.html", label: "관리자 계정", icon: ICON_ADMINS, superadminOnly: true },
  { key: "settings", href: "settings.html", label: "시스템 설정", icon: ICON_SETTINGS, superadminOnly: true },
];

function renderShell(activeKey, role) {
  const nav = NAV_ITEMS.filter((item) => !item.superadminOnly || role === "superadmin")
    .map(
      (item) =>
        `<a href="${item.href}" class="${item.key === activeKey ? "active" : ""}"><span class="nav-icon">${item.icon}</span>${item.label}</a>`
    )
    .join("");
  return `
    <aside class="admin-sidebar">
      <a class="brand" href="index.html"><img src="img/apple-touch-icon.png" alt="">기억숲 Admin</a>
      <nav class="admin-nav">${nav}</nav>
      <div class="admin-user">
        <div class="who" id="adminWhoName">-</div>
        <div class="role" id="adminWhoRole">-</div>
        <button type="button" id="adminLogoutBtn">로그아웃</button>
      </div>
    </aside>
    <div class="admin-main">
      <div class="admin-topbar">
        <div>
          <h1 id="adminPageTitle"></h1>
          <p id="adminPageDesc"></p>
        </div>
      </div>
      <div class="admin-content" id="adminContent"></div>
    </div>
    <div class="modal-overlay" id="adminModalOverlay"><div class="modal" id="adminModal"></div></div>
    <div class="toast" id="adminToast"></div>
  `;
}

export function toast(msg, isError = false) {
  const el = document.getElementById("adminToast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast show" + (isError ? " error" : "");
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = "toast";
  }, 3200);
}

// opts.size === 'lg' 이면 더 넓고 긴 모달(가이드/공지사항 본문 편집처럼 내용이 긴 폼용)을 사용한다.
export function openModal(html, opts = {}) {
  const modal = document.getElementById("adminModal");
  modal.innerHTML = html;
  modal.className = "modal" + (opts.size === "lg" ? " modal-lg" : "");
  document.getElementById("adminModalOverlay").classList.add("open");
}

// 모달이 닫힐 때(확인 버튼이든 바깥 클릭이든) 한 번 실행할 후속 동작 -- 예: 결제취소 완료 화면을 본 뒤 목록 갱신.
let afterCloseHook = null;
export function closeModal() {
  document.getElementById("adminModalOverlay").classList.remove("open");
  const modal = document.getElementById("adminModal");
  modal.innerHTML = "";
  modal.className = "modal";
  if (afterCloseHook) {
    const fn = afterCloseHook;
    afterCloseHook = null;
    try { fn(); } catch (e) { console.error(e); }
  }
}

// ---- 관리자 카드 취소(환불) ----
// 결제 서버(Cloudflare Worker)가 로그인 토큰 + admins 문서를 직접 검증한 뒤 포트원에 실제 카드 취소를 요청한다.
const ADMIN_REFUND_URL = "https://gieoksoop.com/api/payments/admin-refund";

const REFUND_ERRORS = {
  not_admin: "관리자 권한이 확인되지 않아요.",
  payment_not_cancellable: "이미 취소됐거나 취소할 수 없는 결제예요.",
  nothing_to_cancel: "취소할 수 있는 금액이 남아있지 않아요.",
  invalid_amount: "취소 금액이 올바르지 않아요.",
  payment_record_not_found: "결제 기록을 찾지 못했어요.",
  portone_cancel_failed: "카드사(포트원) 취소 요청이 실패했어요. 이미 카드사에서 취소된 거래일 수 있어요(테스트 채널은 결제 후 자동 취소돼요).",
};

// 수동 결제 등록/삭제(서버가 관리자 검증 후 결제 기록 + 이용 기간을 함께 처리한다).
// payload: { action: "create", uid, paidAt, plan, amount, method, memo, startDate } 또는 { action: "delete", paymentDocId }
const ADMIN_MANUAL_URL = "https://gieoksoop.com/api/payments/admin-manual";
const MANUAL_ERRORS = {
  not_admin: "관리자 권한이 확인되지 않아요.",
  invalid_params: "입력값을 확인해 주세요.",
  user_not_found: "회원을 찾지 못했어요.",
  payment_record_not_found: "결제 기록을 찾지 못했어요.",
  card_payment_not_deletable: "카드 결제 기록은 삭제할 수 없어요. 결제취소로 처리해 주세요.",
  period_update_failed: "이용 기간을 되돌리지 못해 삭제하지 않았어요.",
};

export async function adminManualPayment(payload) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(ADMIN_MANUAL_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    const msg = MANUAL_ERRORS[data.error] || data.error || "HTTP " + res.status;
    throw new Error(msg + (data.detail ? " (" + data.detail + ")" : ""));
  }
  return data;
}

export function canAdminRefund(p) {
  const status = p.status || "paid";
  return !!p.payment_id && (status === "paid" || status === "partial_refunded");
}

// ---- 정책 환불액(이용약관 제7조) -- 서버 worker/src/payments.js computeAnnualRefund 와 같은 규칙 ----
const RF_KST = 9 * 3600 * 1000;
const RF_DAY = 24 * 3600 * 1000;
const RF_ANNUAL_PRICE = 28000;
const RF_MONTHLY_PRICE = 3000;
const rfKstFmt = (d) => {
  const k = new Date(d.getTime() + RF_KST);
  return `${k.getUTCFullYear()}.${String(k.getUTCMonth() + 1).padStart(2, "0")}.${String(k.getUTCDate()).padStart(2, "0")}`;
};
const rfMonthDiff = (a, b) => {
  const x = new Date(a.getTime() + RF_KST), y = new Date(b.getTime() + RF_KST);
  return (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + (y.getUTCMonth() - x.getUTCMonth());
};
const rfAddMonths = (date, months) => {
  const k = new Date(date.getTime() + RF_KST);
  const total = k.getUTCFullYear() * 12 + k.getUTCMonth() + months;
  const y = Math.floor(total / 12), m = ((total % 12) + 12) % 12;
  const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(k.getUTCDate(), dim), k.getUTCHours(), k.getUTCMinutes(), k.getUTCSeconds()) - RF_KST);
};
const rfToDate = (ts) => (ts && typeof ts.toDate === "function" ? ts.toDate() : null);

// 연간 결제 한 건의 정책 환불액. 연간이 아니거나 시작일을 알 수 없으면 null.
function policyRefund(p, u, now) {
  if (p.plan !== "annual") return null;
  const paidAt = rfToDate(p.paid_at);
  const start = rfToDate(p.period_start) || paidAt;
  if (!start) return null;
  const price = Number(p.amount) || RF_ANNUAL_PRICE;
  if (now.getTime() <= start.getTime()) return { mode: "before_start", amount: price, start };
  const lastLogin = u ? rfToDate(u.app_last_login_at) : null;
  const usedAfterPay = !!(lastLogin && paidAt && lastLogin.getTime() > paidAt.getTime()) || !!(u && u.paid_feature_used_at);
  if (paidAt && now.getTime() - paidAt.getTime() <= 7 * RF_DAY && !usedAfterPay) {
    return { mode: "within_7days", amount: price, start };
  }
  let m = rfMonthDiff(start, now);
  let anchor = rfAddMonths(start, m);
  if (anchor.getTime() > now.getTime()) { m -= 1; anchor = rfAddMonths(start, m); }
  const used = Math.max(1, anchor.getTime() === now.getTime() ? m : m + 1);
  return { mode: "prorated", amount: Math.max(0, price - used * RF_MONTHLY_PRICE), used, start, keepUntil: rfAddMonths(start, used), usedAfterPay };
}

// p: payments 문서({id, payment_id, amount, refunded_amount, plan ...}).
// opts.onDone: 취소 성공 후 호출, opts.onBack: [닫기] 눌렀을 때 호출(없으면 모달 닫기).
export async function openAdminRefundModal(p, opts = {}) {
  const total = Number(p.amount || 0);
  const already = Number(p.refunded_amount || 0);
  const cancellable = Math.max(0, total - already);
  // 정책 환불액 계산에 쓰는 회원 정보(앱 로그인 기록 등)
  let userDoc = opts.user || null;
  if (!userDoc && p.uid) {
    try {
      const s = await getDoc(doc(db, "users", p.uid));
      if (s.exists()) userDoc = s.data();
    } catch (e) { console.error(e); }
  }
  const policy = policyRefund(p, userDoc, new Date());
  // 정책 금액에서 이미 취소한 금액을 뺀 값 -- 이번에 취소할 금액의 기본값
  const policyAmount = policy ? Math.min(cancellable, Math.max(0, policy.amount - already)) : null;
  const defaultAmount = policyAmount !== null ? policyAmount : cancellable;
  // 이용 기간 처리 기본값: 약관상 사용 개월이 있으면 "사용한 달까지만 유지", 그 외는 "전부 회수"
  const usedAvailable = !!(policy && policy.mode === "prorated");
  const defaultPeriodMode = usedAvailable ? "used" : "all";
  const usedUntilLabel = usedAvailable ? rfKstFmt(new Date(policy.keepUntil.getTime() - RF_DAY)) : "";
  let policyHtml = "";
  if (policy) {
    const lines = {
      before_start: `이용 시작 전이에요(시작 ${rfKstFmt(policy.start)}) → <b>전액 환불</b>`,
      within_7days: `결제 후 7일 이내이고 앱 로그인 기록이 없어요 → <b>전액 환불</b>`,
      prorated: `사용 <b>${policy.used}개월</b>(시작 ${rfKstFmt(policy.start)}${policy.usedAfterPay ? " · 결제 후 앱 로그인 기록 있음" : ""}) → ${RF_ANNUAL_PRICE.toLocaleString()}원 − ${policy.used} × ${RF_MONTHLY_PRICE.toLocaleString()}원`,
    }[policy.mode];
    const extra = policy.mode === "prorated"
      ? `<div class="rf-policy-sub">정책상 취소해도 사용한 달(${rfKstFmt(new Date(policy.keepUntil.getTime() - RF_DAY))}까지)은 계속 이용할 수 있어요.</div>`
      : "";
    const already_note = already > 0 ? `<div class="rf-policy-sub">정책 금액 ${policy.amount.toLocaleString()}원에서 이미 취소한 ${already.toLocaleString()}원을 뺀 금액이에요.</div>` : "";
    policyHtml = `<div class="rf-policy"><div class="rf-policy-title">정책 기준 환불액 <b>${policyAmount.toLocaleString()}원</b></div><div class="rf-policy-sub">${lines}</div>${extra}${already_note}</div>`;
  } else if (p.plan === "monthly") {
    policyHtml = `<div class="rf-policy rf-policy-muted"><div class="rf-policy-sub">월간 결제는 약관상 이미 결제한 기간의 환불이 없어요. 예외로 환불하려면 금액을 직접 입력해 주세요.</div></div>`;
  }
  const back = () => (opts.onBack ? opts.onBack() : closeModal());
  openModal(`
    <h3>결제취소</h3>
    <div class="rf-warn">실제 카드 승인이 취소(환불)돼요. 되돌릴 수 없으니 금액을 꼭 확인해 주세요.</div>
    <div class="rf-info">
      <div class="rf-row"><span>결제금액</span><b>${total.toLocaleString()}원</b></div>
      <div class="rf-row"><span>이미 취소</span><b>${already.toLocaleString()}원</b></div>
      <div class="rf-row rf-strong"><span>취소 가능</span><b>${cancellable.toLocaleString()}원</b></div>
      <div class="rf-row rf-id"><span>결제번호</span><b>${escapeHtml(p.payment_id)}</b></div>
    </div>
    ${policyHtml}
    <div class="form-field">
      <label for="rfAmount">취소 금액</label>
      <div class="rf-amount">
        <input type="number" id="rfAmount" min="1" max="${cancellable}" value="${defaultAmount}">
        <span class="rf-unit">원</span>
        ${policy ? '<button type="button" class="btn btn-outline btn-sm" id="rfPolicyBtn">정책 금액</button>' : ''}
        <button type="button" class="btn btn-outline btn-sm" id="rfFullBtn">전액</button>
      </div>
      <p class="form-hint" id="rfRemain"></p>
    </div>
    <div class="form-field">
      <label for="rfReason">취소 사유 <span class="rf-req">필수</span></label>
      <input type="text" id="rfReason" placeholder="예: 고객 요청, 테스트 결제">
    </div>
    <div class="form-field rf-period">
      <label>이용 기간 처리</label>
      <label class="rf-opt">
        <input type="radio" name="rfPeriod" value="all" ${defaultPeriodMode === "all" ? "checked" : ""}>
        <span><b>이 결제의 이용 기간 전부 회수</b><span class="rf-check-desc">이 결제로 부여된 기간을 모두 없애고, 뒤에 이어 붙은 결제 기간은 앞으로 당겨요. 남는 기간이 없으면 구독이 종료돼요.</span></span>
      <button type="button" class="rf-more" aria-expanded="false">설명 <i>▾</i></button></label>
      ${usedAvailable ? `<label class="rf-opt">
        <input type="radio" name="rfPeriod" value="used" ${defaultPeriodMode === "used" ? "checked" : ""}>
        <span><b>사용한 달까지만 유지 <span class="rf-tag">정책</span></b><span class="rf-check-desc">사용 ${policy.used}개월(~${usedUntilLabel})만 남기고 이후 기간은 회수해요. 약관의 환불 기준과 같은 처리예요.</span></span>
      <button type="button" class="rf-more" aria-expanded="false">설명 <i>▾</i></button></label>` : ""}
      <label class="rf-opt">
        <input type="radio" name="rfPeriod" value="none">
        <span><b>이용 기간 그대로 유지</b><span class="rf-check-desc">돈만 환불하고 이용 기간은 줄이지 않아요.</span></span>
      <button type="button" class="rf-more" aria-expanded="false">설명 <i>▾</i></button></label>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline" id="rfCancelBtn">닫기</button>
      <button type="button" class="btn btn-danger-solid" id="rfConfirmBtn">결제취소하기</button>
    </div>
  `);
  // 이용 기간 처리 옵션: 설명은 기본으로 접어 두고, 오른쪽 [설명] 버튼으로 펼치고 닫는다.
  document.querySelectorAll(".rf-opt .rf-more").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const opt = btn.closest(".rf-opt");
      const open = opt.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.querySelector("i").textContent = open ? "▴" : "▾";
    });
  });
  const rfAmountEl = document.getElementById("rfAmount");
  const rfRemainEl = document.getElementById("rfRemain");
  const updateRemain = () => {
    const v = Number(rfAmountEl.value) || 0;
    if (v < 1 || v > cancellable) {
      rfRemainEl.textContent = `1원 ~ ${cancellable.toLocaleString()}원 사이로 입력해 주세요.`;
    } else {
      rfRemainEl.textContent = v === cancellable ? "전액 취소 · 취소 후 남는 결제금액 0원" : `일부 취소 · 취소 후 남는 결제금액 ${(total - already - v).toLocaleString()}원`;
    }
  };
  rfAmountEl.addEventListener("input", updateRemain);
  document.getElementById("rfFullBtn").addEventListener("click", () => { rfAmountEl.value = cancellable; updateRemain(); });
  const rfPolicyBtn = document.getElementById("rfPolicyBtn");
  if (rfPolicyBtn) rfPolicyBtn.addEventListener("click", () => { rfAmountEl.value = policyAmount; updateRemain(); });
  updateRemain();
  document.getElementById("rfCancelBtn").addEventListener("click", back);
  document.getElementById("rfConfirmBtn").addEventListener("click", async () => {
    const amount = Number(document.getElementById("rfAmount").value);
    const reason = document.getElementById("rfReason").value.trim();
    const periodMode = (document.querySelector('input[name="rfPeriod"]:checked') || {}).value || "none";
    if (!amount || amount < 1 || amount > cancellable) {
      toast("취소 금액을 확인해 주세요.", true);
      return;
    }
    if (!reason) {
      toast("취소 사유를 입력해 주세요.", true);
      return;
    }
    const btn = document.getElementById("rfConfirmBtn");
    btn.disabled = true;
    btn.textContent = "취소 처리 중...";
    try {
      const token = await auth.currentUser.getIdToken();
      const callRefund = async (extra) => {
        const r = await fetch(ADMIN_REFUND_URL, {
          method: "POST",
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: p.payment_id, amount, reason, periodMode, ...(extra || {}) }),
        });
        return { res: r, data: await r.json().catch(() => ({})) };
      };
      let { res, data } = await callRefund();
      // 카드사(PG)에서 이미 취소된 거래일 수 있는 실패: 확인했다면 우리 기록만 취소 처리할 수 있게 물어본다.
      if (!res.ok && data && data.pgMaybeAlreadyCancelled) {
        const ok = window.confirm(
          "카드사 취소 요청이 실패했어요" + (data.detail ? " (" + data.detail + ")" : "") + ".\n\n" +
          "카드사에서 이미 취소된 거래일 수 있어요(예: 테스트 채널 자동 취소, 카드사에서 직접 취소).\n" +
          "포트원 콘솔/카드사에서 이미 취소된 것을 확인했다면, 카드 취소 없이 우리 결제 기록과 이용 기간만 취소 처리할 수 있어요.\n\n" +
          "기록만 취소 처리할까요?"
        );
        if (ok) ({ res, data } = await callRefund({ confirmPgAlreadyCancelled: true }));
      }
      if (!res.ok || !data.ok) {
        const msg = REFUND_ERRORS[data.error] || data.error || "HTTP " + res.status;
        throw new Error(msg + (data.detail ? " (" + data.detail + ")" : ""));
      }
      const refunded = Number(data.refundedAmount) || amount;
      toast(`${refunded.toLocaleString()}원 결제취소를 완료했어요.`);
      // 팝업을 바로 닫지 않고 "취소 완료" 화면으로 바꾼다. 확인(또는 바깥 클릭)으로 닫힐 때 후속 동작(목록 갱신)을 실행한다.
      const remain = Math.max(0, total - already - refunded);
      const kept = Number(data.keptMonths) || 0;
      const periodLabel = data.periodMode === "none" ? "그대로 유지"
        : kept > 0 ? `사용한 ${kept}개월까지 유지` + (data.validUntil ? ` (~${rfKstFmt(new Date(new Date(data.validUntil).getTime() - RF_DAY))})` : "")
        : data.accessEnded ? "전부 회수 · 구독 종료" : "전부 회수";
      openModal(`
        <div class="rf-done">
          <div class="rf-done-icon">✓</div>
          <h3>결제취소가 완료됐어요</h3>
          <p class="rf-done-sub">${data.pgSyncedOnly ? "카드사에서 이미 취소된 거래여서 우리 결제 기록과 이용 기간만 취소 처리했어요." : "카드 승인이 취소(환불)됐어요. 카드사에 따라 반영까지 영업일 기준 수일이 걸릴 수 있어요."}</p>
          <div class="rf-info">
            <div class="rf-row rf-strong"><span>취소 금액</span><b>${refunded.toLocaleString()}원</b></div>
            <div class="rf-row"><span>취소 후 남는 결제금액</span><b>${remain.toLocaleString()}원</b></div>
            <div class="rf-row"><span>이용 기간</span><b>${periodLabel}</b></div>
            <div class="rf-row"><span>사유</span><b>${escapeHtml(reason)}</b></div>
            <div class="rf-row rf-id"><span>결제번호</span><b>${escapeHtml(p.payment_id)}</b></div>
          </div>
          <div class="modal-actions"><button type="button" class="btn btn-primary" id="rfDoneBtn">확인</button></div>
        </div>
      `);
      afterCloseHook = opts.onDone ? () => opts.onDone(data) : null;
      document.getElementById("rfDoneBtn").addEventListener("click", closeModal);
    } catch (e) {
      toast("취소하지 못했어요: " + (e.message || e), true);
      btn.disabled = false;
      btn.textContent = "결제취소하기";
    }
  });
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 페이지 하나가 시작할 때 이것만 부르면 됨:
//   const { user, admin } = await guardAdminPage({ activeKey:'members', title:'회원관리', desc:'...' });
// 로그인 안 돼있거나 admins 문서가 없으면 자동으로 login.html로 돌려보낸다.
export function guardAdminPage(options) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      let adminSnap;
      try {
        adminSnap = await getDoc(doc(db, "admins", user.uid));
      } catch (e) {
        window.location.href = "login.html?error=denied";
        return;
      }
      if (!adminSnap.exists()) {
        await signOut(auth);
        window.location.href = "login.html?error=not_admin";
        return;
      }
      const adminData = adminSnap.data();
      if (options.requireSuperAdmin && adminData.role !== "superadmin") {
        window.location.href = "index.html?error=forbidden";
        return;
      }

      document.getElementById("adminRoot").innerHTML = renderShell(options.activeKey, adminData.role);
      document.getElementById("adminPageTitle").textContent = options.title || "";
      document.getElementById("adminPageDesc").textContent = options.desc || "";
      document.getElementById("adminWhoName").textContent = adminData.name || user.email;
      document.getElementById("adminWhoRole").textContent =
        adminData.role === "superadmin" ? "슈퍼관리자" : "관리자";
      document.getElementById("adminLogoutBtn").addEventListener("click", async () => {
        await adminLogout();
        window.location.href = "login.html";
      });
      document.getElementById("adminModalOverlay").addEventListener("click", (e) => {
        if (e.target.id === "adminModalOverlay") closeModal();
      });

      resolve({ user, admin: adminData, uid: user.uid, db, auth });
    });
  });
}
