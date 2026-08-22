const { createApp, ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

const app = createApp({
    components: {
        'login-view': window.LoginViewComponent,
        'app-sidebar': window.SidebarComponent,
        'app-header': window.HeaderComponent,
        'dashboard-view': window.DashboardViewComponent,
        'graficos-view': window.GraficosViewComponent,
        'projetos-categorias-view': window.ProjetosCategoriasViewComponent,
        'registrar-view': window.RegistrarViewComponent,
        'membros-view': window.MembrosViewComponent,
        'historico-view': window.HistoricoViewComponent,
        'relatorios-view': window.RelatoriosViewComponent,
        'modal-membro': window.ModalMembroComponent,
        'modal-editar-registro': window.ModalEditarRegistroComponent
    },
    setup() {
        const usuarioAutenticado = ref(false);
        const tokenSessao = ref(sessionStorage.getItem('lainova_session_token') || '');
        const usuarioAtual = ref({ login: '', nome: '', cargo: '', id: '' });
        const carregandoLogin = ref(false);
        const mensagemErroLogin = ref('');

        const abas = ref(window.ABAS_NAVEGACAO);
        const abaAtual = ref('dashboard');
        const menuMobileAberto = ref(false);
        const carregandoDados = ref(false);
        const enviandoRegistro = ref(false);
        const enviandoMembro = ref(false);
        const carregandoProjetosCategorias = ref(false);
        const modalMembroAberto = ref(false);

        // Modal de Edição de Registro
        const modalEdicaoAberto = ref(false);
        const registroParaEdicao = ref({});
        const enviandoEdicao = ref(false);

        // Relógio e Data
        const dataAtualObj = ref(new Date());
        let intervalRelogio;
        const horaFormatada = computed(() => dataAtualObj.value.toLocaleTimeString('pt-PT'));
        const dataFormatada = computed(() => new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dataAtualObj.value));

        // Dados da Aplicação
        const membros = ref([]);
        const registros = ref([]);
        const projetos = ref(['Atividade']);
        const categorias = ref(['Ensino', 'Pesquisa', 'Extensão', 'Reuniões', 'Evento', 'Divulgação', 'Administrativo', 'Projeto', 'Outros']);

        const podeEditarExcluir = computed(() => {
            return usuarioAtual.value.cargo === 'ADMINISTRADOR' || usuarioAtual.value.cargo === 'GESTOR';
        });

        const chamarBackend = async (payload) => {
            const res = await fetch(window.API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.sessaoInvalida) {
                fazerLogout();
                throw new Error("Sessão expirada. Por favor, inicie sessão novamente.");
            }
            if (data.sucesso === false && data.erro) {
                throw new Error(data.erro);
            }
            return data;
        };

        const fazerLogin = async ({ login, senha }) => {
            carregandoLogin.value = true;
            mensagemErroLogin.value = '';
            try {
                const res = await chamarBackend({ acao: 'login', login, senha });
                tokenSessao.value = res.token;
                sessionStorage.setItem('lainova_session_token', res.token);
                usuarioAtual.value = { login: res.login, nome: res.nome, cargo: res.cargo, id: res.id || '' };
                usuarioAutenticado.value = true;
                abaAtual.value = 'dashboard';
                await fetchDados();
            } catch (err) {
                mensagemErroLogin.value = err.message || 'Login ou senha inválidos.';
            } finally {
                carregandoLogin.value = false;
            }
        };

        const fazerLogout = async () => {
            if (tokenSessao.value) {
                try {
                    await fetch(window.API_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({ acao: 'logout', token: tokenSessao.value })
                    });
                } catch (e) { /* ignore */ }
            }
            tokenSessao.value = '';
            sessionStorage.removeItem('lainova_session_token');
            usuarioAutenticado.value = false;
            usuarioAtual.value = { login: '', nome: '', cargo: '', id: '' };
            membros.value = [];
            registros.value = [];
        };

        const verificarSessaoInicial = async () => {
            if (!tokenSessao.value) return;
            carregandoDados.value = true;
            try {
                const res = await chamarBackend({ acao: 'validarSessao', token: tokenSessao.value });
                usuarioAtual.value = { login: res.login, nome: res.nome, cargo: res.cargo, id: res.id || '' };
                usuarioAutenticado.value = true;
                await fetchDados();
            } catch (err) {
                fazerLogout();
            } finally {
                carregandoDados.value = false;
            }
        };

        const fetchDados = async () => {
            if (!usuarioAutenticado.value || !tokenSessao.value) return;
            carregandoDados.value = true;
            try {
                const data = await chamarBackend({ acao: 'obterDados', token: tokenSessao.value });
                membros.value = data.membros || [];
                registros.value = data.registros || [];
                if (data.projetos && data.projetos.length > 0) projetos.value = data.projetos;
                if (data.categorias && data.categorias.length > 0) categorias.value = data.categorias;
                
                if (abaAtual.value === 'graficos') nextTick(() => renderizarGraficos());
                if (abaAtual.value === 'relatorios') nextTick(() => renderizarGraficosRelatorio());
            } catch (e) {
                console.error("Erro ao obter dados:", e);
            } finally {
                carregandoDados.value = false;
            }
        };

        const totalHorasGeral = computed(() => {
            return registros.value.reduce((acc, curr) => acc + (parseFloat(curr.Horas_Gastas) || 0), 0).toFixed(1);
        });

        const totalLancamentos = computed(() => registros.value.length);

        const acumuladoMembros = computed(() => {
            return membros.value.map(m => {
                const regsMembro = registros.value.filter(r => (r.Nome_Membro === m.nome || r.Login_Membro === m.login));
                const totalHoras = regsMembro.reduce((acc, curr) => acc + (parseFloat(curr.Horas_Gastas) || 0), 0).toFixed(1);
                return { nome: m.nome, login: m.login, cargo: m.cargo, totalHoras, totalAtividades: regsMembro.length };
            }).sort((a,b) => parseFloat(b.totalHoras) - parseFloat(a.totalHoras));
        });

        const mudarAba = (idAba) => {
            abaAtual.value = idAba;
            menuMobileAberto.value = false;
            if (idAba === 'graficos') nextTick(() => renderizarGraficos());
            if (idAba === 'relatorios') nextTick(() => renderizarGraficosRelatorio());
        };

        const formatarDataSheet = (dataStr) => {
            if (!dataStr) return '';
            const str = String(dataStr).trim();
            if (str.includes('T')) {
                const [ano, mes, dia] = str.split('T')[0].split('-');
                return `${dia}/${mes}/${ano}`;
            }
            if (str.includes('-') && str.split('-')[0].length === 4) {
                const [ano, mes, dia] = str.split('-');
                return `${dia}/${mes}/${ano}`;
            }
            return str;
        };

        const parseDateToTime = (dStr) => {
            if(!dStr) return 0;
            let iso = String(dStr).trim();
            if(iso.includes('/')) {
                const parts = iso.split('/');
                iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            if(iso.includes('T')) iso = iso.split('T')[0];
            return new Date(iso + 'T00:00:00').getTime();
        };

        // Gerenciamento de Edição e Exclusão de Registros de Horas
        const abrirEdicaoRegistro = (reg) => {
            registroParaEdicao.value = { ...reg };
            modalEdicaoAberto.value = true;
        };

        const salvarEdicaoRegistro = async (dadosAtualizados) => {
            enviandoEdicao.value = true;
            try {
                await chamarBackend({
                    acao: 'editarRegistro',
                    token: tokenSessao.value,
                    ...dadosAtualizados
                });
                modalEdicaoAberto.value = false;
                await fetchDados();
                alert('Lançamento atualizado com sucesso!');
            } catch (e) {
                alert('Erro ao editar lançamento: ' + e.message);
            } finally {
                enviandoEdicao.value = false;
            }
        };

        const excluirRegistro = async (idRegistro) => {
            if (!confirm(`Deseja realmente eliminar o lançamento ID ${idRegistro}?`)) return;
            carregandoDados.value = true;
            try {
                await chamarBackend({
                    acao: 'excluirRegistro',
                    token: tokenSessao.value,
                    idRegistro
                });
                await fetchDados();
                alert('Lançamento removido com sucesso!');
            } catch (e) {
                alert('Erro ao excluir lançamento: ' + e.message);
                carregandoDados.value = false;
            }
        };

        // Gerenciamento de Projetos e Categorias
        const adicionarProjeto = async (nomeProjeto) => {
            carregandoProjetosCategorias.value = true;
            try {
                await chamarBackend({ acao: 'adicionarProjeto', token: tokenSessao.value, nome: nomeProjeto });
                await fetchDados();
                alert(`Projeto "${nomeProjeto}" adicionado com sucesso!`);
            } catch (e) {
                alert("Erro ao adicionar projeto: " + e.message);
            } finally {
                carregandoProjetosCategorias.value = false;
            }
        };

        const excluirProjeto = async (nomeProjeto) => {
            if (!confirm(`Deseja realmente remover o projeto "${nomeProjeto}"?`)) return;
            carregandoProjetosCategorias.value = true;
            try {
                await chamarBackend({ acao: 'excluirProjeto', token: tokenSessao.value, nome: nomeProjeto });
                await fetchDados();
            } catch (e) {
                alert("Erro ao remover projeto: " + e.message);
            } finally {
                carregandoProjetosCategorias.value = false;
            }
        };

        const adicionarCategoria = async (nomeCategoria) => {
            carregandoProjetosCategorias.value = true;
            try {
                await chamarBackend({ acao: 'adicionarCategoria', token: tokenSessao.value, nome: nomeCategoria });
                await fetchDados();
                alert(`Categoria "${nomeCategoria}" adicionada com sucesso!`);
            } catch (e) {
                alert("Erro ao adicionar categoria: " + e.message);
            } finally {
                carregandoProjetosCategorias.value = false;
            }
        };

        const excluirCategoria = async (nomeCategoria) => {
            if (!confirm(`Deseja realmente remover a categoria "${nomeCategoria}"?`)) return;
            carregandoProjetosCategorias.value = true;
            try {
                await chamarBackend({ acao: 'excluirCategoria', token: tokenSessao.value, nome: nomeCategoria });
                await fetchDados();
            } catch (e) {
                alert("Erro ao remover categoria: " + e.message);
            } finally {
                carregandoProjetosCategorias.value = false;
            }
        };

        // Relatórios
        const filtroRelatorio = ref({ inicio: '', fim: '', membro: '' });
        let chartRelRankingInstance = null;
        let chartRelCategoriaInstance = null;

        const aplicarFiltroRapido = (tipo) => {
            const hoje = new Date();
            filtroRelatorio.value.membro = '';
            
            if (tipo === 'mes') {
                const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                filtroRelatorio.value.inicio = primeiroDia.toISOString().split('T')[0];
                filtroRelatorio.value.fim = ultimoDia.toISOString().split('T')[0];
            } else if (tipo === 'semestre') {
                const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
                filtroRelatorio.value.inicio = seisMesesAtras.toISOString().split('T')[0];
                filtroRelatorio.value.fim = hoje.toISOString().split('T')[0];
            } else if (tipo === 'ano') {
                const primeiroDia = new Date(hoje.getFullYear(), 0, 1);
                filtroRelatorio.value.inicio = primeiroDia.toISOString().split('T')[0];
                filtroRelatorio.value.fim = hoje.toISOString().split('T')[0];
            } else if (tipo === 'tudo') {
                filtroRelatorio.value.inicio = '';
                filtroRelatorio.value.fim = '';
            }
        };

        const registrosRelatorio = computed(() => {
            const inicioTime = filtroRelatorio.value.inicio ? parseDateToTime(filtroRelatorio.value.inicio) : 0;
            const fimTime = filtroRelatorio.value.fim ? parseDateToTime(filtroRelatorio.value.fim) : Infinity;
            
            return registros.value.filter(r => {
                const rTime = parseDateToTime(r.Data);
                const noPeriodo = (!inicioTime || rTime >= inicioTime) && (!fimTime || rTime <= fimTime);
                const matchMembro = filtroRelatorio.value.membro ? r.Nome_Membro === filtroRelatorio.value.membro : true;
                return noPeriodo && matchMembro;
            });
        });

        const registrosRelatorioOrdenados = computed(() => {
            return [...registrosRelatorio.value].sort((a,b) => parseDateToTime(b.Data) - parseDateToTime(a.Data));
        });

        const periodoRelatorioTexto = computed(() => {
            if(!filtroRelatorio.value.inicio && !filtroRelatorio.value.fim) return "Todo o Histórico";
            const i = filtroRelatorio.value.inicio ? formatarDataSheet(filtroRelatorio.value.inicio) : 'Início';
            const f = filtroRelatorio.value.fim ? formatarDataSheet(filtroRelatorio.value.fim) : 'Hoje';
            return `${i} a ${f}`;
        });

        const kpisRelatorio = computed(() => {
            const regs = registrosRelatorio.value;
            let totalHoras = 0;
            const membrosCount = {};
            
            regs.forEach(r => {
                const h = parseFloat(r.Horas_Gastas) || 0;
                totalHoras += h;
                membrosCount[r.Nome_Membro] = (membrosCount[r.Nome_Membro] || 0) + h;
            });

            let membroDestaque = '';
            let maxHoras = 0;
            for (const [nome, h] of Object.entries(membrosCount)) {
                if (h > maxHoras) { maxHoras = h; membroDestaque = nome; }
            }

            const mediaPorAtiv = regs.length > 0 ? (totalHoras / regs.length).toFixed(1) : 0;

            return {
                totalHoras: totalHoras.toFixed(1),
                totalAtividades: regs.length,
                mediaHorasPorAtividade: mediaPorAtiv,
                membroDestaque: membroDestaque
            };
        });

        const rankingRelatorio = computed(() => {
            const mapa = {};
            registrosRelatorio.value.forEach(r => {
                if(!mapa[r.Nome_Membro]) mapa[r.Nome_Membro] = { nome: r.Nome_Membro, horas: 0, atividades: 0 };
                mapa[r.Nome_Membro].horas += (parseFloat(r.Horas_Gastas) || 0);
                mapa[r.Nome_Membro].atividades += 1;
            });
            return Object.values(mapa)
                .map(m => ({ ...m, horas: parseFloat(m.horas.toFixed(1)) }))
                .sort((a, b) => b.horas - a.horas);
        });

        const renderizarGraficosRelatorio = () => {
            const ctxRank = document.getElementById('chartRelRanking');
            const ctxCat = document.getElementById('chartRelCategoria');
            if (!ctxRank || !ctxCat) return;

            Chart.defaults.font.family = "'Inter', sans-serif";

            const rankData = rankingRelatorio.value.slice(0, 10); 
            if (chartRelRankingInstance) chartRelRankingInstance.destroy();
            chartRelRankingInstance = new Chart(ctxRank, {
                type: 'bar',
                data: {
                    labels: rankData.map(d => (d.nome || '').split(' ')[0]),
                    datasets: [{
                        label: 'Horas Registadas',
                        data: rankData.map(d => d.horas),
                        backgroundColor: '#10b981',
                        borderRadius: 6,
                        barPercentage: 0.6
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] } }, x: { grid: { display: false } } }
                }
            });

            const catMap = {};
            registrosRelatorio.value.forEach(r => {
                const c = r.Categoria || 'Outros';
                catMap[c] = (catMap[c] || 0) + (parseFloat(r.Horas_Gastas) || 0);
            });
            
            if (chartRelCategoriaInstance) chartRelCategoriaInstance.destroy();
            chartRelCategoriaInstance = new Chart(ctxCat, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catMap),
                    datasets: [{
                        data: Object.values(catMap),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e', '#0ea5e9'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { 
                        legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } 
                    },
                    cutout: '65%'
                }
            });
        };

        watch(registrosRelatorio, () => {
            if(abaAtual.value === 'relatorios') {
                nextTick(() => renderizarGraficosRelatorio());
            }
        }, { deep: true });

        const exportarCSV = () => {
            let csv = "Data,Membro,Projeto,Categoria,Horas,Descricao\n";
            registrosRelatorioOrdenados.value.forEach(r => {
                let desc = (r.Descricao || '').replace(/"/g, '""');
                csv += `${formatarDataSheet(r.Data)},"${r.Nome_Membro}","${r.Projeto || 'Atividade'}","${r.Categoria}",${r.Horas_Gastas},"${desc}"\n`;
            });
            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Relatorio_LAINOVA_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const imprimirRelatorio = () => {
            window.print();
        };

        let chartTemporalInstance = null;
        let chartCategoriaInstance = null;
        const periodoGrafico = ref('mes');

        const mudarPeriodoGrafico = (periodo) => {
            periodoGrafico.value = periodo;
            renderizarGraficos();
        };

        const renderizarGraficos = () => {
            const ctxTemp = document.getElementById('graficoTemporal');
            const ctxCat = document.getElementById('graficoCategoria');
            if (!ctxTemp || !ctxCat) return;

            Chart.defaults.font.family = "'Inter', sans-serif";
            const dadosTemporais = {};
            registros.value.forEach(r => {
                let d = new Date(r.Data);
                if (isNaN(d.getTime()) && r.Data && String(r.Data).includes('/')) {
                    const parts = String(r.Data).split('/');
                    d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
                if (isNaN(d.getTime())) return;

                let chave = "";
                if (periodoGrafico.value === 'mes') {
                    chave = d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
                } else if (periodoGrafico.value === 'semestre') {
                    const sem = d.getMonth() < 6 ? '1º Sem' : '2º Sem';
                    chave = `${sem}/${d.getFullYear()}`;
                } else if (periodoGrafico.value === 'semana') {
                    const inicioSemana = new Date(d);
                    inicioSemana.setDate(d.getDate() - d.getDay());
                    chave = `Sem ${inicioSemana.getDate()}/${inicioSemana.getMonth()+1}`;
                }

                dadosTemporais[chave] = (dadosTemporais[chave] || 0) + (parseFloat(r.Horas_Gastas) || 0);
            });

            if (chartTemporalInstance) chartTemporalInstance.destroy();
            chartTemporalInstance = new Chart(ctxTemp, {
                type: 'bar',
                data: {
                    labels: Object.keys(dadosTemporais),
                    datasets: [{
                        label: 'Horas Registadas',
                        data: Object.values(dadosTemporais),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
            });

            const dadosCategorias = {};
            registros.value.forEach(r => {
                const cat = r.Categoria || 'Outros';
                dadosCategorias[cat] = (dadosCategorias[cat] || 0) + (parseFloat(r.Horas_Gastas) || 0);
            });

            if (chartCategoriaInstance) chartCategoriaInstance.destroy();
            chartCategoriaInstance = new Chart(ctxCat, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(dadosCategorias),
                    datasets: [{
                        data: Object.values(dadosCategorias),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        };

        const salvarMembro = async (formData) => {
            enviandoMembro.value = true;
            try {
                await chamarBackend({
                    acao: "adicionarUsuario",
                    token: tokenSessao.value,
                    nome: formData.nome,
                    login: formData.login,
                    senha: formData.senha,
                    cargo: formData.cargo,
                    ativo: formData.ativo
                });
                modalMembroAberto.value = false;
                await fetchDados();
                alert(`Membro @${formData.login} criado com sucesso!`);
            } catch (err) {
                alert("Erro ao cadastrar membro: " + err.message);
            } finally {
                enviandoMembro.value = false;
            }
        };

        const alternarStatusMembro = async (loginMembro, novoStatusAtivo) => {
            carregandoDados.value = true;
            try {
                await chamarBackend({
                    acao: "alternarStatusUsuario",
                    token: tokenSessao.value,
                    loginUsuario: loginMembro,
                    ativo: novoStatusAtivo ? 'SIM' : 'NAO'
                });
                await fetchDados();
            } catch (err) {
                alert("Erro ao alterar status: " + err.message);
                carregandoDados.value = false;
            }
        };

        const removerMembro = async (loginMembro) => {
            if (!confirm(`Tem a certeza que deseja eliminar o utilizador @${loginMembro} da liga?`)) return;
            carregandoDados.value = true;
            try {
                await chamarBackend({
                    acao: "excluirUsuario",
                    token: tokenSessao.value,
                    loginUsuario: loginMembro
                });
                await fetchDados();
            } catch (err) {
                alert("Erro ao eliminar: " + err.message);
                carregandoDados.value = false;
            }
        };

        const modoRegistro = ref('manual');
        const form = ref({
            data: new Date().toISOString().split('T')[0],
            projeto: 'Atividade',
            categoria: '',
            inicio: '',
            termino: '',
            descricao: ''
        });

        const duracaoCalculadaHoras = computed(() => {
            if (!form.value.inicio || !form.value.termino) return 0;
            const [h1, m1] = form.value.inicio.split(':').map(Number);
            const [h2, m2] = form.value.termino.split(':').map(Number);
            const minutos = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
            return parseFloat((minutos / 60).toFixed(1));
        });

        const salvarRegistro = async () => {
            if (duracaoCalculadaHoras.value <= 0) { alert("Horário inválido. Verifique o início e fim."); return; }
            if (!form.value.categoria) { alert("Selecione uma categoria."); return; }
            enviandoRegistro.value = true;
            const dataFormatadaStr = form.value.data.split('-').reverse().join('/');

            try {
                await chamarBackend({
                    acao: "inserir",
                    token: tokenSessao.value,
                    data: dataFormatadaStr,
                    projeto: form.value.projeto || 'Atividade',
                    categoria: form.value.categoria,
                    horas: duracaoCalculadaHoras.value,
                    descricao: form.value.descricao + ` (${form.value.inicio} - ${form.value.termino})`
                });
                form.value = { 
                    data: new Date().toISOString().split('T')[0], 
                    projeto: projetos.value[0] || 'Atividade',
                    categoria: '', 
                    inicio: '', 
                    termino: '', 
                    descricao: '' 
                };
                mudarAba('historico');
                await fetchDados();
            } catch (err) {
                alert("Erro ao guardar: " + err.message);
            } finally {
                enviandoRegistro.value = false;
            }
        };

        const timerAtivo = ref(false);
        const segundosCount = ref(0);
        let intervalCronometro;
        const cronometroDisplay = computed(() => {
            const h = Math.floor(segundosCount.value / 3600).toString().padStart(2, '0');
            const m = Math.floor((segundosCount.value % 3600) / 60).toString().padStart(2, '0');
            const s = (segundosCount.value % 60).toString().padStart(2, '0');
            return `${h}:${m}:${s}`;
        });

        const iniciarCronometro = () => {
            form.value.inicio = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute:'2-digit' });
            timerAtivo.value = true;
            intervalCronometro = setInterval(() => segundosCount.value++, 1000);
        };

        const pararCronometro = () => {
            timerAtivo.value = false;
            clearInterval(intervalCronometro);
            form.value.termino = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute:'2-digit' });
            modoRegistro.value = 'manual';
            segundosCount.value = 0;
        };

        const registrosOrdenados = computed(() => [...registros.value].sort((a,b) => parseDateToTime(b.Data) - parseDateToTime(a.Data)));

        onMounted(() => {
            intervalRelogio = setInterval(() => dataAtualObj.value = new Date(), 1000);
            verificarSessaoInicial();
            aplicarFiltroRapido('mes');
        });

        onUnmounted(() => {
            clearInterval(intervalRelogio);
            if (intervalCronometro) clearInterval(intervalCronometro);
        });

        return {
            usuarioAutenticado, usuarioAtual, carregandoLogin, mensagemErroLogin,
            fazerLogin, fazerLogout,
            abas, abaAtual, tituloAbaAtual: computed(() => abas.value.find(a => a.id === abaAtual.value)?.label),
            horaFormatada, dataFormatada, menuMobileAberto, mudarAba,
            membros, registros, projetos, categorias, carregandoDados, enviandoRegistro, enviandoMembro, carregandoProjetosCategorias,
            totalHorasGeral, totalLancamentos, acumuladoMembros, fetchDados,
            adicionarProjeto, excluirProjeto, adicionarCategoria, excluirCategoria,
            modalMembroAberto, salvarMembro, alternarStatusMembro, removerMembro,
            modalEdicaoAberto, registroParaEdicao, enviandoEdicao, abrirEdicaoRegistro, salvarEdicaoRegistro, excluirRegistro, podeEditarExcluir,
            periodoGrafico, mudarPeriodoGrafico,
            modoRegistro, form, duracaoCalculadaHoras, salvarRegistro,
            timerAtivo, cronometroDisplay, iniciarCronometro, pararCronometro,
            registrosOrdenados, formatarDataSheet,
            filtroRelatorio, periodoRelatorioTexto, registrosRelatorio, registrosRelatorioOrdenados,
            kpisRelatorio, rankingRelatorio, aplicarFiltroRapido, exportarCSV, imprimirRelatorio
        };
    }
});

app.mount('#app');
