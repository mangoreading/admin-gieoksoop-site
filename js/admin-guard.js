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

// 사이드바 메뉴 정의 — 새 화면을 추가할 땐 이 배열에 한 줄만 추가하면 된다.
const NAV_ITEMS = [
  { key: "dashboard", href: "index.html", label: "대시보드", icon: ICON_DASHBOARD },
  { key: "members", href: "members.html", label: "회원관리", icon: ICON_MEMBERS },
  { key: "payments", href: "payments.html", label: "구독결제 관리", icon: ICON_PAYMENTS },
  { key: "guides", href: "guides.html", label: "사용가이드 관리", icon: ICON_GUIDES },
  { key: "notices", href: "notices.html", label: "공지사항 관리", icon: ICON_NOTICES },
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

export function closeModal() {
  document.getElementById("adminModalOverlay").classList.remove("open");
  const modal = document.getElementById("adminModal");
  modal.innerHTML = "";
  modal.className = "modal";
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
  portone_cancel_failed: "카드사(포트원) 취소 요청이 실패했어요.",
};

export function canAdminRefund(p) {
  const status = p.status || "paid";
  return !!p.payment_id && (status === "paid" || status === "partial_refunded");
}

// p: payments 문서({id, payment_id, amount, refunded_amount, plan ...}).
// opts.onDone: 취소 성공 후 호출, opts.onBack: [닫기] 눌렀을 때 호출(없으면 모달 닫기).
export function openAdminRefundModal(p, opts = {}) {
  const total = Number(p.amount || 0);
  const already = Number(p.refunded_amount || 0);
  const cancellable = Math.max(0, total - already);
  const back = () => (opts.onBack ? opts.onBack() : closeModal());
  openModal(`
    <h3>결제취소</h3>
    <p class="form-hint">실제 카드 승인이 취소(환불)돼요. 되돌릴 수 없으니 금액을 꼭 확인해 주세요.</p>
    <p class="muted" style="font-size:13px;">결제금액 ${total.toLocaleString()}원 · 이미 취소 ${already.toLocaleString()}원 · 취소 가능 ${cancellable.toLocaleString()}원<br>결제번호 ${escapeHtml(p.payment_id)}</p>
    <div class="form-field"><label>취소 금액 (원)</label><input type="number" id="rfAmount" min="1" max="${cancellable}" value="${cancellable}"></div>
    <div class="form-field"><label>취소 사유 (필수)</label><input type="text" id="rfReason" placeholder="예: 고객 요청, 테스트 결제"></div>
    <div class="form-field"><label style="display:flex;gap:8px;align-items:center;"><input type="checkbox" id="rfEnd" checked> 이용 권한도 함께 종료 (구독 해지 + 자동결제 중단)</label></div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline" id="rfCancelBtn">닫기</button>
      <button type="button" class="btn btn-danger" id="rfConfirmBtn">결제취소하기</button>
    </div>
  `);
  document.getElementById("rfCancelBtn").addEventListener("click", back);
  document.getElementById("rfConfirmBtn").addEventListener("click", async () => {
    const amount = Number(document.getElementById("rfAmount").value);
    const reason = document.getElementById("rfReason").value.trim();
    const endAccess = document.getElementById("rfEnd").checked;
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
      const res = await fetch(ADMIN_REFUND_URL, {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: p.payment_id, amount, reason, endAccess }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const msg = REFUND_ERRORS[data.error] || data.error || "HTTP " + res.status;
        throw new Error(msg + (data.detail ? " (" + data.detail + ")" : ""));
      }
      toast(`${Number(data.refundedAmount).toLocaleString()}원 결제취소를 완료했어요.`);
      if (opts.onDone) opts.onDone(data);
      else closeModal();
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
