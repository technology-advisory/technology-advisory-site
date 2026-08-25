document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('menu-container');
  if (!root) return;

  const path = window.location.pathname;
  const depth = path.split('/').filter(segment => segment && !segment.endsWith('.html')).length;
  const base = depth ? '../'.repeat(depth) : '';

  let active = 'inicio';
  for (const key of ['arquitectura','seguridad','operaciones','gobernanza','referencias','tools','mi-enfoque','sobre-mi','legal']) {
    if (new RegExp(`/${key}(/|$)`).test(path)) { active = key; break; }
  }

  const groups = {
    arquitectura: {
      label:'Arquitectura', subtitle:'Fundamentos · dominios · prácticas', href:`${base}arquitectura/index.html`,
      columns:[
        ['Fundamentos', [['Principios y diseño','diseno-arquitectonico'], ['Alta disponibilidad','alta-disponibilidad'], ['Arquitectura de CPD','arquitectura-cpd']]],
        ['Dominios', [['Cloud híbrido','cloud-hibrido'], ['Redes','diseno-red'], ['Datos y almacenamiento','almacenamiento-datos']]],
        ['Prácticas', [['Infraestructura como código','infraestructura-codigo'], ['Virtualización y contenedores','virtualizacion-contenedores'], ['Capacidad y rendimiento','capacidad-rendimiento'], ['Active Directory','active-directory']]]
      ]
    },
    seguridad: {
      label:'Seguridad', subtitle:'Diseño · protección · respuesta', href:`${base}seguridad/index.html`,
      columns:[
        ['Fundamentos', [['Zero Trust','zero-trust'], ['Security by Design','security-design'], ['Auditoría y cumplimiento','iso-compliance']]],
        ['Protección', [['Firewalls y perímetro','firewalls-perimetro'], ['Cifrado e identidad digital','cifrado-identidad-digital'], ['Active Directory','active-directory']]],
        ['Operación', [['SIEM y detección','siem-deteccion'], ['Gestión de vulnerabilidades','gestion-vulnerabilidades'], ['Respuesta a incidentes','respuesta-incidentes']]]
      ]
    },
    operaciones: {
      label:'Operaciones', subtitle:'Operación · continuidad · evidencia', href:`${base}operaciones/index.html`,
      columns:[
        ['Operación', [['Automatización y orquestación','automatizacion-orquestacion'], ['Monitorización y observabilidad','monitorizacion-observabilidad'], ['Gestión de cambios','gestion-cambios']]],
        ['Continuidad', [['Continuidad de negocio','continuidad-negocio'], ['Backup y recuperación','backup-recuperacion'], ['Gestión de incidencias','gestion-incidencias']]],
        ['Control', [['Gobierno de identidades','gobierno-identidades'], ['Patch Management','patch-management'], ['Active Directory','active-directory']]]
      ]
    },
    gobernanza: {
      label:'Gobernanza', subtitle:'Riesgo · control · dirección', href:`${base}gobernanza/index.html`,
      columns:[
        ['Dirección', [['Riesgo tecnológico','riesgo-tecnologico'], ['Gobierno TI','gobierno-ti'], ['Gobierno de IA','gobierno-ia']]],
        ['Cumplimiento', [['Marcos regulatorios','marcos-regulatorios'], ['Políticas y normativa','politicas-normativa'], ['Auditoría y control interno','auditoria-control-interno']]],
        ['Ecosistema', [['Gestión de terceros','gestion-terceros'], ['Gobierno del dato','gobierno-dato'], ['Active Directory','active-directory']]]
      ]
    }
  };

  const tools = [
    ['Threat Intelligence','threat-intelligence/index.html','Consola unificada'],
    ['Vulnerabilidades','vulnerabilities/index.html','CISA KEV · EUVD · INCIBE-CERT'],
    ['Vendor Advisories','vendor-advisories/index.html','Microsoft · Cisco · Palo Alto · Fortinet · SonicWall · Ivanti'],
    ['Cloud Security','cloud-security/index.html','AWS · Google Cloud'],
    ['Vulnerability Intelligence','vulnerability-intelligence/index.html','CERT/CC · ZDI · Tenable'],
    ['CISA KEV','cisa-kev/index.html','Explotación conocida'],
    ['EUVD','euvd/index.html','European Vulnerability Database'],
    ['INCIBE-CERT','incibe-cert/index.html','Avisos nacionales'],
    ['Fortinet PSIRT','fortinet-psirt/index.html','Advisories Fortinet'],
    ['SonicWall PSIRT','sonicwall-psirt/index.html','Advisories SonicWall']
  ];

  const references = [
    ['Ver todas las referencias','index.html','Colección completa'],
    ['Microsegmentación Zero Trust','index.html#microsegmentacion-zero-trust','Redes seguras'],
    ['PAM + PAW','index.html#acceso-privilegiado-pam-paw','Identidad y privilegios'],
    ['Active Directory por tiers','index.html#active-directory-tier-model','Identity Hardening'],
    ['Segmentación de red corporativa','index.html#segmentacion-red-corporativa','LLD'],
    ['DMZ de doble capa','index.html#dmz-doble-capa','HLD'],
    ['Hub-Spoke híbrido','index.html#red-hibrida-hub-spoke','Cloud'],
    ['DevSecOps Shift-Left','index.html#pipeline-devsecops','CI/CD']
  ];

  function groupMarkup(key) {
    const g = groups[key];
    const cols = g.columns.map(([title,items]) => `
      <div class="ta-mega-col">
        <div class="ta-mega-label">${title}</div>
        ${items.map(([name,slug]) => `<a href="${g.href}?cat=${slug}" class="ta-mega-link">${name}</a>`).join('')}
      </div>`).join('');
    return `<details class="ta-nav-group${active===key?' active':''}" data-group="${key}">
      <summary>${g.label}<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></summary>
      <div class="ta-mega ta-mega-3">
        <div class="ta-mega-top"><div><strong>${g.label}</strong><span>${g.subtitle}</span></div><a href="${g.href}">Ver todos los artículos →</a></div>
        <div class="ta-mega-grid">${cols}</div>
      </div>
    </details>`;
  }

  function toolsMarkup() {
    return `<details class="ta-nav-group ta-tools-group${active==='tools'?' active':''}" data-group="tools">
      <summary>Tools<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></summary>
      <div class="ta-mega ta-tools-mega">
        <div class="ta-mega-top"><div><strong>Tools & Threat Intelligence</strong><span>Fuentes, advisories e inteligencia técnica</span></div><a href="${base}tools/index.html">Ver Tools →</a></div>
        <div class="ta-tools-grid">
          ${tools.map(([name,href,hint],i)=>`<a class="ta-tool-menu-item${i===0?' featured':''}" href="${base}tools/${href}"><span class="ta-tool-menu-code">${i===0?'TI':String(i).padStart(2,'0')}</span><span><b>${name}</b><small>${hint}</small></span></a>`).join('')}
        </div>
      </div>
    </details>`;
  }

  function referencesMarkup() {
    return `<details class="ta-nav-group${active==='referencias'?' active':''}" data-group="referencias">
      <summary>Referencias<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></summary>
      <div class="ta-mega ta-tools-mega">
        <div class="ta-mega-top"><div><strong>Arquitecturas de referencia</strong><span>Patrones comentados y colecciones seleccionadas</span></div><a href="${base}referencias/index.html">Abrir referencias →</a></div>
        <div class="ta-tools-grid">
          ${references.map(([name,href,hint],i)=>`<a class="ta-tool-menu-item${i===0?' featured':''}" href="${base}referencias/${href}"><span class="ta-tool-menu-code">${i===0?'REF':String(i).padStart(2,'0')}</span><span><b>${name}</b><small>${hint}</small></span></a>`).join('')}
        </div>
      </div>
    </details>`;
  }

  root.innerHTML = `<header class="ta-site-header"><div class="ta-site-header-inner">
    <a class="ta-brand" href="${base}index.html"><span class="ta-brand-mark">TA</span><span><b>Technology Advisory</b><small>Editorial Knowledge Hub</small></span></a>
    <nav class="ta-nav" aria-label="Navegación principal">
      <a class="ta-nav-link${active==='inicio'?' active':''}" href="${base}index.html">Inicio</a>
      <a class="ta-nav-link${active==='mi-enfoque'?' active':''}" href="${base}mi-enfoque/index.html">Mi enfoque</a>
      ${groupMarkup('arquitectura')}${groupMarkup('seguridad')}${groupMarkup('operaciones')}${groupMarkup('gobernanza')}
      ${referencesMarkup()}
      ${toolsMarkup()}
      <a class="ta-nav-link${active==='sobre-mi'?' active':''}" href="${base}sobre-mi/sobre-mi.html">Sobre mí</a>
      <a class="ta-nav-link ta-legal${active==='legal'?' active':''}" href="${base}legal/legal.html">Legal</a>
    </nav>
    <button class="ta-menu-button" type="button" aria-label="Abrir menú" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div></header>`;

  const nav = root.querySelector('.ta-nav');
  const button = root.querySelector('.ta-menu-button');
  const groupsEls = Array.from(root.querySelectorAll('.ta-nav-group'));

  const closeAll = (except = null) => {
    groupsEls.forEach(group => {
      if (group !== except) group.open = false;
    });
  };

  const closeMenu = () => {
    closeAll();
    nav.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
  };

  button?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) closeAll();
  });

  groupsEls.forEach(group => {
    const summary = group.querySelector('summary');
    summary?.addEventListener('click', () => {
      if (!group.open) closeAll(group);
    });
    group.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
  });

  root.querySelectorAll('.ta-nav-link').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('click', event => {
    if (!root.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
});
