window.HeaderComponent = {
    props: {
        tituloAbaAtual: { type: String, default: '' },
        horaFormatada: { type: String, default: '' },
        dataFormatada: { type: String, default: '' },
        usuario: { type: Object, default: () => ({ nome: '', cargo: '', login: '' }) }
    },
    emits: ['abrir-menu', 'fazer-logout'],
    template: `
        <header class="bg-white shadow-sm px-6 md:px-8 py-3.5 flex justify-between items-center z-10 border-b border-slate-200 shrink-0">
            <div class="flex items-center gap-4">
                <button class="md:hidden text-slate-600 text-xl p-2 -ml-2 rounded-md hover:bg-slate-100" @click="$emit('abrir-menu')">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <h2 class="text-xl font-bold text-slate-800 truncate">{{ tituloAbaAtual }}</h2>
            </div>
            
            <div class="flex items-center gap-6">
                <div class="text-right hidden sm:block">
                    <div class="text-xl font-mono font-bold text-slate-700 flex items-center justify-end gap-2">
                        <i class="fa-regular fa-clock text-emerald-500"></i> {{ horaFormatada }}
                    </div>
                    <div class="text-xs text-slate-500 capitalize">{{ dataFormatada }}</div>
                </div>

                <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {{ (usuario.nome || 'U').substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="hidden lg:block text-left">
                        <p class="text-sm font-bold text-slate-800 leading-tight">{{ usuario.nome }}</p>
                        <p class="text-xs font-semibold text-emerald-600 uppercase">{{ usuario.cargo }}</p>
                    </div>
                    <button @click="$emit('fazer-logout')" class="text-slate-400 hover:text-red-600 p-2 rounded-lg transition" title="Terminar Sessão">
                        <i class="fa-solid fa-power-off text-lg"></i>
                    </button>
                </div>
            </div>
        </header>
    `
};
