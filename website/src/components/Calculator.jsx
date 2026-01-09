import React, { useState, useMemo } from 'react';
import { Card, CardBody, Button, Switch } from "@heroui/react";
import { Moon, Sun } from 'lucide-react';
import InputSection from './InputSection';
import ResultsSection from './ResultsSection';
import { calculateBatteryConfig } from '../utils/calculate';

export default function Calculator() {
    const [isDark, setIsDark] = useState(false);
    const [formData, setFormData] = useState({
        profile: 'working',
        gridPhase: '3',
        consumption: 3250,
        solarPanels: 10,
        solarWp: 400,
        orientation: 'south',
        hasHeatPump: false,
        hasAirco: false,
        hasPool: false,
        hasEV: false,
        evCapacity: 60,
        tariff: 'fixed'
    });

    const results = useMemo(() => calculateBatteryConfig(formData), [formData]);

    const handleGetAdvice = () => {
        const params = new URLSearchParams({
            ...formData,
            rec_cap: results.recommendedCapacity,
            rec_inv: results.inverterSize
        }).toString();

        window.parent.location.href = `https://thuisbatterijnederland.nl/contact/?${params}`;
        console.log("Redirecting with:", params);
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>

            {/* Gradient Orbs - Only in dark mode */}
            {isDark && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
                </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">

                {/* Header with Theme Toggle */}
                <div className="text-center mb-16 relative">
                    {/* Theme Toggle - Top Right */}
                    <div className="absolute top-0 right-0">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${isDark
                                ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            {isDark ? 'Light' : 'Dark'}
                        </button>
                    </div>

                    <h1 className={`text-6xl md:text-7xl font-black mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                        Batterij <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">Calculator</span>
                    </h1>
                    <p className={`text-xl font-medium max-w-2xl mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                        Bereken binnen 1 minuut de ideale thuisbatterij voor jouw woning
                    </p>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <div className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Vul 4 eenvoudige stappen in
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Inputs - ALWAYS LIGHT THEME */}
                    <div className="lg:col-span-7">
                        <Card className="border-2 border-slate-200 shadow-2xl bg-white rounded-3xl overflow-hidden">
                            <CardBody className="p-8 md:p-12">
                                <InputSection formData={formData} setFormData={setFormData} />
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right: Results */}
                    <div className="lg:col-span-5 lg:sticky lg:top-8">
                        <ResultsSection results={results} onGetAdvice={handleGetAdvice} isDark={isDark} />
                    </div>

                </div>

                {/* Credibility Box - Over deze simulatie */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <Card className={`rounded-[40px] border-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-xl'}`}>
                        <CardBody className="p-10">
                            <div className="flex flex-col md:flex-row gap-10 items-center">
                                <div className="flex-1 space-y-4">
                                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Over deze simulatie</h3>
                                    <div className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Deze tool is ontwikkeld door TBNL om huiseigenaren te helpen bij de transitie naar slimme energie-opslag.
                                        De berekeningen zijn gebaseerd op:
                                    </div>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            'Realistische NL zonne-profielen',
                                            'Standaard piek-verbruik patronen',
                                            '15-minuten simulatie stappen',
                                            'Actuele energie-marktprijzen'
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="shrink-0">
                                    <div className={`w-32 h-32 rounded-3xl flex flex-col items-center justify-center p-4 border-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="text-3xl mb-1">🛡️</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase text-center leading-tight">ISO 27001 Gecertificeerd</div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <TrustBadge icon="⚡" label="Betrouwbaar" desc="NL standaarden" isDark={isDark} />
                    <TrustBadge icon="🛡️" label="Onafhankelijk" desc="Eerlijk advies" isDark={isDark} />
                    <TrustBadge icon="🔒" label="Privacy" desc="Geen data opslag" isDark={isDark} />
                    <TrustBadge icon="✨" label="Gratis" desc="Altijd vrijblijvend" isDark={isDark} />
                </div>
            </div>
        </div>
    );
}

const TrustBadge = ({ icon, label, desc, isDark }) => (
    <div className={`rounded-3xl p-4 text-center transition-all duration-300 ${isDark
        ? 'backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10'
        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
        }`}>
        <div className="text-3xl mb-2">{icon}</div>
        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</div>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</div>
    </div>
);
