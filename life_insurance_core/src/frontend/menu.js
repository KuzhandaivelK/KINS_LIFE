document.addEventListener('DOMContentLoaded', () => {
  // 1. Session & Authentication Handling
  const rawUser = sessionStorage.getItem('kinsure_user');
  let user = { username: 'admin', userGroup: 'Data_entry' };

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch (_) {}
  } else {
    // If opened directly without login in development, seed with default admin or redirect
    user = { username: 'admin', userGroup: 'Data_entry' };
    sessionStorage.setItem('kinsure_user', JSON.stringify(user));
  }

  const username = user.username || user.userId || 'admin';
  const userGroup = user.userGroup || 'Data_entry';

  // Update DOM user details
  document.getElementById('sidebarUsername').textContent = username;
  document.getElementById('sidebarUserGroup').textContent = userGroup;
  document.getElementById('sidebarAvatar').textContent = username.charAt(0).toUpperCase();
  document.getElementById('headerUsername').textContent = `${username} [${userGroup}]`;
  document.getElementById('heroGreeting').textContent = `Welcome back, ${username}`;
  document.getElementById('telemetryUser').textContent = `${username} [${userGroup}]`;

  // 2. Live System Clock
  function updateLiveClock() {
    const now = new Date();
    document.getElementById('liveClock').textContent = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // 3. Sign Out Handlers
  function handleSignOut() {
    if (confirm('Sign out from Kinsure+ Life Insurance Core?')) {
      sessionStorage.removeItem('kinsure_user');
      window.location.href = 'index.html';
    }
  }
  document.getElementById('sidebarLogoutBtn').addEventListener('click', handleSignOut);
  document.getElementById('headerLogoutBtn').addEventListener('click', handleSignOut);

  // 4. Sidebar Collapse Toggle
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // 5. Menu Icons & Descriptions Mapping
  const moduleMeta = {
    M001: {
      color: '#6366f1',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      desc: 'Define life plans, mortality charges, riders, underwriting tables, and customer profiles.'
    },
    M002: {
      color: '#10b981',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
      desc: 'New proposal registrations, policy issuance, policyholder endorsements, and premium collections.'
    },
    M003: {
      color: '#f59e0b',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
      desc: 'Financial registers, policy valuation statements, commission summaries, and regulatory filings.'
    },
    M004: {
      color: '#a855f7',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      desc: 'Scheduled automated batch jobs, electronic auto-debits, policy lapse identification, and maturity schedule.'
    },
    M005: {
      color: '#f43f5e',
      iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      desc: 'Core user management (MTB_USERS), role group assignments, security policies, and audit logs.'
    }
  };

  const defaultMeta = {
    color: '#38bdf8',
    iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    desc: 'Life insurance core operational system module.'
  };

  let menuHierarchy = [];
  const accordionContainer = document.getElementById('dynamicMenuAccordion');
  const showcaseGrid = document.getElementById('modulesShowcaseGrid');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const menuTreeCount = document.getElementById('menuTreeCount');
  const moduleFilterInput = document.getElementById('moduleFilterInput');

  // 6. Fetch Menus from Microservice API
  async function loadMenuData() {
    try {
      const endpoint = window.location.port === '3001' ? 'http://localhost:3000/api/menus' : '/api/menus';
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok && data.success) {
        menuHierarchy = data.menuTree || [];
        menuTreeCount.textContent = `${data.totalCount || menuHierarchy.length} Items`;
        renderSidebarAccordion(menuHierarchy);
        renderShowcaseGrid(menuHierarchy);
      } else {
        throw new Error(data.message || 'Failed to query MTB_MENUS');
      }
    } catch (err) {
      console.error('Menu load error:', err);
      accordionContainer.innerHTML = `
        <div style="padding: 14px; font-size: 0.78rem; color: #f87171; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
          Failed to load menus from MTB_MENUS: ${err.message}
        </div>
      `;
    }
  }

  // 7. Render Hierarchical Accordion in Sidebar
  function renderSidebarAccordion(tree) {
    accordionContainer.innerHTML = '';

    tree.forEach((menu) => {
      const meta = moduleMeta[menu.MENU_ID] || defaultMeta;
      const group = document.createElement('div');
      group.className = 'menu-group';
      group.id = `group-${menu.MENU_ID}`;

      const subMenus = menu.subMenus || [];
      const hasChildren = subMenus.length > 0;

      // Parent Item Header
      const header = document.createElement('div');
      header.className = 'menu-header-item';
      header.innerHTML = `
        <div class="menu-header-left">
          <div class="menu-icon" style="color: ${meta.color}">
            ${meta.iconSvg}
          </div>
          <span class="nav-label">${menu.MENU_DISP_NAME || menu.MENU_NAME}</span>
        </div>
        <div class="menu-header-right">
          ${hasChildren ? `<span class="sub-count-pill">${subMenus.length}</span>` : ''}
          <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      `;

      // Submenu Drawer Container (Future-Proof: supports any submenus in MTB_MENUS)
      const subDrawer = document.createElement('div');
      subDrawer.className = 'sub-menu-tree';

      if (hasChildren) {
        subMenus.forEach((child) => {
          const subItem = document.createElement('div');
          subItem.className = 'sub-nav-item';
          subItem.innerHTML = `
            <span>${child.MENU_DISP_NAME || child.MENU_NAME}</span>
          `;

          subItem.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.sub-nav-item').forEach((el) => el.classList.remove('active-sub'));
            subItem.classList.add('active-sub');
            breadcrumbCurrent.textContent = `${menu.MENU_DISP_NAME || menu.MENU_NAME} / ${child.MENU_DISP_NAME || child.MENU_NAME}`;
          });

          subDrawer.appendChild(subItem);
        });
      } else {
        // If no submenus yet, clicking parent marks active
        const emptyNotice = document.createElement('div');
        emptyNotice.className = 'sub-nav-item';
        emptyNotice.style.fontSize = '0.75rem';
        emptyNotice.style.color = 'var(--text-muted)';
        emptyNotice.textContent = `Launch ${menu.MENU_DISP_NAME}`;
        emptyNotice.addEventListener('click', () => {
          breadcrumbCurrent.textContent = `${menu.MENU_DISP_NAME || menu.MENU_NAME}`;
        });
        subDrawer.appendChild(emptyNotice);
      }

      // Accordion Click Toggle
      header.addEventListener('click', () => {
        const isExpanded = header.classList.contains('expanded');

        // Optional: close other accordions
        document.querySelectorAll('.menu-header-item').forEach((h) => {
          if (h !== header) {
            h.classList.remove('expanded');
            if (h.nextElementSibling) h.nextElementSibling.classList.remove('open');
          }
        });

        if (isExpanded) {
          header.classList.remove('expanded');
          subDrawer.classList.remove('open');
        } else {
          header.classList.add('expanded');
          subDrawer.classList.add('open');
          breadcrumbCurrent.textContent = `${menu.MENU_DISP_NAME || menu.MENU_NAME}`;
        }
      });

      group.appendChild(header);
      group.appendChild(subDrawer);
      accordionContainer.appendChild(group);
    });
  }

  // 8. Render Showcase Grid on Dashboard
  function renderShowcaseGrid(tree) {
    showcaseGrid.innerHTML = '';

    tree.forEach((menu) => {
      const meta = moduleMeta[menu.MENU_ID] || defaultMeta;
      const subMenus = menu.subMenus || [];
      const tile = document.createElement('div');
      tile.className = 'module-card-tile';
      tile.style.setProperty('--tile-color', meta.color);

      // Submenu tags preview
      let subChipsHtml = '';
      if (subMenus.length > 0) {
        subChipsHtml = subMenus
          .map((s) => `<span class="sub-chip">${s.MENU_DISP_NAME || s.MENU_NAME}</span>`)
          .join('');
      } else {
        subChipsHtml = `<span class="sub-chip" style="opacity: 0.6;">Ready for configuration</span>`;
      }

      tile.innerHTML = `
        <div>
          <div class="tile-top">
            <span class="tile-id">${menu.MENU_ID}</span>
            <span class="tile-seq">Sequence #${menu.MENU_SEQ_NO}</span>
          </div>
          <h3 class="tile-name">${menu.MENU_DISP_NAME || menu.MENU_NAME}</h3>
          <p class="tile-desc">${meta.desc}</p>
          <div class="submodules-preview">
            ${subChipsHtml}
          </div>
        </div>

        <div class="tile-footer">
          <span>${subMenus.length > 0 ? `${subMenus.length} Submodules Configured` : 'Core Module'}</span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span>Open in Menu</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        </div>
      `;

      // Clicking tile expands the corresponding accordion in the sidebar
      tile.addEventListener('click', () => {
        const groupHeader = document.querySelector(`#group-${menu.MENU_ID} .menu-header-item`);
        if (groupHeader) {
          if (!groupHeader.classList.contains('expanded')) {
            groupHeader.click();
          }
          groupHeader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      showcaseGrid.appendChild(tile);
    });
  }

  // 9. Dashboard Filter
  if (moduleFilterInput) {
    moduleFilterInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = menuHierarchy.filter((m) => {
        const name = (m.MENU_NAME || '').toLowerCase();
        const disp = (m.MENU_DISP_NAME || '').toLowerCase();
        const id = (m.MENU_ID || '').toLowerCase();
        const childMatch = (m.subMenus || []).some((c) =>
          (c.MENU_NAME || '').toLowerCase().includes(term) || (c.MENU_DISP_NAME || '').toLowerCase().includes(term)
        );
        return name.includes(term) || disp.includes(term) || id.includes(term) || childMatch;
      });
      renderShowcaseGrid(filtered);
    });
  }

  // 10. Dashboard Refresh Button
  const refreshBtn = document.getElementById('btnRefreshData');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.style.opacity = '0.5';
      loadMenuData().finally(() => {
        setTimeout(() => (refreshBtn.style.opacity = '1'), 500);
      });
    });
  }

  // 11. New Proposal Quick Button
  const newPropBtn = document.getElementById('btnQuickProposal');
  if (newPropBtn) {
    newPropBtn.addEventListener('click', () => {
      alert('Redirecting to Proposal Registration module (M002 Transactions)...');
      const transHeader = document.querySelector('#group-M002 .menu-header-item');
      if (transHeader) transHeader.click();
    });
  }

  // Initialize
  loadMenuData();
});
