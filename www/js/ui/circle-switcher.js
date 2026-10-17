/**
 * Circle Switcher & Header UI Component
 * Handles switching between isolated friend circles and switching active test user
 */
export class CircleSwitcherComponent {
  constructor({ container, onCircleChange, onMemberSwitch, onNewCircle }) {
    this.container = container;
    this.onCircleChange = onCircleChange;
    this.onMemberSwitch = onMemberSwitch;
    this.onNewCircle = onNewCircle;
  }

  render({ circles, activeCircleId, profiles, currentUserId }) {
    const activeCircle = circles.find(c => c.id === activeCircleId) || circles[0];
    const currentUser = profiles.find(p => p.id === currentUserId) || profiles[0];

    this.container.innerHTML = `
      <div class="relative">
        <select id="circle-select-dropdown" class="appearance-none bg-slate-800/90 text-white font-bold text-sm py-1.5 pl-3 pr-7 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer">
          ${circles.map(c => `
            <option value="${c.id}" ${c.id === activeCircle.id ? 'selected' : ''}>
              ${c.emoji} ${c.name}
            </option>
          `).join('')}
        </select>
        <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
      </div>
    `;

    const userPill = document.getElementById('user-avatar-pill');
    if (userPill) {
      userPill.innerHTML = `
        <img src="${currentUser.avatar}" alt="${currentUser.name}" class="w-5 h-5 rounded-full object-cover">
        <select id="user-switch-dropdown" class="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer">
          ${profiles.map(p => `
            <option value="${p.id}" ${p.id === currentUserId ? 'selected' : ''} class="bg-slate-800 text-white">
              ${p.name.split(' ')[0]}
            </option>
          `).join('')}
        </select>
      `;

      const userSelect = userPill.querySelector('#user-switch-dropdown');
      userSelect.addEventListener('change', (e) => {
        this.onMemberSwitch(e.target.value);
      });
    }

    const select = this.container.querySelector('#circle-select-dropdown');
    select.addEventListener('change', (e) => {
      this.onCircleChange(e.target.value);
    });
  }
}
