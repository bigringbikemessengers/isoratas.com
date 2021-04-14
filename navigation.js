import scrollIntoView from 'scroll-into-view-if-needed';

const router = window.router = new Router;
var historyStateId = history.state && history.state.id ? history.state.id : 0;

window.addEventListener('DOMContentLoaded', event => {
  router.handleRouteChange();
  router.anchors.forEach(anchor => {
    const href = anchor.href;
    anchor.addEventListener('click', event => {
      event.preventDefault(); // prevent scrolling to the element
      historyStateId++;
      history.pushState({ id: historyStateId }, null, href);
      const page = router.handleRouteChange();
      if (page) {
        const firstTitle = page.querySelector('.card__title');
        if (firstTitle) {
          scrollIntoView(firstTitle, {
            behavior: 'smooth',
            scrollMode: 'if-needed',
            block: 'center',
            inline: 'center',
          });
        }
      }
      spinLogo({ forward: true });
      anchor.blur();
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
            : `.page`
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
      Array.prototype.forEach.call(
        page.querySelectorAll('[data-src]'),
        loadDataSrc
      )
    },
    handleRouteChange() {
      var displayedPage;
      this.allPages.forEach(page => {
        if (router.isCurrentRoute(page.route)) {
          displayedPage = displayedPage || page;
          router.displayPage(page);
        }
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
      return displayedPage;
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

// Set element[src] to the value from element[data-src].
// Use to load iframes, images, objects, only when they are needed.
function loadDataSrc(element) {
  if (element && element.dataset.src && !element.src)
    element.src = element.dataset.src;
}
