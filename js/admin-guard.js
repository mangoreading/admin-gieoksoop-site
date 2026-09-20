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

// 사이드바 메뉴 정의 — 새 화면을 추가할 땐 이 배열에 한 줄만 추가하면 된다.
const NAV_ITEMS = [
  { key: "dashboard", href: "index.html", label: "대시보드", icon: "▣" },
  { key: "members", href: "members.html", label: "회원관리", icon: "▤" },
  { key: "payments", href: "payments.html", label: "결제관리", icon: "◈" },
  { key: "guides", href: "guides.html", label: "가이드 관리", icon: "▦" },
  { key: "notices", href: "notices.html", label: "공지사항 관리", icon: "▥" },
  { key: "admins", href: "admins.html", label: "관리자 계정", icon: "◉", superadminOnly: true },
  { key: "settings", href: "settings.html", label: "시스템 설정", icon: "⚙", superadminOnly: true },
];

function renderShell(activeKey, role) {
  const nav = NAV_ITEMS.filter((item) => !item.superadminOnly || role === "superadmin")
    .map(
      (item) =>
        `<a href="${item.href}" class="${item.key === activeKey ? "active" : ""}"><span>${item.icon}</span>${item.label}</a>`
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

export function openModal(html) {
  document.getElementById("adminModal").innerHTML = html;
  document.getElementById("adminModalOverlay").classList.add("open");
}

export function closeModal() {
  document.getElementById("adminModalOverlay").classList.remove("open");
  document.getElementById("adminModal").innerHTML = "";
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
