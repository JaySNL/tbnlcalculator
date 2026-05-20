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
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {step}/4
        </span>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
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
    <div className="space-y-10">
      <Section step={1} title={tProfile("title")} subtitle={tProfile("subtitle")}>
        <ProfileSelector
          value={{ profile: formData.profile, consumption: formData.consumption }}
          onChange={({ profile, consumption }) =>
            onFormDataChange({ ...formData, profile, consumption })
          }
        />
      </Section>

      <Section step={2} title={tSolar("title")} subtitle={tSolar("subtitle")}>
        <SolarConfig
          value={formData.solar}
          onChange={(solar) => onFormDataChange({ ...formData, solar })}
        />
      </Section>

      <Section step={3} title={tBattery("title")} subtitle={tBattery("subtitle")}>
        <BatterySelector
          value={formData.batterySizes}
          onChange={(batterySizes) =>
            onFormDataChange({ ...formData, batterySizes })
          }
        />
      </Section>

      <Section step={4} title={tFinancial("title")} subtitle={tFinancial("subtitle")}>
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
