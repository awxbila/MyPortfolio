// Portfolio Toggle Logic (HTML version)
const btnBD = document.getElementById("btn-bd");
const btnSE = document.getElementById("btn-se");
const aboutBD = document.getElementById("about-bd");
const aboutSE = document.getElementById("about-se");
const skillsBD = document.getElementById("skills-bd");
const skillsSE = document.getElementById("skills-se");
const expBD = document.getElementById("experience-bd");
const expSE = document.getElementById("experience-se");

function setPortfolio(type) {
  if (type === "bd") {
    btnBD.classList.add("active");
    btnSE.classList.remove("active");
    if (aboutBD) aboutBD.style.display = "";
    if (aboutSE) aboutSE.style.display = "none";
    if (skillsBD) skillsBD.style.display = "";
    if (skillsSE) skillsSE.style.display = "none";
    if (expBD) expBD.style.display = "";
    if (expSE) expSE.style.display = "none";
  } else {
    btnSE.classList.add("active");
    btnBD.classList.remove("active");
    if (aboutBD) aboutBD.style.display = "none";
    if (aboutSE) aboutSE.style.display = "";
    if (skillsBD) skillsBD.style.display = "none";
    if (skillsSE) skillsSE.style.display = "";
    if (expBD) expBD.style.display = "none";
    if (expSE) expSE.style.display = "";
  }
}

if (btnBD && btnSE) {
  btnBD.addEventListener("click", () => setPortfolio("bd"));
  btnSE.addEventListener("click", () => setPortfolio("se"));
  setPortfolio("bd");
}
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  const body = document.body;

  menu.classList.toggle("active");

  //toggle menu buka tutup dan pengguliran body
  if (menu.classList.contains("active")) {
    body.classList.add("menu-open");
    body.classList.remove("menu-closed");
    const menuHeight = menu.scrollHeight;
    body.style.marginTop = `${menuHeight}px`;
  } else {
    body.classList.remove("menu-open");
    body.classList.add("menu-closed");
    body.style.marginTop = "0";
  }
}

// Auto close menu saat link diklik
document.querySelectorAll("#mobileMenu a").forEach((link) => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("mobileMenu");
    const body = document.body;

    menu.classList.remove("active");
    body.classList.remove("menu-open");
    body.classList.add("menu-closed");
    body.style.marginTop = "0";
  });
});
