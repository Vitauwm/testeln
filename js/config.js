// API do Google Apps Script Existente
window.API_URL = "https://script.google.com/macros/s/AKfycbzEkq5YoKl6MLx-fB8cJ1fflt7V4onrM-Plo9aq8bCDh5A4UZMxV8RpvwahnF1age_oMg/exec";

window.CATEGORIAS_ATIVIDADES = [
    'Ensino',
    'Pesquisa',
    'Extensão',
    'Reuniões',
    'Evento',
    'Divulgação',
    'Administrativo',
    'Projeto',
    'Outros'
];

window.ABAS_NAVEGACAO = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie', cargos: ['ADMINISTRADOR', 'GESTOR', 'FUNCIONARIO'] },
    { id: 'registrar', label: 'Registar Horas', icon: 'fa-solid fa-business-time', cargos: ['ADMINISTRADOR', 'GESTOR', 'FUNCIONARIO'] },
    { id: 'historico', label: 'Histórico', icon: 'fa-solid fa-clock-rotate-left', cargos: ['ADMINISTRADOR', 'GESTOR', 'FUNCIONARIO'] },
    { id: 'graficos', label: 'Gráficos & Análises', icon: 'fa-solid fa-chart-simple', cargos: ['ADMINISTRADOR', 'GESTOR'] },
    { id: 'aprovacoes', label: 'Aprovações da Direção', icon: 'fa-solid fa-shield-halved', cargos: ['ADMINISTRADOR', 'GESTOR'] },
    { id: 'relatorios', label: 'Relatórios', icon: 'fa-solid fa-file-invoice', cargos: ['ADMINISTRADOR', 'GESTOR'] },
    { id: 'membros', label: 'Membros', icon: 'fa-solid fa-users', cargos: ['ADMINISTRADOR'] }
];
