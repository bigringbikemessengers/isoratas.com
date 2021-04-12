"use strict";

const router = window.router = new Router;
var historyStateId = history.state && history.state.id ? history.state.id : 0;
router.handleRouteChange();

window.addEventListener('load', event => {
  router.handleRouteChange();
})

window.addEventListener('hashchange', event => {
  console.log(event);
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

router.anchors.forEach(anchor => {
  const href = anchor.href;
  anchor.addEventListener('click', event => {
    historyStateId++;
    history.pushState({ id: historyStateId }, null, href);
    router.handleRouteChange();
    event.preventDefault(); // prevent scrolling
    spinLogo({ forward: true });
  })
})

function Router() {
  return {
    get nav() {
      return document
        .getElementsByTagName('nav')[0];
    },
    get anchors() {
      return Array.prototype.slice.call(
        this.nav
          .querySelectorAll('a[href]')
      ).concat(document.querySelector('header a'));
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
    },
    displayPage(page) {
      page.classList.remove('page--hidden');
      if (page.dataset.pageTitle)
        document.title = page.dataset.pageTitle;
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
    console.log('spin forward');
    logoClone.classList.add('header__logo--spin-forward');
  }
  if (options.backward && !options.forward) {
    console.log('spin backward');    
    logoClone.classList.add('header__logo--spin-backward');
  }  
  logo.parentNode.replaceChild(logoClone, logo);
}
