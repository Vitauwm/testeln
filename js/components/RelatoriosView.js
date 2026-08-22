window.RelatoriosViewComponent = {
    props: {
        membros: { type: Array, default: () => [] },
        filtroRelatorio: { type: Object, required: true },
        periodoRelatorioTexto: { type: String, default: '' },
        kpisRelatorio: { type: Object, required: true },
        rankingRelatorio: { type: Array, default: () => [] },
        registrosRelatorio: { type: Array, default: () => [] },
        registrosRelatorioOrdenados: { type: Array, default: () => [] },
        formatarDataSheet: { type: Function, required: true }
    },
    emits: ['aplicar-filtro-rapido', 'exportar-csv', 'imprimir-relatorio'],
    template: `
        <div class="space-y-6 pb-10 print:pb-0">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-file-invoice text-emerald-600"></i> Relatório Geral de Atividades
                    </h2>
                    <p class="text-slate-500 text-sm mt-1">
                        Período de Análise: <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{{ periodoRelatorioTexto }}</span>
                    </p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto no-print">
                    <button @click="$emit('exportar-csv')" class="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i> Excel/CSV
                    </button>
                    <button @click="$emit('imprimir-relatorio')" class="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition">
                        <i class="fa-solid fa-print"></i> Guardar PDF
                    </button>
                </div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button @click="$emit('aplicar-filtro-rapido', 'mes')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition border border-slate-200">Mensal</button>
                        <button @click="$emit('aplicar-filtro-rapido', 'semestre')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition border border-slate-200">Semestral</button>
                        <button @click="$emit('aplicar-filtro-rapido', 'ano')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition border border-slate-200">Anual</button>
                        <button @click="$emit('aplicar-filtro-rapido', 'tudo')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-medium transition shadow-sm">Ver Tudo</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Data Inicial</label>
                        <input type="date" v-model="filtroRelatorio.inicio" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Data Final</label>
                        <input type="date" v-model="filtroRelatorio.fim" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Filtrar por Utilizador</label>
                        <select v-model="filtroRelatorio.membro" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                            <option value="">Todos os membros da equipa</option>
                            <option v-for="m in membros" :key="m.login || m.nome" :value="m.nome">{{ m.nome }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 print-break-inside">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div class="absolute right-0 top-0 opacity-5 text-6xl -mt-2 -mr-2"><i class="fa-solid fa-clock"></i></div>
                    <span class="text-slate-500 text-xs font-bold uppercase mb-1 z-10">Total Registado</span>
                    <span class="text-3xl font-black text-slate-800 z-10">{{ kpisRelatorio.totalHoras }}<span class="text-lg font-medium text-slate-500">h</span></span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">No período selecionado</span>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden border-b-4 border-b-emerald-500">
                    <div class="absolute right-0 top-0 opacity-5 text-emerald-500 text-6xl -mt-2 -mr-2"><i class="fa-solid fa-piggy-bank"></i></div>
                    <span class="text-emerald-700 text-xs font-bold uppercase mb-1 z-10">Banco (Aprovadas)</span>
                    <span class="text-3xl font-black text-slate-800 z-10">{{ kpisRelatorio.horasBanco }}<span class="text-lg font-medium text-slate-500">h</span></span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">Horas validadas ({{ kpisRelatorio.percBanco }}%)</span>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div class="absolute right-0 top-0 opacity-5 text-6xl -mt-2 -mr-2"><i class="fa-solid fa-list-check"></i></div>
                    <span class="text-slate-500 text-xs font-bold uppercase mb-1 z-10">Volume de Atividades</span>
                    <span class="text-3xl font-black text-slate-800 z-10">{{ kpisRelatorio.totalAtividades }}</span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">Média: {{ kpisRelatorio.mediaHorasPorAtividade }}h / ativ.</span>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div class="absolute right-0 top-0 opacity-5 text-amber-500 text-6xl -mt-2 -mr-2"><i class="fa-solid fa-trophy"></i></div>
                    <span class="text-amber-600 text-xs font-bold uppercase mb-1 z-10">Destaque do Período</span>
                    <span class="text-lg font-black text-slate-800 truncate z-10" :title="kpisRelatorio.membroDestaque">{{ kpisRelatorio.membroDestaque || 'N/A' }}</span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">Maior acumulador de horas</span>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break-inside">
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-bold text-slate-700 mb-1">Ranking de Horas (Top 10)</h4>
                    <p class="text-xs text-slate-400 mb-4">Utilizadores com mais horas no período selecionado</p>
                    <div class="relative h-64 w-full">
                        <canvas id="chartRelRanking"></canvas>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-bold text-slate-700 mb-1">Distribuição de Carga Horária</h4>
                    <p class="text-xs text-slate-400 mb-4">Divisão das horas por categoria de atividade</p>
                    <div class="relative h-64 w-full">
                        <canvas id="chartRelCategoria"></canvas>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1 print-break-inside flex flex-col">
                    <div class="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-sm">Resumo da Equipa</h3>
                        <span class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{{ rankingRelatorio.length }} membros</span>
                    </div>
                    <div class="overflow-x-auto flex-1 max-h-[400px]">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-white sticky top-0 shadow-sm z-10">
                                <tr class="text-slate-500 text-xs uppercase tracking-wider">
                                    <th class="px-4 py-3 font-semibold">Nome</th>
                                    <th class="px-4 py-3 font-semibold text-right">Horas</th>
                                    <th class="px-4 py-3 font-semibold text-center" title="Total de Atividades">Ativ.</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="(m, index) in rankingRelatorio" :key="m.nome" 
                                    class="hover:bg-slate-50 cursor-pointer transition group" 
                                    @click="filtroRelatorio.membro = m.nome" title="Clique para filtrar registos deste utilizador">
                                    <td class="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                                        <span class="text-xs font-bold text-slate-400 w-3 text-center">{{ index + 1 }}º</span> 
                                        <span class="group-hover:text-emerald-600 transition-colors">{{ (m.nome || '').split(' ')[0] }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-right text-emerald-600 font-bold">{{ m.horas }}h</td>
                                    <td class="px-4 py-3 text-center text-slate-500">{{ m.atividades }}</td>
                                </tr>
                                <tr v-if="rankingRelatorio.length === 0">
                                    <td colspan="3" class="px-4 py-8 text-center text-slate-400 italic">Nenhum dado no período.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center no-print">
                        <i class="fa-solid fa-mouse-pointer mr-1"></i> Clique num membro para filtrar a tabela ao lado
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 print-break-inside flex flex-col">
                    <div class="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
                        <h3 class="font-bold text-slate-700 text-sm">
                            Extrato Detalhado 
                            <span v-if="filtroRelatorio.membro" class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-1 border border-emerald-100 flex items-center inline-flex">
                                {{ filtroRelatorio.membro }}
                                <i class="fa-solid fa-xmark ml-2 cursor-pointer hover:text-red-500" @click="filtroRelatorio.membro = ''" title="Remover filtro"></i>
                            </span>
                        </h3>
                        <span class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{{ registrosRelatorio.length }} registos</span>
                    </div>
                    <div class="overflow-x-auto flex-1 max-h-[400px]">
                        <table class="w-full text-left whitespace-nowrap text-sm">
                            <thead class="bg-white sticky top-0 shadow-sm z-10">
                                <tr class="text-slate-500 text-xs uppercase tracking-wider">
                                    <th class="px-4 py-3 font-semibold">Data</th>
                                    <th class="px-4 py-3 font-semibold" v-if="!filtroRelatorio.membro">Utilizador</th>
                                    <th class="px-4 py-3 font-semibold">Categoria</th>
                                    <th class="px-4 py-3 font-semibold text-right">Horas</th>
                                    <th class="px-4 py-3 font-semibold">Descrição da Atividade</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="r in registrosRelatorioOrdenados" :key="r.ID" class="hover:bg-slate-50 transition">
                                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ formatarDataSheet(r.Data) }}</td>
                                    <td class="px-4 py-3 font-semibold text-slate-700" v-if="!filtroRelatorio.membro">{{ (r.Nome_Membro || '').split(' ')[0] }}</td>
                                    <td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{{ r.Categoria }}</span></td>
                                    <td class="px-4 py-3 font-bold text-slate-800 text-right">{{ parseFloat(r.Horas_Gastas).toFixed(1) }}h</td>
                                    <td class="px-4 py-3 text-slate-600 truncate max-w-[250px]" :title="r.Descricao">{{ r.Descricao }}</td>
                                </tr>
                                <tr v-if="registrosRelatorio.length === 0">
                                    <td colspan="5" class="px-4 py-12 text-center text-slate-400">Nenhum registo encontrado para os filtros selecionados.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
};
