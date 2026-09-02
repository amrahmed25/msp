class Navbar extends HTMLElement {
    connectedCallback() {
        // تحويل المسار لحروف صغيرة لضمان المقارنة دائماً بغض النظر عن حالة الأحرف
        const isInsideHtmlFolder = window.location.pathname.toLowerCase().includes('/html/');

        const homePath = isInsideHtmlFolder ? '../index.html' : './index.html';
        const pagePath = isInsideHtmlFolder ? './' : './Html/';

        this.innerHTML = `
      <nav class="navbar">
        <a href="${homePath}">Home</a>
        <a href="${pagePath}about.html">About</a>
        <a href="${pagePath}category.html">Categories</a>
        <a href="${pagePath}feedback.html">Feedback</a>
        <a href="${pagePath}login.html">Login</a>
      </nav>
    `;
    }
}

customElements.define('nav-bar', Navbar);