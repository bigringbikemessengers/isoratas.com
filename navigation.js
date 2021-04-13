"use strict";

const router = window.router = new Router;
var historyStateId = history.state && history.state.id ? history.state.id : 0;

window.addEventListener('DOMContentLoaded', event => {
  router.handleRouteChange();
  router.anchors.forEach(anchor => {
    const href = anchor.href;
    anchor.addEventListener('click', event => {
      event.preventDefault(); // prevent scrolling
      historyStateId++;
      history.pushState({ id: historyStateId }, null, href);
      router.handleRouteChange();
      spinLogo({ forward: true });
    })
  })
})

window.addEventListener('hashchange', event => {
  router.handleRouteChange();
})

window.addEventListener('popstate', event => {
  const historyState = event.state;
  if (historyState) {
    if (historyState.id > historyStateId)
      spinLogo({ forward: true });
    else if (historyState.id <= historyStateId)
      spinLogo({ backward: true })
    historyStateId = historyState.id;
  }
})

function Router() {
  return {
    get anchors() {
      const routes = this.allPages.map(page => page.route);
      return Array.prototype.slice.call(
        document.querySelectorAll('a[href]')
      ).filter(anchor => routes.indexOf(this.anchorRoute(anchor)) >= 0);
    },
    anchorRoute(anchor) {
      if (!anchor.href) return;
      const hash = anchor.href.split('#').slice(-1)[0];
      if (!hash) return;
      const route = decodeURIComponent(hash.replace('#', ''));
      return route;
    },
    get routes() {
      return this.anchors
        .map(this.anchorRoute)
        .filter(s => s)
    },
    get currentRoute() {
      const hash = decodeURIComponent(window.location.hash);
      return hash.replace('#', '');
    },
    isCurrentRoute(route) {
      return route === this.currentRoute;
    },
    get allPages() {
      return this.routePages()
    },
    routePages(route) {
      return Array.prototype.slice.call(
        document.querySelectorAll(
          route !== undefined
            ? `.page[id=${route}]`
            : `.page[id]`
        )
      ).map(page => {
        page.route = page.id;
        return page;
      })
    },
    hidePage(page) {
      page.classList.add('page--hidden');
      page.classList.remove('page--displayed');
    },
    displayPage(page) {
      page.classList.remove('page--hidden');
      page.classList.add('page--displayed');
      if (page.dataset.pageTitle)
        document.title = page.dataset.pageTitle;
      if (page.matches('.prices'))
        addGoogleMapsInlineFrame(page.querySelector('.zones-map'));
      if (page.matches('.contact'))
        addGoogleFormsInlineFrame(page.querySelector('.contact-form'));
    },
    handleRouteChange() {
      router.routePages().forEach(page => {
        if (router.isCurrentRoute(page.route))
          router.displayPage(page);
        else
          router.hidePage(page);
      });
      this.anchors.forEach(anchor => {
        const route = this.anchorRoute(anchor);
        if (this.isCurrentRoute(route))
          anchor.classList.add('current');
        else
          anchor.classList.remove('current');
      })
    }
  }
}

function spinLogo(options = {}) {
  const logo = document.querySelector('.header__logo');
  const logoClone = logo.cloneNode(true);
  logoClone.classList.remove('header__logo--spin');
  logoClone.classList.remove('header__logo--spin-forward');
  logoClone.classList.remove('header__logo--spin-backward');
  if (!options.backward) {
    logoClone.classList.add('header__logo--spin-forward');
  }
  if (options.backward && !options.forward) {
    logoClone.classList.add('header__logo--spin-backward');
  }
  logo.parentNode.replaceChild(logoClone, logo);
}

function addGoogleMapsInlineFrame(element) {
  if (!element.querySelector('iframe')) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', "allow-scripts");
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('aria-label', "Vyöhykkeet kartta");
    iframe.setAttribute('src', 'https://www.google.com/maps/d/embed?mid=1ZrmW-kxq4VK-ND9Hj6kWlcuD3-z18mBB');
    iframe.setAttribute('allowfullscreen', 'true');
    element.appendChild(iframe);
  }
}

function addGoogleFormsInlineFrame(element) {
  if (!element.querySelector('iframe')) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('aria-label', "Google Forms, Yhteydenotto");
    iframe.setAttribute('src', "https://docs.google.com/forms/d/e/1FAIpQLSeonJv0GJ3N90DfdGjhBoOlpKg1vMzpJu9Nhf-qhnDTTPu-Ew/viewform?embedded, true");
    iframe.setAttribute('allowfullscreen', "");
    element.appendChild(iframe);
  }
}
