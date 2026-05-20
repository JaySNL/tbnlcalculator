"use client";

import { useTranslations } from "next-intl";
import { ProfileSelector } from "./ProfileSelector";
import { SolarConfig } from "./SolarConfig";
import { BatterySelector } from "./BatterySelector";
import { FinancialConfig } from "./FinancialConfig";
import type {
  HouseholdProfileKey,
  SolarConfig as SolarConfigType,
  FinancialConfig as FinancialConfigType,
} from "@/lib/simulation/types";

export interface FormData {
  profile: HouseholdProfileKey;
  consumption: number;
  solar: SolarConfigType;
  batterySizes: number[];
  financial: FinancialConfigType;
}

interface InputSectionProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

function Section({
  label,
  title,
  subtitle,
  children,
}: {
  label: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <span className="text-[11px] font-medium tracking-widest text-brand uppercase">
          {label}
        </span>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export function InputSection({ formData, onFormDataChange }: InputSectionProps) {
  const tProfile = useTranslations("calculator.profile");
  const tSolar = useTranslations("calculator.solar");
  const tBattery = useTranslations("calculator.battery");
  const tFinancial = useTranslations("calculator.financial");

  return (
    <div className="space-y-14">
      <Section label="01" title={tProfile("title")} subtitle={tProfile("subtitle")}>
        <ProfileSelector
          value={{ profile: formData.profile, consumption: formData.consumption }}
          onChange={({ profile, consumption }) =>
            onFormDataChange({ ...formData, profile, consumption })
          }
        />
      </Section>

      <Section label="02" title={tSolar("title")} subtitle={tSolar("subtitle")}>
        <SolarConfig
          value={formData.solar}
          onChange={(solar) => onFormDataChange({ ...formData, solar })}
        />
      </Section>

      <Section label="03" title={tBattery("title")} subtitle={tBattery("subtitle")}>
        <BatterySelector
          value={formData.batterySizes}
          onChange={(batterySizes) =>
            onFormDataChange({ ...formData, batterySizes })
          }
        />
      </Section>

      <Section label="04" title={tFinancial("title")} subtitle={tFinancial("subtitle")}>
        <FinancialConfig
          value={formData.financial}
          onChange={(financial) =>
            onFormDataChange({ ...formData, financial })
          }
        />
      </Section>
    </div>
  );
}
