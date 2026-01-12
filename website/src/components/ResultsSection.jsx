import React, { useMemo } from 'react';
import { Card, CardBody, Progress, Chip } from "@heroui/react";
import {
    Battery,
    Zap,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Euro,
    CheckCircle2,
    Info,
    Clock
} from 'lucide-react';

export default function ResultsSection({ results, onGetAdvice, isDark = true }) {
    const improvement = Math.round(results.stats.projected - results.stats.current);

    // Dynamic SVG Path generation from flowPoints
    const graphData = useMemo(() => {
        if (!results.flowPoints) return null;

        // Scale points to 100x40 SVG viewBox
        const maxVal = Math.max(...results.flowPoints.map(p => Math.max(p.solar, p.consumption))) * 1.2 || 1;

        // Points for lines
        const solarPoints = results.flowPoints.map((p, i) => `${(i / 23) * 100},${40 - (p.solar / maxVal) * 35}`).join(' L ');
        const consPoints = results.flowPoints.map((p, i) => `${(i / 23) * 100},${40 - (p.consumption / maxVal) * 35}`).join(' L ');
        const batteryPoints = results.flowPoints.map((p, i) => `${(i / 23) * 100},${40 - (p.batteryLevel / 100) * 35}`).join(' L ');

        // Areas for filling
        const solarArea = `M 0,40 L ${solarPoints} L 100,40 Z`;
        const consArea = `M 0,40 L ${consPoints} L 100,40 Z`;

        return { solarPoints, consPoints, batteryPoints, solarArea, consArea };
    }, [results.flowPoints]);

    return (
        <Card className={`border-2 shadow-2xl transition-all duration-500 overflow-hidden rounded-3xl ${isDark
            ? 'border-slate-900 bg-gradient-to-br from-slate-950 to-slate-900'
            : 'border-slate-200 bg-white'
            }`}>
            <CardBody className="p-0">

                {/* Header - Always Dark/Premium */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <Chip
                            size="sm"
                            variant="flat"
                            className="bg-white/20 text-white font-black text-[10px] uppercase tracking-widest mb-3 backdrop-blur-md"
                            startContent={<Sparkles size={12} />}
                        >
                            Elite Simulatie
                        </Chip>
                        <h2 className="text-4xl font-black text-white mb-2 leading-none">Jouw Batterij Plan</h2>
                        <div className="flex items-center gap-2 text-orange-100 text-sm font-bold opacity-90">
                            <CheckCircle2 size={16} /> 100% Specialistisch advies
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">

                    {/* Main Specs */}
                    <div className="grid grid-cols-2 gap-4">
                        <SpecCard
                            icon={<Battery className="text-orange-500" size={24} />}
                            label="Batterij"
                            value={results.recommendedCapacity.toFixed(1)}
                            unit="kWh"
                            color="orange"
                            isDark={isDark}
                        />
                        <SpecCard
                            icon={<Zap className="text-blue-400" size={24} />}
                            label="Omvormer"
                            value={results.inverterSize}
                            unit="kW"
                            sublabel={results.inverterSize <= 5 ? '1 of 3 Fase' : '3 Fase Vereist'}
                            color="blue"
                            isDark={isDark}
                        />
                    </div>

                    {/* Financials & Impact Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <MiniMetric
                            icon={<Euro size={16} className="text-green-500" />}
                            label="Besparing p/j"
                            value={`€${results.annualSavings}`}
                            isDark={isDark}
                        />
                        <MiniMetric
                            icon={<TrendingUp size={16} className="text-purple-400" />}
                            label="Zelfconsumptie"
                            value={`${results.stats.selfConsumption}%`}
                            isDark={isDark}
                        />
                        <div className="col-span-2 text-[8px] text-center text-slate-400 font-medium">
                            * Geschatte besparing o.b.v. simulatie. Geen garantie.
                        </div>
                    </div>

                    <div className={`h-px w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

                    {/* Self-Sufficiency Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Autarkie (Onafhankelijkheid)
                                </h4>
                                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {results.stats.projected}% <span className="text-green-500 text-sm">+{improvement}%</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Huidig</div>
                                <div className="text-lg font-bold text-slate-400">{results.stats.current}%</div>
                            </div>
                        </div>
                        <div className="relative h-4 w-full bg-slate-800/20 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-slate-600/30 transition-all duration-1000"
                                style={{ width: `${results.stats.current}%` }}
                            ></div>
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-green-400 to-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-1000"
                                style={{ width: `${results.stats.projected}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* DYNAMIC Energy Flow Simulation */}
                    <div className={`rounded-3xl p-6 border transition-colors duration-500 ${isDark ? 'bg-black/20 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-between items-center">
                                <h5 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <Clock size={12} /> Energie Flow (24u)
                                </h5>
                            </div>
                            {/* Legend - Detailed like inspiration */}
                            <div className="flex flex-wrap gap-4 items-center border-t border-slate-800/50 pt-3 mt-1">
                                <GraphLegend color="orange" label="Zon" />
                                <GraphLegend color="slate" label="Verbruik" dashed />
                                <GraphLegend color="blue" label="Batterij SoC" />
                            </div>
                        </div>

                        <div className="h-40 w-full relative">
                            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                {/* Area fills for weight */}
                                <path
                                    d={graphData?.solarArea}
                                    fill="url(#solarGradient)"
                                    className="transition-all duration-1000 ease-in-out"
                                />

                                <defs>
                                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgb(249,115,22)" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="rgb(249,115,22)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid Lines */}
                                <line x1="0" y1="10" x2="100" y2="10" stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeWidth="0.5" />
                                <line x1="0" y1="20" x2="100" y2="20" stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeWidth="0.5" />
                                <line x1="0" y1="30" x2="100" y2="30" stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeWidth="0.5" />

                                {/* Consumption Line (Dashed) */}
                                <path
                                    d={`M ${graphData?.consPoints}`}
                                    fill="none"
                                    stroke={isDark ? "rgba(148,163,184,0.4)" : "rgba(100,116,139,0.4)"}
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                    className="transition-all duration-1000 ease-in-out"
                                />

                                {/* Solar Line (Solid) */}
                                <path
                                    d={`M ${graphData?.solarPoints}`}
                                    fill="none"
                                    stroke="rgb(249,115,22)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                />

                                {/* Battery SoC Line (Prominent Blue) */}
                                <path
                                    d={`M ${graphData?.batteryPoints}`}
                                    fill="none"
                                    stroke="rgb(59,130,246)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                />

                                {/* Zero Axis */}
                                <line x1="0" y1="40" x2="100" y2="40" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="1" />
                            </svg>

                            <div className="flex justify-between text-[8px] font-black text-slate-500 mt-3 uppercase tracking-[0.1em]">
                                <span>00:00</span>
                                <span>Ochtend</span>
                                <span>Middag</span>
                                <span>Avond</span>
                                <span>23:59</span>
                            </div>
                        </div>
                    </div>

                    {/* Logic Checklist */}
                    <div className={`rounded-3xl p-6 space-y-3 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200 shadow-inner'}`}>
                        <h5 className={`text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Onderbouwing op maat</h5>
                        <CheckItem isDark={isDark} text={`${results.recommendedCapacity}kWh dekt jouw gemiddelde nachtverbruik`} />
                        <CheckItem isDark={isDark} text="Optimale balans tussen opwek en opslagcapaciteit" />
                        <CheckItem isDark={isDark} text="Geschikt voor piekontlasting bij zwaar gebruik" />
                        <CheckItem isDark={isDark} text="Voorbereid op slim handelen bij dynamische levering" />
                    </div>

                    {/* CTA Section */}
                    <div className="space-y-4 pt-4">
                        <button
                            onClick={onGetAdvice}
                            className="group relative w-full h-20 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-3xl font-black text-xl shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.95] flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative z-10">Advies Rapport Aanvragen</span>
                            <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={24} />
                        </button>
                        <div className="text-center">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                                Officiële TBNL Berekening
                            </p>
                        </div>
                    </div>

                </div>
            </CardBody>
        </Card>
    );
}

const SpecCard = ({ icon, label, value, unit, sublabel, color, isDark }) => (
    <div className={`rounded-[24px] p-5 border-2 relative overflow-hidden group transition-all duration-300 backdrop-blur-sm ${isDark
        ? `bg-white/5 border-white/5 hover:border-${color}-500/50`
        : `bg-slate-50 border-slate-100 hover:border-${color}-500/50 shadow-sm`
        }`}>
        <div className={`absolute -top-4 -right-4 w-16 h-16 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`}></div>
        <div className="relative z-10">
            <div className={`mb-3 p-2 rounded-xl w-fit ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>{icon}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
            <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
                <span className={`text-base font-bold text-${color}-500`}>{unit}</span>
            </div>
            {sublabel && (
                <div className="text-[9px] font-bold text-slate-500 uppercase mt-2">{sublabel}</div>
            )}
        </div>
    </div>
);

const MiniMetric = ({ icon, label, value, isDark }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>{icon}</div>
        <div className="min-w-0">
            <div className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1 truncate">{label}</div>
            <div className={`text-sm font-black transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
        </div>
    </div>
);

const CheckItem = ({ text, isDark }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-green-500" size={14} />
        </div>
        <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{text}</span>
    </div>
);

const GraphLegend = ({ color, label, dashed }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-0.5 rounded-full ${color === 'orange' ? 'bg-orange-500' :
            color === 'blue' ? 'bg-blue-500' :
                'bg-slate-400 opacity-40'
            } ${dashed ? 'border-t-2 border-dashed' : ''}`} />
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
);
