window.GraficosViewComponent = {
    props: {
        registros: { type: Array, default: () => [] },
        periodoGrafico: { type: String, default: 'mes' }
    },
    emits: ['mudar-periodo'],
    template: `
        <div class="space-y-6">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 class="font-bold text-slate-800 text-lg">Evolução Geral</h3>
                    <p class="text-slate-500 text-sm">Distribuição das horas aprovadas no tempo.</p>
                </div>
                <div class="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-full md:w-auto overflow-x-auto">
                    <button @click="$emit('mudar-periodo', 'semana')" :class="periodoGrafico === 'semana' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm transition">Semana</button>
                    <button @click="$emit('mudar-periodo', 'mes')" :class="periodoGrafico === 'mes' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm transition">Mês</button>
                    <button @click="$emit('mudar-periodo', 'semestre')" :class="periodoGrafico === 'semestre' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm transition">Semestre</button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-semibold text-slate-700 mb-4 capitalize">Carga Horária (Por {{ periodoGrafico }})</h4>
                    <div class="relative h-72 w-full"><canvas id="graficoTemporal"></canvas></div>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-semibold text-slate-700 mb-4">Distribuição por Categoria</h4>
                    <div class="relative h-72 w-full"><canvas id="graficoCategoria"></canvas></div>
                </div>
            </div>
        </div>
    `
};
