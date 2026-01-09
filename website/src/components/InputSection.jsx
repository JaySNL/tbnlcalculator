import React from 'react';
import { Slider } from "@heroui/react";
import {
    CloudSun,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function InputSection({ formData, setFormData }) {

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleProfileChange = (profile) => {
        const consumptionMap = {
            working: 3250,
            home: 4250,
            family: 5000,
            custom: formData.consumption
        };
        setFormData(prev => ({
            ...prev,
            profile,
            consumption: consumptionMap[profile] || prev.consumption
        }));
    };

    return (
        <div className="space-y-16">

            {/* 1. ENERGIEPROFIEL */}
            <section className="space-y-6">
                <StepHeader
                    step="1"
                    total="4"
                    title="Jouw Energieprofiel"
                    subtitle="Hoe ziet jouw dagelijkse energieverbruik eruit?"
                />

                {/* Usage Profile Selector */}
                <div className="space-y-4">
                    <label className="text-sm font-black text-slate-700 block uppercase tracking-wider">Kies jouw situatie</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <ProfileButton
                            isSelected={formData.profile === 'working'}
                            onClick={() => handleProfileChange('working')}
                            icon="💼"
                            label="Werkend"
                            consumption="~3250 kWh"
                        />
                        <ProfileButton
                            isSelected={formData.profile === 'home'}
                            onClick={() => handleProfileChange('home')}
                            icon="🏠"
                            label="Thuiswerk"
                            consumption="~4250 kWh"
                        />
                        <ProfileButton
                            isSelected={formData.profile === 'family'}
                            onClick={() => handleProfileChange('family')}
                            icon="👥"
                            label="Gezin"
                            consumption="~5000 kWh"
                        />
                        <ProfileButton
                            isSelected={formData.profile === 'custom'}
                            onClick={() => handleProfileChange('custom')}
                            icon="⚙️"
                            label="Eigen opgave"
                            consumption="Handmatig"
                        />
                    </div>
                </div>

                {/* Consumption Slider - Only show if custom */}
                {formData.profile === 'custom' && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl p-8 border-2 border-orange-200 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-baseline mb-6">
                            <span className="text-sm font-black text-orange-900 uppercase">Jouw jaarverbruik</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-orange-600 transition-all">
                                    {formData.consumption}
                                </span>
                                <span className="text-xl font-bold text-orange-900/60 uppercase">kWh</span>
                            </div>
                        </div>
                        <Slider
                            aria-label="Jaarverbruik"
                            step={100}
                            maxValue={12000}
                            minValue={500}
                            value={formData.consumption}
                            onChange={(val) => handleChange('consumption', val)}
                            size="lg"
                            classNames={{
                                base: "max-w-full",
                                track: "h-4 bg-white border-2 border-orange-200",
                                filler: "bg-gradient-to-r from-orange-600 to-orange-400",
                                thumb: "w-8 h-8 bg-white border-4 border-orange-500 shadow-xl"
                            }}
                        />
                    </div>
                )}

                {/* Show consumption display if not custom */}
                {formData.profile !== 'custom' && (
                    <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 flex justify-between items-center group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">📊</div>
                            <span className="text-sm font-bold text-slate-500 uppercase">Geschat jaarverbruik</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                {formData.consumption}
                            </span>
                            <span className="text-lg font-bold text-slate-400 uppercase">kWh</span>
                        </div>
                    </div>
                )}

                {/* Grid Phase */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Aansluiting</label>
                        <div className="flex gap-3">
                            <MiniToggleButton
                                isSelected={formData.gridPhase === '1'}
                                onClick={() => handleChange('gridPhase', '1')}
                                label="1-Fase"
                            />
                            <MiniToggleButton
                                isSelected={formData.gridPhase === '3'}
                                onClick={() => handleChange('gridPhase', '3')}
                                label="3-Fase"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ZONNEPANELEN */}
            <section className="space-y-6">
                <StepHeader
                    step="2"
                    total="4"
                    title="Jouw Zonnepanelen"
                    subtitle="Configureer de opbrengst van je PV-installatie"
                />

                <div className="grid grid-cols-2 gap-6">
                    <CleanInput
                        type="number"
                        label="Aantal panelen"
                        placeholder="bijv. 12"
                        value={formData.solarPanels}
                        onChange={(val) => handleChange('solarPanels', Number(val))}
                    />
                    <CleanInput
                        type="number"
                        label="Wp per paneel"
                        placeholder="400"
                        value={formData.solarWp}
                        onChange={(val) => handleChange('solarWp', Number(val))}
                        endContent={<span className="text-xs font-black text-slate-400 uppercase">Wp</span>}
                    />
                </div>

                {/* Total kWp Display */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-blue-700">Totaal vermogen: {((formData.solarPanels * formData.solarWp) / 1000).toFixed(2)} kWp</span>
                </div>

                {/* Orientation - More detailed like competitor */}
                <div className="space-y-4">
                    <label className="text-sm font-black text-slate-700 block uppercase tracking-wider pl-1">Oriëntatie Panelen</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {[
                            { value: 'south', label: 'Zuid', icon: '☀️' },
                            { value: 'west', label: 'West', icon: '🌇' },
                            { value: 'east', label: 'Oost', icon: '🌅' },
                            { value: 'north', label: 'Noord', icon: '❄️' },
                            { value: 'east-west', label: 'O-W', icon: '🔄' }
                        ].map(opt => (
                            <OrientationButton
                                key={opt.value}
                                isSelected={formData.orientation === opt.value}
                                onClick={() => handleChange('orientation', opt.value)}
                                icon={opt.icon}
                                label={opt.label}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SIMULATIE & VERBRUIKERS */}
            <section className="space-y-6">
                <StepHeader
                    step="3"
                    total="4"
                    title="Simulatie & Verbruik"
                    subtitle="Welke apparaten hebben weersinvloed?"
                />

                {/* Grootverbruikers Checklist */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { key: 'hasHeatPump', emoji: '🔥', label: 'Warmtepomp' },
                        { key: 'hasAirco', emoji: '❄️', label: 'Airco' },
                        { key: 'hasPool', emoji: '🏊', label: 'Zwembad' },
                        { key: 'hasEV', emoji: '🚗', label: 'EV Auto' }
                    ].map(({ key, emoji, label }) => (
                        <HeavyConsumerButton
                            key={key}
                            isSelected={formData[key]}
                            onClick={() => handleChange(key, !formData[key])}
                            emoji={emoji}
                            label={label}
                        />
                    ))}
                </div>

                {/* EV Modal-like expansion */}
                {formData.hasEV && (
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm"><AlertCircle size={18} className="text-orange-500" /></div>
                            <p className="text-sm font-bold text-slate-600">Laden van EV heeft grote impact op opslagbehoefte.</p>
                        </div>
                        <CleanInput
                            type="number"
                            label="Accu capaciteit EV"
                            placeholder="64"
                            value={formData.evCapacity}
                            onChange={(val) => handleChange('evCapacity', Number(val))}
                            endContent={<span className="text-xs font-black text-slate-400 uppercase">kWh</span>}
                        />
                    </div>
                )}
            </section>

            {/* 4. ENERGIECONTRACT */}
            <section className="space-y-6">
                <StepHeader
                    step="4"
                    total="4"
                    title="Afsluiting"
                    subtitle="Hoe wil je de overtollige stroom benutten?"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ContractButton
                        isSelected={formData.tariff === 'fixed'}
                        onClick={() => handleChange('tariff', 'fixed')}
                        icon={<CloudSun size={24} />}
                        title="Vast / Variabel"
                        desc="Zelfverbruik optimaliseren"
                    />
                    <ContractButton
                        isSelected={formData.tariff === 'dynamic'}
                        onClick={() => handleChange('tariff', 'dynamic')}
                        icon={<div className="text-2xl font-black">€</div>}
                        title="Dynamisch"
                        desc="Handelen op spotmarktprijzen"
                    />
                </div>

                {/* Final Validation Message */}
                <div className="flex items-center gap-4 bg-green-50 rounded-3xl p-6 border-2 border-green-100">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                        <CheckCircle2 className="text-green-500" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-green-900 leading-tight">Simulatie Klaar</p>
                        <p className="text-xs font-bold text-green-700/70">Rechts zie je jouw gepersonaliseerde advies.</p>
                    </div>
                </div>
            </section>

        </div>
    );
}

// Sub-components
const StepHeader = ({ step, total, title, subtitle }) => (
    <div className="space-y-2 border-l-4 border-orange-500 pl-6 py-1">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Stap {step} van {total}</span>
            <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        <h3 className="text-3xl font-black text-slate-900 leading-none">{title}</h3>
        <p className="text-sm text-slate-500 font-bold">{subtitle}</p>
    </div>
);

const ProfileButton = ({ isSelected, onClick, icon, label, consumption }) => (
    <button
        onClick={onClick}
        className={`h-32 rounded-3xl font-bold transition-all duration-500 flex flex-col items-center justify-center gap-2 border-2 ${isSelected
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-900 text-white shadow-2xl scale-[1.02]'
                : 'bg-white border-slate-100 text-slate-700 hover:border-orange-200 hover:bg-orange-50/30'
            }`}
    >
        <span className="text-4xl mb-1">{icon}</span>
        <span className="text-sm font-black leading-none">{label}</span>
        <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
            {consumption}
        </span>
    </button>
);

const OrientationButton = ({ isSelected, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`aspect-square sm:aspect-auto sm:h-20 rounded-2xl font-black transition-all duration-300 flex flex-col items-center justify-center gap-1 border-2 ${isSelected
                ? 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200'
            }`}
    >
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] uppercase tracking-tighter">{label}</span>
    </button>
);

const HeavyConsumerButton = ({ isSelected, onClick, emoji, label }) => (
    <button
        onClick={onClick}
        className={`h-24 rounded-3xl font-black transition-all duration-500 flex flex-col items-center justify-center gap-2 border-2 ${isSelected
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 text-white shadow-xl scale-[1.02]'
                : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:bg-orange-50/20'
            }`}
    >
        <span className="text-3xl">{emoji}</span>
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
);

const MiniToggleButton = ({ isSelected, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-2xl font-black text-xs transition-all border-2 ${isSelected
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
    >
        {label}
    </button>
);

const ContractButton = ({ isSelected, onClick, icon, title, desc }) => (
    <button
        onClick={onClick}
        className={`p-6 rounded-3xl text-left border-2 transition-all duration-500 flex gap-4 items-center ${isSelected
                ? 'bg-white border-orange-500 shadow-xl scale-[1.02]'
                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-orange-200'
            }`}
    >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-orange-500 text-white shadow-lg' : 'bg-white shadow-sm text-slate-400'}`}>
            {icon}
        </div>
        <div>
            <div className={`text-base font-black leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{title}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{desc}</div>
        </div>
    </button>
);

const CleanInput = ({ type, label, placeholder, value, onChange, endContent }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block pl-1">{label}</label>
        <div className="relative group">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-16 px-6 rounded-3xl bg-slate-50 border-2 border-slate-100 text-2xl font-black text-slate-900 placeholder-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white transition-all duration-300"
            />
            {endContent && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    {endContent}
                </div>
            )}
        </div>
    </div>
);
