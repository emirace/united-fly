"use client";

import { useEffect, useState } from "react";
import { useSetting, ISetting } from "@/context/setting";
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
import { PageHeader } from "@/components/dashboard/table";
import { Button, Field, Input, Panel } from "@/components/ui";

/** Section shell shared by every settings card. */
function SettingsCard({
  title,
  description,
  onSave,
  loading,
  children,
  extraAction,
}: {
  title: string;
  description: string;
  onSave: () => void;
  loading: boolean;
  children: React.ReactNode;
  extraAction?: React.ReactNode;
}) {
  return (
    <Panel>
      <div className="border-b border-line-soft px-6 py-5">
        <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
        <p className="m-0 mt-1 text-sm text-dim">{description}</p>
      </div>
      <div className="space-y-4 p-6">
        {children}
        <div className="flex flex-wrap justify-end gap-2.5 pt-1">
          {extraAction}
          <Button onClick={onSave} disabled={loading}>
            {loading && <Loading color="border-white" size="sm" />}
            Update
          </Button>
        </div>
      </div>
    </Panel>
  );
}

export default function Settings() {
  const { settings, fetchSettings, updateSettinngs } = useSetting();
  const { addNotification } = useToastNotification();

  const [banking, setBanking] = useState(settings.bankingInfo);
  const [crypto, setCrypto] = useState(settings.cryptoInfo);
  const [cashApp, setCashApp] = useState(settings.cashApp);
  const [mail, setMail] = useState(settings.mail);
  const [whatsApp, setWhatsApp] = useState(settings.whatsApp);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings().catch((error) =>
      addNotification({ message: error as string, error: true })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setBanking(settings.bankingInfo);
    setCrypto(settings.cryptoInfo);
    setCashApp(settings.cashApp);
    setMail(settings.mail);
    setWhatsApp(settings.whatsApp);
  }, [settings]);

  const save = async (key: string, patch: Partial<ISetting>) => {
    try {
      setSaving(key);
      await updateSettinngs({ ...settings, ...patch });
      addNotification({ message: "Settings updated successfully!" });
    } catch (error) {
      addNotification({
        message: (error as string) || "An error occurred while saving.",
        error: true,
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Payment destinations and notification channels"
      />

      <div className="space-y-4">
        {/* Banking ------------------------------------------------- */}
        <SettingsCard
          title="Banking information"
          description="Shown to customers paying by mobile or bank transfer"
          loading={saving === "banking"}
          onSave={() => {
            if (
              !banking.accountName ||
              !banking.accountNumber ||
              !banking.bankName
            ) {
              addNotification({
                message: "Bank name, account number and name are required.",
                error: true,
              });
              return;
            }
            save("banking", { bankingInfo: banking });
          }}
        >
          <Field label="Bank name">
            <Input
              value={banking.bankName}
              onChange={(e) =>
                setBanking({ ...banking, bankName: e.target.value })
              }
            />
          </Field>
          <Field label="Account number">
            <Input
              className="font-mono"
              value={banking.accountNumber}
              onChange={(e) =>
                setBanking({ ...banking, accountNumber: e.target.value })
              }
            />
          </Field>
          <Field label="Account name">
            <Input
              value={banking.accountName}
              onChange={(e) =>
                setBanking({ ...banking, accountName: e.target.value })
              }
            />
          </Field>
          <Field label="Routing">
            <Input
              className="font-mono"
              value={banking.routing}
              onChange={(e) =>
                setBanking({ ...banking, routing: e.target.value })
              }
            />
          </Field>
          <Field label="Address">
            <Input
              value={banking.address}
              onChange={(e) =>
                setBanking({ ...banking, address: e.target.value })
              }
            />
          </Field>
        </SettingsCard>

        {/* Crypto -------------------------------------------------- */}
        <SettingsCard
          title="Crypto information"
          description="Wallets and conversion rates offered at checkout"
          loading={saving === "crypto"}
          extraAction={
            <Button
              variant="outline"
              onClick={() =>
                setCrypto([
                  ...crypto,
                  { name: "", network: "", address: "", rate: 0 },
                ])
              }
            >
              Add currency
            </Button>
          }
          onSave={() => {
            if (
              !crypto.length ||
              crypto.some((c) => !c.name || !c.network || !c.address || !c.rate)
            ) {
              addNotification({
                message: "All crypto fields are required.",
                error: true,
              });
              return;
            }
            save("crypto", { cryptoInfo: crypto });
          }}
        >
          {crypto.map((entry, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-card border border-line-soft p-4 sm:grid-cols-2"
            >
              <Field label="Currency name">
                <Input
                  value={entry.name}
                  onChange={(e) =>
                    setCrypto(
                      crypto.map((c, i) =>
                        i === index ? { ...c, name: e.target.value } : c
                      )
                    )
                  }
                />
              </Field>
              <Field label="Network">
                <Input
                  value={entry.network}
                  onChange={(e) =>
                    setCrypto(
                      crypto.map((c, i) =>
                        i === index ? { ...c, network: e.target.value } : c
                      )
                    )
                  }
                />
              </Field>
              <Field label="Wallet address" className="sm:col-span-2">
                <Input
                  className="font-mono"
                  value={entry.address}
                  onChange={(e) =>
                    setCrypto(
                      crypto.map((c, i) =>
                        i === index ? { ...c, address: e.target.value } : c
                      )
                    )
                  }
                />
              </Field>
              <Field label="Rate per dollar ($)">
                <Input
                  type="number"
                  step="any"
                  value={entry.rate}
                  onChange={(e) =>
                    setCrypto(
                      crypto.map((c, i) =>
                        i === index
                          ? { ...c, rate: parseFloat(e.target.value) || 0 }
                          : c
                      )
                    )
                  }
                />
              </Field>
              {crypto.length > 1 && (
                <div className="flex items-end">
                  <Button
                    variant="danger"
                    onClick={() =>
                      setCrypto(crypto.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </SettingsCard>

        {/* Cash App ------------------------------------------------ */}
        <SettingsCard
          title="Cash App information"
          description="Tag customers send Cash App payments to"
          loading={saving === "cashApp"}
          onSave={() => {
            if (!cashApp.tag || !cashApp.name) {
              addNotification({
                message: "All fields are required.",
                error: true,
              });
              return;
            }
            save("cashApp", { cashApp });
          }}
        >
          <Field label="Name">
            <Input
              value={cashApp.name}
              onChange={(e) =>
                setCashApp({ ...cashApp, name: e.target.value })
              }
            />
          </Field>
          <Field label="Cash tag">
            <Input
              className="font-mono"
              value={cashApp.tag}
              onChange={(e) => setCashApp({ ...cashApp, tag: e.target.value })}
            />
          </Field>
        </SettingsCard>

        {/* Email --------------------------------------------------- */}
        <SettingsCard
          title="Email notifications"
          description="The mailbox that sends and receives system email"
          loading={saving === "mail"}
          onSave={() => {
            if (!mail.name || !mail.password) {
              addNotification({
                message: "All fields are required.",
                error: true,
              });
              return;
            }
            save("mail", { mail });
          }}
        >
          <Field label="Email address">
            <Input
              value={mail.name}
              onChange={(e) => setMail({ ...mail, name: e.target.value })}
            />
          </Field>
          <Field label="App password">
            <Input
              type="password"
              value={mail.password}
              onChange={(e) => setMail({ ...mail, password: e.target.value })}
            />
          </Field>
        </SettingsCard>

        {/* WhatsApp ------------------------------------------------ */}
        <SettingsCard
          title="WhatsApp link"
          description="Floating contact button shown on the help page"
          loading={saving === "whatsApp"}
          onSave={() => {
            if (!whatsApp) {
              addNotification({ message: "A link is required.", error: true });
              return;
            }
            save("whatsApp", { whatsApp });
          }}
        >
          <Field label="Link">
            <Input
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
              placeholder="https://wa.me/2348000000000"
            />
          </Field>
        </SettingsCard>
      </div>
    </div>
  );
}
