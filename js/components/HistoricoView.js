window.HistoricoViewComponent = {
    props: {
        registrosOrdenados: { type: Array, default: () => [] },
        formatarDataSheet: { type: Function, required: true },
        cargoUsuario: { type: String, default: '' },
        membros: { type: Array, default: () => [] }
    },
    data() {
        return {
            filtroMembroHistorico: ''
        };
    },
    computed: {
        registrosFiltrados() {
            if (!this.filtroMembroHistorico || this.cargoUsuario === 'FUNCIONARIO') {
                return this.registrosOrdenados;
            }
            return this.registrosOrdenados.filter(r => r.Nome_Membro === this.filtroMembroHistorico);
        }
    },
    template: `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">
                        {{ cargoUsuario === 'FUNCIONARIO' ? 'O Meu Histórico de Atividades' : 'Histórico de Atividades' }}
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                        {{ cargoUsuario === 'FUNCIONARIO' ? 'Consulte as suas horas e o status de validação das suas solicitações.' : 'Histórico completo de lançamentos de horas da equipa.' }}
                    </p>
                </div>

                <!-- Filtro por Membro para Administradores / Gestores -->
                <div v-if="cargoUsuario !== 'FUNCIONARIO'" class="flex items-center gap-2 w-full sm:w-auto">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filtrar:</label>
                    <select v-model="filtroMembroHistorico" class="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none w-full sm:w-auto">
                        <option value="">Todos os utilizadores</option>
                        <option v-for="m in membros" :key="m.login || m.nome" :value="m.nome">{{ m.nome }}</option>
                    </select>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                            <tr>
                                <th class="px-6 py-4">Data</th>
                                <th class="px-6 py-4" v-if="cargoUsuario !== 'FUNCIONARIO'">Membro / Utilizador</th>
                                <th class="px-6 py-4">Categoria</th>
                                <th class="px-6 py-4 text-right">Horas</th>
                                <th class="px-6 py-4">Descrição da Atividade</th>
                                <th class="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            <tr v-for="r in registrosFiltrados" :key="r.ID" class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 text-slate-600 font-mono text-xs">{{ formatarDataSheet(r.Data) }}</td>
                                <td class="px-6 py-4 font-bold text-slate-800" v-if="cargoUsuario !== 'FUNCIONARIO'">
                                    {{ r.Nome_Membro }}
                                </td>
                                <td class="px-6 py-4">
                                    <span class="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-0.5 rounded text-xs font-bold">{{ r.Categoria }}</span>
                                </td>
                                <td class="px-6 py-4 font-bold text-slate-800 text-right">{{ parseFloat(r.Horas_Gastas || 0).toFixed(1) }}h</td>
                                <td class="px-6 py-4 text-slate-600 truncate max-w-xs" :title="r.Descricao">{{ r.Descricao }}</td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5" :class="{
                                        'bg-emerald-100 text-emerald-700': r.Status === 'Aprovada',
                                        'bg-amber-100 text-amber-700': r.Status === 'Pendente',
                                        'bg-red-100 text-red-700': r.Status === 'Recusada' || r.Status === 'Rejeitada'
                                    }">
                                        <i class="fa-solid fa-circle text-[6px]"></i>{{ r.Status }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="registrosFiltrados.length === 0">
                                <td :colspan="cargoUsuario === 'FUNCIONARIO' ? 5 : 6" class="px-6 py-12 text-center text-slate-400">
                                    Nenhum registo de horas encontrado.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
